import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";
import jwt from "jsonwebtoken";
import {
  getDefaultProfileImageUrl,
  getImageUrl,
} from "@/utils/userProfileImageUtils";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();

    const reqBody = await request.json();

    // ✅ MATCHES User model field name
    const { username, email, password_hash, profile_picture_url } = reqBody;

    // 1️⃣ Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists!", redirect: "/login" },
        { status: 400 }
      );
    }

    // 2️⃣ Check if username already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken! Please choose another." },
        { status: 400 }
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcryptjs.hash(password_hash, 10);

    // 4️⃣ Create new user (✅ correct field name)
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      is_verified: false,
      is_artist: false,
      spotify_linked: false,
      profile_picture_url: profile_picture_url
        ? getImageUrl(profile_picture_url)
        : getDefaultProfileImageUrl(),
    });

    // 5️⃣ Create JWT token for email verification
    const token = jwt.sign(
      { userId: newUser.user_id },
      process.env.JWT_SECRET!,
      { expiresIn: "20m" }
    );

    const verificationUrl = `${process.env.DOMAIN}/verifyemail?token=${token}`;

    // 6️⃣ Send verification email
    await sendEmail({
      email,
      emailType: "VERIFY",
      link: verificationUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
      redirect: "/PreferenceSelectionPage",
      userId: newUser.user_id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
