import { NextRequest, NextResponse } from "next/server";
import { getArtistReleases, searchCatalog } from "@/lib/spotify";

const toAlbum = (a: any) => ({
  id: a.id,
  name: a.name,
  album_type: a.album_type,
  total_tracks: a.total_tracks,
  release_date: a.release_date,
  images: a.images,
  artists: a.artists?.map((ar: any) => ({ id: ar.id, name: ar.name })),
});

// GET /api/catalog/artist/[id]/albums?name=&limit= - the artist's discography by Spotify
// artist ID: own albums and singles first, then releases they appear on (collaborations).
// Name search is only a fallback. Response shape is unchanged (web, Android, iOS).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const nameHint = request.nextUrl.searchParams.get("name") || "";
    const limit = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("limit")) || 30, 30));

    try {
      const albums = (await getArtistReleases(id)).slice(0, limit).map(toAlbum);
      return NextResponse.json({ albums, total: albums.length });
    } catch (byIdError) {
      console.error("Artist albums by-ID lookup failed, falling back to name search:", byIdError);
      if (!nameHint) return NextResponse.json({ albums: [], total: 0 });
    }

    const results = await searchCatalog(nameHint, "track,artist,album", 10);
    const albums = (results.albums?.items || [])
      .filter((a: any) => a.artists?.some((ar: any) => ar.id === id))
      .map(toAlbum);
    return NextResponse.json({ albums, total: albums.length });
  } catch (error: any) {
    console.error("Artist albums fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch albums" }, { status: 500 });
  }
}
