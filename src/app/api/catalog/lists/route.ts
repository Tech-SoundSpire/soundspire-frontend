import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongList from "@/models/reviews/SongList";
import jwt from "jsonwebtoken";

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionTestingAndHelper();
    const { title, description, is_ranked, is_private } = await request.json();

    if (!title || title.trim().length < 1) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const list = await SongList.create({
      user_id: userId,
      title: title.trim(),
      description: description || null,
      is_ranked: is_ranked || false,
      is_private: is_private || false,
    });

    return NextResponse.json({ success: true, list });
  } catch (error: any) {
    console.error("List create error:", error);
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
