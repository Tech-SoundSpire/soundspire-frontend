import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/spotify";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const nameHint = request.nextUrl.searchParams.get("name") || "";

    if (!nameHint) {
      return NextResponse.json({ albums: [], total: 0 });
    }

    // Use multi-type search (same as main search bar which works)
    const results = await searchCatalog(nameHint, "track,artist,album", 20);

    const albums = (results.albums?.items || [])
      .filter((a: any) => a.artists?.some((ar: any) => ar.id === id))
      .map((a: any) => ({
        id: a.id,
        name: a.name,
        album_type: a.album_type,
        total_tracks: a.total_tracks,
        release_date: a.release_date,
        images: a.images,
        artists: a.artists?.map((ar: any) => ({ id: ar.id, name: ar.name })),
      }));

    return NextResponse.json({ albums, total: albums.length });
  } catch (error: any) {
    console.error("Artist albums fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch albums" }, { status: 500 });
  }
}
