import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserVerification } from "@/models/UserVerification";

interface SignupTokenPayload {
  email: string;
  username: string;
  password_hash: string;
  full_name: string;
  gender: "male" | "female" | null | undefined;
  mobile_number: string;
  date_of_birth: Date;
  city: string;
}
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token != "string")
      return NextResponse.json(
        { error: "Missing token or Invalid token" },
        { status: 400 }
      );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as SignupTokenPayload;

    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    await connectionTestingAndHelper();

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: decoded.email },
    });
    if (existingUser) {
      console.log("User Exists");
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create user in DB
    const newUser = await User.create({
      username: decoded.username,
      email: decoded.email,
      password_hash: decoded.password_hash,
      full_name: decoded.full_name,
      gender: decoded.gender,
      mobile_number: decoded.mobile_number,
      date_of_birth: decoded.date_of_birth,
      city: decoded.city,
      is_verified: true,
    });

    console.log("Email verified and Account created");

    
    // setting cookies with the session token
    const authToken = jwt.sign(
      { id: newUser.user_id, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    
    console.log("Creating another table:");
    await UserVerification.create({
        user_id: newUser.user_id,
        verification_type: "Email Verification",
        is_used: true,
        verification_token: authToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      });

    const response = NextResponse.json({
      message: "Email verified and account created",
      success: true,
    });

    response.cookies.set({
      name: "token",
      value: authToken,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
