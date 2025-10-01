import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const body = await req.json();

    // ✅ Update user including profile picture
    const [rows, updatedUsers] = await User.update(
      {
        full_name: body.full_name,
        gender: body.gender,
        date_of_birth: body.date_of_birth,
        city: body.city,
        country: body.country,
        mobile_number: body.phone_number,
        profile_picture_url: body.profile_picture_url, // <--- ADD THIS
      },
      { where: { user_id: decoded.id }, returning: true }
    );

    const updatedUser = updatedUsers[0];

    // ✅ Issue new JWT cookie with updated info
    const authToken = jwt.sign(
      { id: updatedUser.user_id, email: updatedUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.user_id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        provider: "local",
        profile_picture_url: updatedUser.profile_picture_url, // return it back
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
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
