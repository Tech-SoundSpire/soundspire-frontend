import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongCache from "@/models/reviews/SongCache";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const { spotify_track_id, track_name, artist_name, artist_id, album_art_url } = await request.json();

    if (!spotify_track_id || !track_name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await SongCache.upsert({
      spotify_track_id,
      track_name,
      artist_name: artist_name || "",
      artist_id: artist_id || "",
      album_art_url: album_art_url || null,
      album_name: null,
      album_id: null,
      duration_ms: null,
      isrc: null,
      explicit: false,
      release_date: null,
      spotify_url: null,
      credits_json: null,
      metadata_cached_at: new Date(),
      credits_cached_at: null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cache album error:", error);
    return NextResponse.json({ error: "Failed to cache" }, { status: 500 });
  }
}
