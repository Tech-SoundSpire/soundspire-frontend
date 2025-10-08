import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { UserVerification } from "@/models/UserVerification";
import UserPreferences from "@/models/UserPreferences";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/google/callback";
const FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Google OAuth endpoints
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

console.log("🔍 Using redirect_uri:", REDIRECT_URI);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    

    if (error) {
      return NextResponse.redirect(`${FRONTEND_URL}?error=${error}`);
    }

    // Validate state
    const cookies = request.headers.get("cookie");
    const storedState = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("oauth_state="))
      ?.split("=")[1];

    if (!state || state !== storedState) {
      return NextResponse.redirect(`${FRONTEND_URL}?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
      throw new Error(tokenData.error || "Failed to get access token");
    }

    // Get user info from Google
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    // Attempt to find or create user in DB
    const hashedPassword = await bcrypt.hash(userData.email, 10);
    const baseUsername = userData.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");

    let userInDb = await User.findOne({ where: { email: userData.email } });
    let isNewUser = false;

    if (!userInDb) {
      isNewUser = true;
      try {
        userInDb = await User.create({
          email: userData.email,
          full_name: userData.name,
          username: baseUsername,
          password_hash: hashedPassword,
          profile_picture_url: userData.picture,
          is_verified: true,
          google_id: userData.id,
        });
      } catch {
        // Fallback if username already taken
        userInDb = await User.create({
          email: userData.email,
          full_name: userData.name,
          username: baseUsername + "_" + Math.floor(Math.random() * 10000),
          password_hash: hashedPassword,
          profile_picture_url: userData.picture,
          is_verified: true,
          google_id: userData.id,
        });
      }
      if (!userInDb) {
        throw new Error("Failed to create user");
      }

      await UserVerification.create({
        user_id: userInDb.user_id,
        verification_type: "oauth_google",
        is_used: true,
        verification_token: "google-oauth",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });
    }

    // Check if user has preferences
    let redirectPath = "/feed"; // Default
    if (isNewUser) {
      redirectPath = "/complete-profile";
    } else {
      const preferences = await UserPreferences.findOne({
        where: { user_id: userInDb!.user_id },
      });

      if (
        !preferences ||
        (preferences.genres.length === 0 &&
          preferences.languages.length === 0 &&
          preferences.favorite_artists.length === 0)
      ) {
        redirectPath = "/PreferenceSelectionPage";
      }
    }

    // ✅ Safe usage with non-null assertion
    const user = {
      id: userInDb!.user_id,
      name: userInDb!.full_name,
      email: userInDb!.email,
      image: userInDb!.profile_picture_url,
      provider: "google",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };

    const response = NextResponse.redirect(`${FRONTEND_URL}${redirectPath}`);

    // Set secure cookie
    // response.cookies.set("user", JSON.stringify(user), {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24 * 7, // 1 week
    // });



    

    const authToken = jwt.sign(
      { id: userInDb!.user_id, email: userInDb!.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    response.cookies.set({
      name: "token",
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });




    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${FRONTEND_URL}?error=oauth_error`);
  }
}
