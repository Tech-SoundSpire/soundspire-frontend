import { NextRequest } from 'next/server';
import UserSpotifyToken from '@/models/UserSpotifyToken';
import { getDataFromToken } from '@/utils/getDataFromToken';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export function getSpotifyAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: `${process.env.NEXTAUTH_URL || 'https://localhost:3000'}/api/auth/callback/spotify`,
    scope: [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-library-read',
    ].join(' '),
    state,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXTAUTH_URL || 'https://localhost:3000'}/api/auth/callback/spotify`,
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token exchange failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
  }>;
}

export async function refreshAccessTokenForUser(userId: string) {
  const record = await UserSpotifyToken.findOne({ where: { user_id: userId } });
  if (!record) throw new Error('No Spotify token found');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: record.refresh_token,
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
  });
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify refresh failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
    scope?: string;
    expires_in: number;
    refresh_token?: string; // may be omitted
  };

  const newExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);
  record.access_token = data.access_token;
  record.expires_at = newExpiresAt;
  if (data.refresh_token) record.refresh_token = data.refresh_token;
  if (data.scope) record.scope = data.scope;
  if (data.token_type) record.token_type = data.token_type;
  await record.save();

  return record.access_token;
}

export async function getValidAccessToken(request: NextRequest) {
  const userId = getDataFromToken(request);
  if (!userId) throw new Error('Unauthorized');
  const record = await UserSpotifyToken.findOne({ where: { user_id: userId } });
  if (!record) throw new Error('Spotify not connected');
  const now = Date.now();
  if (!record.expires_at || new Date(record.expires_at).getTime() - 30000 <= now) {
    return await refreshAccessTokenForUser(userId);
  }
  return record.access_token;
}

export async function spotifyGet<T = any>(request: NextRequest, url: string): Promise<T> {
  const token = await getValidAccessToken(request);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    // try one refresh
    const userId = getDataFromToken(request);
    if (!userId) throw new Error('Unauthorized');
    const refreshed = await refreshAccessTokenForUser(userId);
    const retry = await fetch(url, { headers: { Authorization: `Bearer ${refreshed}` } });
    if (!retry.ok) throw new Error(`Spotify API error ${retry.status}`);
    return retry.json();
  }
  if (!res.ok) throw new Error(`Spotify API error ${res.status}`);
  return res.json();
}



