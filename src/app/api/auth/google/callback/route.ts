import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { UserVerification } from "@/models/UserVerification";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/google/callback";
const FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Google OAuth endpoints
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check if there was an error in the OAuth process
    if (error) {
      return NextResponse.redirect(`${FRONTEND_URL}?error=${error}`);
    }

    // Get the stored state from cookies
    const cookies = request.headers.get("cookie");
    const storedState = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("oauth_state="))
      ?.split("=")[1];

    // Verify state to prevent CSRF attacks
    if (!state || state !== storedState) {
      return NextResponse.redirect(`${FRONTEND_URL}?error=invalid_state`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code!,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token");
    }

    // Get user info using access token
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    // Checking if the user exists in DB
    let userInDb = await User.findOne({
      where: {
        email: userData.email,
      },
    });

    const hashedDefaultPassword = await bcrypt.hash(userData.email,10);
    if (userInDb){
      return NextResponse.redirect(`${FRONTEND_URL}/login?info=account_exists`);
    } else{
      const baseUsername = userData.email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "_");
      const newUser = User.build({
        email: userData.email,
        full_name: userData.name,
        profile_picture_url: userData.picture,
        username: baseUsername,
        isVerified: true,
        password_hash: hashedDefaultPassword,
      });
      try {
        await newUser.save({ context: { isGoogleSignup: true } });
      } catch{
        // Fallback: append random suffix to username and retry
        newUser.username =
          baseUsername + "_" + Math.floor(Math.random() * 10000);
        await newUser.save({ context: { isGoogleSignup: true } });
      }
      userInDb = newUser;
       await UserVerification.create({
        user_id: userInDb.user_id,
        verification_type: "oauth_google",
        is_used: true,
        verification_token: "google-oauth",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });
    }

    // Create the user object
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.picture,
      provider: "google",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };

    // Create response with user data
    console.log("Google Signing IN");
    const response = NextResponse.redirect(`${FRONTEND_URL}/explore`);

    // Set user data in an httpOnly cookie
    response.cookies.set("user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${FRONTEND_URL}?error=oauth_error`);
  }
}
