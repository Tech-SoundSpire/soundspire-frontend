import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/spotify";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const nameHint = request.nextUrl.searchParams.get("name") || "";

    if (!nameHint) {
      return NextResponse.json({ error: "Artist name required" }, { status: 400 });
    }

    // Use multi-type search (same as main search bar which works)
    const results = await searchCatalog(nameHint, "track,artist,album", 20);

    // Extract artist info
    const matched = results.artists?.items?.find((a: any) => a.id === id)
      || results.artists?.items?.[0];

    // Extract tracks by this artist
    const tracks = (results.tracks?.items || [])
      .filter((t: any) => t.artists?.some((a: any) => a.id === id))
      .map((t: any) => ({
        id: t.id,
        name: t.name,
        album_name: t.album?.name,
        album_art: t.album?.images?.[0]?.url,
        duration_ms: t.duration_ms,
        explicit: t.explicit,
      }));

    return NextResponse.json({
      id,
      name: matched?.name || nameHint,
      images: matched?.images || [],
      genres: matched?.genres || [],
      spotify_url: matched?.external_urls?.spotify || "",
      top_tracks: tracks,
    });
  } catch (error: any) {
    console.error("Artist fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch artist" }, { status: 500 });
  }
}
