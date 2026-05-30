import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import ListenDiary from "@/models/reviews/ListenDiary";
import ListenList from "@/models/reviews/ListenList";
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
    const { spotify_track_id, listened_date, rating, liked, tags, notes } = await request.json();

    if (!spotify_track_id) {
      return NextResponse.json({ error: "Missing spotify_track_id" }, { status: 400 });
    }

    const entry = await ListenDiary.create({
      user_id: userId,
      spotify_track_id,
      listened_date: listened_date || new Date().toISOString().split("T")[0],
      rating: rating || null,
      liked: liked || false,
      tags: tags || null,
      notes: notes || null,
    });

    // Auto-remove from listen list if present
    await ListenList.destroy({ where: { user_id: userId, spotify_track_id } });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("Diary log error:", error);
    return NextResponse.json({ error: "Failed to log listen" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionTestingAndHelper();
    const year = request.nextUrl.searchParams.get("year");
    const month = request.nextUrl.searchParams.get("month");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

    const where: any = { user_id: userId };

    if (year && month) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      where.listened_date = { [require("sequelize").Op.gte]: startDate, [require("sequelize").Op.lt]: endDate };
    }

    const entries = await ListenDiary.findAll({
      where,
      order: [["listened_date", "DESC"], ["created_at", "DESC"]],
      limit,
      raw: true,
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Diary fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch diary" }, { status: 500 });
  }
}
