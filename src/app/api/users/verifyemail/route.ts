import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserVerification } from "@/models/UserVerification";

interface SignupTokenPayload {
  email: string;
  username: string;
  password_hash: string;
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
    const existingUser = await User.findOne({ where: { email: decoded.email } });

    let verifiedUser = existingUser;

    if (existingUser) {
      // If user exists, just mark as verified (idempotent)
      if (!existingUser.is_verified) {
        await existingUser.update({ is_verified: true });
      }
      console.log("Email verified for existing user");
    } else {
      // Create user in DB (legacy path)
      verifiedUser = await User.create({
        username: decoded.username,
        email: decoded.email,
        password_hash: decoded.password_hash,
        is_verified: true,
      });
      console.log("Email verified and account created");
    }

    // Issue session token and record verification
    const authToken = jwt.sign(
      { id: verifiedUser!.user_id, email: verifiedUser!.email, role: verifiedUser!.is_artist ? "artist" : "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    await UserVerification.create({
      user_id: verifiedUser!.user_id,
      verification_type: "Email Verification",
      is_used: true,
      verification_token: authToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.json({
      message: "Email verified successfully",
      success: true,
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
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
