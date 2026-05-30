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

export async function getArtistAlbums(artistId: string, limit: number = 20, market: string = "US") {
  const params = new URLSearchParams({
    include_groups: "album,single",
    limit: String(limit),
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
