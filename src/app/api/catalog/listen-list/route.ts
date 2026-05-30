import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
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
    const { spotify_track_id } = await request.json();

    if (!spotify_track_id) {
      return NextResponse.json({ error: "Missing spotify_track_id" }, { status: 400 });
    }

    const [entry, created] = await ListenList.findOrCreate({
      where: { user_id: userId, spotify_track_id },
      defaults: { user_id: userId, spotify_track_id },
    });

    return NextResponse.json({ success: true, entry, created });
  } catch (error: any) {
    console.error("Listen list add error:", error);
    return NextResponse.json({ error: "Failed to add to listen list" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionTestingAndHelper();

    const entries = await ListenList.findAll({
      where: { user_id: userId },
      order: [["added_at", "DESC"]],
      raw: true,
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Listen list fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch listen list" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionTestingAndHelper();
    const { spotify_track_id } = await request.json();

    await ListenList.destroy({ where: { user_id: userId, spotify_track_id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Listen list remove error:", error);
    return NextResponse.json({ error: "Failed to remove from listen list" }, { status: 500 });
  }
}
