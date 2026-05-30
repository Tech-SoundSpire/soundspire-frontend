import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongListItem from "@/models/reviews/SongListItem";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET!);
    const { id: listId } = await params;

    await connectionTestingAndHelper();
    const { spotify_track_id, position, notes } = await request.json();

    if (!spotify_track_id) {
      return NextResponse.json({ error: "Missing spotify_track_id" }, { status: 400 });
    }

    const [item, created] = await SongListItem.findOrCreate({
      where: { list_id: listId, spotify_track_id },
      defaults: { list_id: listId, spotify_track_id, position: position || null, notes: notes || null },
    });

    if (!created) {
      return NextResponse.json({ error: "Song already in this list" }, { status: 409 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("List item add error:", error);
    return NextResponse.json({ error: "Failed to add to list" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET!);
    const { id: listId } = await params;

    await connectionTestingAndHelper();
    const { spotify_track_id } = await request.json();

    await SongListItem.destroy({ where: { list_id: listId, spotify_track_id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("List item remove error:", error);
    return NextResponse.json({ error: "Failed to remove from list" }, { status: 500 });
  }
}
