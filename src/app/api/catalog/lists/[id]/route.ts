import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongList from "@/models/reviews/SongList";
import SongListItem from "@/models/reviews/SongListItem";
import SongCache from "@/models/reviews/SongCache";
import { User } from "@/models/User";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectionTestingAndHelper();

    const list = await SongList.findByPk(id, { raw: true });
    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

    const items = await SongListItem.findAll({
      where: { list_id: id },
      order: [["position", "ASC"], ["added_at", "ASC"]],
      raw: true,
    });

    // Get song metadata for all items
    const trackIds = items.map((item: any) => item.spotify_track_id);
    const songs = trackIds.length > 0
      ? await SongCache.findAll({
          where: { spotify_track_id: trackIds },
          attributes: ["spotify_track_id", "track_name", "artist_name", "album_art_url", "duration_ms"],
          raw: true,
        })
      : [];
    const songMap = new Map(songs.map((s: any) => [s.spotify_track_id, s]));

    const enrichedItems = items.map((item: any) => ({
      ...item,
      song: songMap.get(item.spotify_track_id) || null,
    }));

    // Get list creator info
    const creator = await User.findByPk((list as any).user_id, {
      attributes: ["user_id", "username", "profile_picture_url"],
      raw: true,
    });

    return NextResponse.json({
      list: { ...list, creator },
      items: enrichedItems,
    });
  } catch (error: any) {
    console.error("List detail error:", error);
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
  }
}
