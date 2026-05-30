import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    const type = request.nextUrl.searchParams.get("type") || "track,artist,album";
    const limit = request.nextUrl.searchParams.get("limit") || "20";

    if (!q) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    const results = await searchCatalog(q, type, parseInt(limit));
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Catalog search error:", error);
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
