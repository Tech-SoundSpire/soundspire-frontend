import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SpotifySoundchartsMap from "@/models/SpotifySoundchartsMap";

// Resolves a Spotify artist ID -> SoundCharts artist UUID, so an off-platform artist
// (searched via Spotify) can be linked to the SoundCharts-keyed vote page.
//
// Strategy:
//   1. Cache hit (spotify_soundcharts_map) → return immediately.
//   2. SoundCharts name-search → for each candidate, fetch identifiers and match the
//      Spotify identifier === spotifyId (accurate; disambiguates same-name artists).
//   3. Fall back to the top name-search result if no Spotify ID matches.
//   4. Cache the result (including a negative result) and return it.
//
// GET /api/artists/resolve?spotifyId=<id>&name=<name>  ->  { soundchartsUuid: string | null }

const SC_BASE = "https://customer.api.soundcharts.com/api/v2";
const MAX_CANDIDATES = 5; // identifier lookups to attempt for an exact Spotify match

function scHeaders() {
  const appId = process.env.SOUNDCHARTS_CLIENT_ID;
  const apiKey = process.env.SOUNDCHARTS_TOKEN;
  if (!appId || !apiKey) return null;
  return { "x-app-id": appId, "x-api-key": apiKey, "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
  const spotifyId = (request.nextUrl.searchParams.get("spotifyId") || "").trim();
  const name = (request.nextUrl.searchParams.get("name") || "").trim();

  if (!spotifyId) {
    return NextResponse.json({ error: "spotifyId is required" }, { status: 400 });
  }

  try {
    await connectionTestingAndHelper();

    // 1. Cache
    const cached = await SpotifySoundchartsMap.findByPk(spotifyId);
    if (cached) {
      return NextResponse.json(
        { soundchartsUuid: cached.soundcharts_uuid },
        { headers: { "Cache-Control": "public, max-age=86400" } }
      );
    }

    const headers = scHeaders();
    if (!headers) {
      return NextResponse.json({ error: "SoundCharts not configured" }, { status: 500 });
    }
    if (!name) {
      return NextResponse.json({ soundchartsUuid: null });
    }

    // 2. Name search
    let candidates: Array<{ uuid: string; name: string }> = [];
    try {
      const searchRes = await fetch(`${SC_BASE}/artist/search/${encodeURIComponent(name)}?offset=0&limit=20`, { headers });
      if (searchRes.ok) {
        const data = await searchRes.json();
        candidates = (data?.items || [])
          .map((i: any) => ({ uuid: i.uuid as string, name: i.name as string }))
          .filter((c: any) => c.uuid);
      }
    } catch { /* ignore — handled below */ }

    let resolvedUuid: string | null = null;

    // 2b. Exact match by Spotify ID via identifiers.
    for (const c of candidates.slice(0, MAX_CANDIDATES)) {
      try {
        const idRes = await fetch(`${SC_BASE}/artist/${encodeURIComponent(c.uuid)}/identifiers?offset=0&limit=100&onlyDefault=false`, { headers });
        if (!idRes.ok) continue;
        const idData = await idRes.json();
        const items: any[] = idData?.items || [];
        const spotifyMatch = items.some((it) => {
          const platform = (it.platformName || it.platformCode || it.platform || "").toString().toLowerCase();
          if (platform !== "spotify") return false;
          const ident = (it.identifier || "").toString();
          const url = (it.url || "").toString();
          return ident === spotifyId || url.includes(spotifyId);
        });
        if (spotifyMatch) {
          resolvedUuid = c.uuid;
          break;
        }
      } catch { /* try next candidate */ }
    }

    // 3. Fallback: top name match (only if a single clear candidate or no exact match found).
    if (!resolvedUuid && candidates.length > 0) {
      // Prefer an exact (case-insensitive) name match; else the first result.
      resolvedUuid =
        candidates.find((c) => c.name?.toLowerCase() === name.toLowerCase())?.uuid ||
        candidates[0].uuid;
    }

    // 4. Cache (including negative result) and return.
    try {
      await SpotifySoundchartsMap.upsert({
        spotify_id: spotifyId,
        soundcharts_uuid: resolvedUuid,
        artist_name: name || null,
      });
    } catch { /* caching is best-effort */ }

    return NextResponse.json(
      { soundchartsUuid: resolvedUuid },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (error: any) {
    console.error("Artist resolve error:", error);
    return NextResponse.json({ error: error.message || "Failed to resolve artist" }, { status: 500 });
  }
}
