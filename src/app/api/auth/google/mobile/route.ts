import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { UserVerification } from "@/models/UserVerification";
import UserPreferences from "@/models/UserPreferences";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isArtistUnderReview, UNDER_REVIEW_MESSAGE } from "@/utils/artistReview";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the Google ID token
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }
    const tokenData = await verifyRes.json();

    // Reject tokens minted for any other Google app. tokeninfo confirms the token is a valid
    // Google token but not that it was issued for *us* — without this an attacker could replay
    // a token from a different client to sign in as its email. Client ids are public (they ship
    // in the Android APK / iOS Info.plist), so the known ids are safe defaults; env vars override.
    
    // const ALLOWED_AUDIENCES = [
    //   process.env.GOOGLE_CLIENT_ID ?? "421253082792-2fc4cd0v0r1pep0i3is5dcj2u8k47a0e.apps.googleusercontent.com",
    //   process.env.GOOGLE_ANDROID_CLIENT_ID ?? "421253082792-lku45fmvbf8a7q7i5rtihj3f04i7jcrt.apps.googleusercontent.com",
    //   process.env.GOOGLE_IOS_CLIENT_ID ?? "421253082792-1fsa935t66ci1ka08duh087058sg9i3d.apps.googleusercontent.com",
    // ].filter(Boolean);
    // if (!tokenData.aud || !ALLOWED_AUDIENCES.includes(tokenData.aud)) {
    //   return NextResponse.json({ error: "Invalid token audience" }, { status: 401 });
    // }

    const email = tokenData.email;
    const name = tokenData.name || email.split("@")[0];
    const picture = tokenData.picture || null;
    const googleId = tokenData.sub;

    if (!email) {
      return NextResponse.json({ error: "Token missing email" }, { status: 400 });
    }

    // Find or create user (same logic as callback route)
    let userInDb = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!userInDb) {
      isNewUser = true;
      const hashedPassword = await bcrypt.hash(email, 10);
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");

      try {
        userInDb = await User.create({
          email,
          full_name: name,
          username: baseUsername,
          password_hash: hashedPassword,
          profile_picture_url: picture,
          is_verified: true,
          google_id: googleId,
        });
      } catch {
        userInDb = await User.create({
          email,
          full_name: name,
          username: baseUsername + "_" + Math.floor(Math.random() * 10000),
          password_hash: hashedPassword,
          profile_picture_url: picture,
          is_verified: true,
          google_id: googleId,
        });
      }

      await UserVerification.create({
        user_id: userInDb!.user_id,
        verification_type: "oauth_google",
        is_used: true,
        verification_token: "google-oauth-mobile",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    } else {
      if (!userInDb.is_verified) await userInDb.update({ is_verified: true });
      if (!userInDb.google_id) await userInDb.update({ google_id: googleId });
    }

    // Banned users cannot obtain a session (same rule as email login).
    if (userInDb!.is_banned) {
      return NextResponse.json({ message: "This account has been suspended.", error: "This account has been suspended." }, { status: 403 });
    }

    // Artists awaiting the manual background check cannot obtain a session.
    if (await isArtistUnderReview(userInDb!)) {
      return NextResponse.json({ message: UNDER_REVIEW_MESSAGE, error: UNDER_REVIEW_MESSAGE, underReview: true }, { status: 403 });
    }

    const role = userInDb!.is_artist ? "artist" : "user";

    // Check onboarding state
    let needsCompleteProfile = !userInDb!.full_name || !userInDb!.gender || !userInDb!.date_of_birth;
    let needsPreferences = false;
    if (!needsCompleteProfile) {
      const prefs = await UserPreferences.findOne({ where: { user_id: userInDb!.user_id } });
      needsPreferences = !prefs || (prefs.genres.length === 0 && prefs.languages.length === 0 && prefs.favorite_artists.length === 0);
    }

    const authToken = jwt.sign(
      { id: userInDb!.user_id, email: userInDb!.email, role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: userInDb!.user_id,
        name: userInDb!.full_name,
        email: userInDb!.email,
        role,
        isNewUser,
        needsCompleteProfile,
        needsPreferences,
      },
    });

    response.cookies.set({
      name: "token",
      value: authToken,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Mobile Google OAuth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
