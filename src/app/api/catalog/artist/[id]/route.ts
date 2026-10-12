import { NextRequest, NextResponse } from "next/server";
import { getArtist, getArtistTracks, searchCatalog } from "@/lib/spotify";

const toTrack = (t: any) => ({
  id: t.id,
  name: t.name,
  album_name: t.album?.name,
  album_art: t.album?.images?.[0]?.url,
  duration_ms: t.duration_ms,
  explicit: t.explicit,
});

// GET /api/catalog/artist/[id]?name= - artist header + tracks. Looks up by Spotify artist ID
// (exact); name search is only a fallback, because it misses artists with short or common
// names. Response shape is unchanged (used by web, Android and iOS).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const nameHint = request.nextUrl.searchParams.get("name") || "";

    try {
      const [artist, tracks] = await Promise.all([getArtist(id), getArtistTracks(id)]);
      return NextResponse.json({
        id,
        name: artist?.name || nameHint,
        images: artist?.images || [],
        genres: artist?.genres || [],
        spotify_url: artist?.external_urls?.spotify || "",
        top_tracks: tracks.map(toTrack),
      });
    } catch (byIdError) {
      console.error("Artist by-ID lookup failed, falling back to name search:", byIdError);
      if (!nameHint) throw byIdError;
    }

    const results = await searchCatalog(nameHint, "track,artist,album", 10);
    const matched = results.artists?.items?.find((a: any) => a.id === id) || results.artists?.items?.[0];
    const tracks = (results.tracks?.items || []).filter((t: any) => t.artists?.some((a: any) => a.id === id));
    return NextResponse.json({
      id,
      name: matched?.name || nameHint,
      images: matched?.images || [],
      genres: matched?.genres || [],
      spotify_url: matched?.external_urls?.spotify || "",
      top_tracks: tracks.map(toTrack),
    });
  } catch (error: any) {
    console.error("Artist fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch artist" }, { status: 500 });
  }
}
