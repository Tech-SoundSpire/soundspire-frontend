// app/api/auth/signup/route.ts (or wherever your signup API is)

import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";
import jwt from "jsonwebtoken";
import { getDefaultProfileImageUrl, getImageUrl } from "@/utils/userProfileImageUtils";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const reqBody = await request.json();

    const { username, email, password_hash, profileImage } = reqBody;

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
    const salt = 10;
    const hashedPassword = await bcryptjs.hash(password_hash, salt);

    // 4️⃣ Create new User with default profile image if not provided
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      is_verified: false,
      is_artist: false,
      spotify_linked: false,
      profileImage: profileImage ? getImageUrl(profileImage) : getDefaultProfileImageUrl(),
    });

    // 5️⃣ Create JWT token for verification
    const tokenPayload = { username, email, password_hash: hashedPassword };
    const token = await jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "20m",
    });

    const verificationUrl = `${process.env.DOMAIN}/verifyemail?token=${token}`;

    // 6️⃣ Send verification email
    await sendEmail({
      email,
      emailType: "VERIFY",
      link: verificationUrl,
    }).catch((err) => {
      console.log("Email send failed:", err);
    });

    return NextResponse.json({
      message: "Verification email sent. Please check your inbox.",
      success: true,
      redirect: "/PreferenceSelectionPage",
      userId: newUser.user_id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
