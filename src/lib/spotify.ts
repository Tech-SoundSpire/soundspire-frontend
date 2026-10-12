const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify token request failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

async function spotifyFetch(endpoint: string): Promise<any> {
  const token = await getAccessToken();
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new Error(`Spotify rate limited. Retry after ${retryAfter}s`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Spotify API error: ${response.status} - ${body}`);
  }

  return response.json();
}

export async function searchCatalog(query: string, type: string = "track,artist,album", limit: number = 10, market: string = "US") {
  const safeLimit = Math.min(limit, 10);
  const params = new URLSearchParams({ q: query, type, limit: String(safeLimit), market });
  return spotifyFetch(`/search?${params}`);
}

export async function getTrack(trackId: string, market: string = "US") {
  return spotifyFetch(`/tracks/${trackId}?market=${market}`);
}

export async function getTracks(trackIds: string[], market: string = "US") {
  const ids = trackIds.slice(0, 50).join(",");
  return spotifyFetch(`/tracks?ids=${ids}&market=${market}`);
}

export async function getArtist(artistId: string) {
  return spotifyFetch(`/artists/${artistId}`);
}

// Spotify Development Mode (since Mar 2026) caps this at 10 per page; page with `offset`.
export async function getArtistAlbums(artistId: string, limit: number = 10, market: string = "US", offset: number = 0,
  includeGroups: string = "album,single") {
  const params = new URLSearchParams({
    include_groups: includeGroups,
    limit: String(Math.min(limit, 10)),
    offset: String(offset),
    market,
  });
  return spotifyFetch(`/artists/${artistId}/albums?${params}`);
}

export async function getArtistTopTracks(artistId: string, market: string = "US") {
  return spotifyFetch(`/artists/${artistId}/top-tracks?market=${market}`);
}

export async function getAlbum(albumId: string, market: string = "US") {
  return spotifyFetch(`/albums/${albumId}?market=${market}`);
}

export async function getAlbumTracks(albumId: string, limit: number = 50, market: string = "US") {
  const params = new URLSearchParams({ limit: String(limit), market });
  return spotifyFetch(`/albums/${albumId}/tracks?${params}`);
}

// ---- Artist catalog by artist ID ----------------------------------------------------------
// Spotify Development Mode (Mar 2026) removed /artists/{id}/top-tracks and the popularity
// field, and caps search at 10 results, so name search can't find tracks for artists with
// short or common names ("gini", "RANJ"). These look everything up by artist ID instead:
// releases from /artists/{id}/albums (own + "appears on", so collaborations show up), and
// tracks from those releases' tracklists, keeping only tracks the artist is credited on.
//
// ponytail: per-instance in-memory cache (10 min); move to a shared cache if Spotify rate
// limits become a problem across serverless instances.
const CATALOG_TTL_MS = 10 * 60 * 1000;
const catalogCache = new Map<string, { at: number; value: Promise<any> }>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = catalogCache.get(key);
  if (hit && Date.now() - hit.at < CATALOG_TTL_MS) return hit.value;
  const value = load().catch((e) => { catalogCache.delete(key); throw e; }); // don't cache failures
  catalogCache.set(key, { at: Date.now(), value });
  return value;
}

const MAX_RELEASE_PAGES = 3;   // up to 30 releases
const MAX_TRACKLIST_FETCHES = 6;
const MAX_TRACKS = 10;

// Newest first; the artist's own releases before ones they only appear on.
export function getArtistReleases(artistId: string): Promise<any[]> {
  return cached(`releases:${artistId}`, async () => {
    const out: any[] = [];
    for (let page = 0; page < MAX_RELEASE_PAGES; page++) {
      const res = await getArtistAlbums(artistId, 10, "US", page * 10, "album,single,appears_on");
      out.push(...(res.items || []));
      if (!res.next) break;
    }
    // "Own" = the artist is a main artist on the release (album_group was removed in Dev Mode).
    const own = (a: any) => a.artists?.some((ar: any) => ar.id === artistId);
    const seen = new Set<string>();
    return out
      .filter((a) => a?.id && !seen.has(a.id) && seen.add(a.id))
      .sort((a, b) => Number(own(b)) - Number(own(a)) || String(b.release_date || "").localeCompare(String(a.release_date || "")));
  });
}

// Tracks the artist is credited on, from their newest releases.
export function getArtistTracks(artistId: string): Promise<any[]> {
  return cached(`tracks:${artistId}`, async () => {
    const releases = [...(await getArtistReleases(artistId))]
      .sort((a, b) => String(b.release_date || "").localeCompare(String(a.release_date || "")))
      .slice(0, MAX_TRACKLIST_FETCHES);
    const tracks: any[] = [];
    const seen = new Set<string>();
    for (const rel of releases) {
      if (tracks.length >= MAX_TRACKS) break;
      const album = await getAlbum(rel.id);
      for (const t of album.tracks?.items || []) {
        if (tracks.length >= MAX_TRACKS) break;
        if (!t?.id || seen.has(t.id) || !t.artists?.some((a: any) => a.id === artistId)) continue;
        seen.add(t.id);
        tracks.push({ ...t, album: { name: album.name, images: album.images } });
      }
    }
    return tracks;
  });
}
