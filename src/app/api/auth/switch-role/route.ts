import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    const { role } = await request.json();

    if (role !== "user" && role !== "artist") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Issue new token with switched role
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, role });
    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Role switch error:", error);
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}
