import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserVerification } from "@/models/UserVerification";

interface VerificationTokenPayload {
  userId: string;
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
    ) as VerificationTokenPayload;

    await connectionTestingAndHelper();

    const user = await User.findOne({ where: { user_id: decoded.userId } });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.is_verified) {
      await user.update({ is_verified: true });
      console.log("Email verified for user:", user.email);
    }

    const authToken = jwt.sign(
      { id: user.user_id, email: user.email, role: user.is_artist ? "artist" : "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    await UserVerification.create({
      user_id: user.user_id,
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
