import { NextRequest, NextResponse } from "next/server";
import { getAlbum } from "@/lib/spotify";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const album = await getAlbum(id);

    return NextResponse.json({
      id: album.id,
      name: album.name,
      album_type: album.album_type,
      total_tracks: album.total_tracks,
      release_date: album.release_date,
      images: album.images,
      artists: album.artists?.map((a: any) => ({ id: a.id, name: a.name })),
      spotify_url: album.external_urls?.spotify,
      tracks: album.tracks?.items?.map((t: any) => ({
        id: t.id,
        name: t.name,
        track_number: t.track_number,
        duration_ms: t.duration_ms,
        explicit: t.explicit,
        artists: t.artists?.map((a: any) => ({ id: a.id, name: a.name })),
      })) || [],
    });
  } catch (error: any) {
    console.error("Album fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch album" }, { status: 500 });
  }
}
