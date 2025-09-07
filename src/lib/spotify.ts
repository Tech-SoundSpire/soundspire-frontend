import { NextRequest } from 'next/server';
import UserSpotifyToken from '@/models/UserSpotifyToken';
import { getDataFromToken } from '@/utils/getDataFromToken';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export function getSpotifyAuthUrl(state: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  
  // Add debugging to help identify the issue
  console.log('🔧 [Spotify Auth] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SPOTIFY_CLIENT_ID: clientId ? 'SET' : 'NOT SET',
    clientIdLength: clientId?.length || 0
  });
  
  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID environment variable is not set');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: `${baseUrl}/api/auth/callback/spotify`,
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
  const baseUrl = process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables are not set');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${baseUrl}/api/auth/callback/spotify`,
    client_id: clientId,
    client_secret: clientSecret,
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

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables are not set');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: record.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
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
  console.log('🔑 [Spotify Auth] Getting valid access token');
  const userId = getDataFromToken(request);
  console.log('🔑 [Spotify Auth] User ID:', userId);
  if (!userId) throw new Error('Unauthorized');
  
  const record = await UserSpotifyToken.findOne({ where: { user_id: userId } });
  console.log('🔑 [Spotify Auth] Token record found:', !!record);
  if (!record) throw new Error('Spotify not connected');
  
  const now = Date.now();
  const expiresAt = record.expires_at ? new Date(record.expires_at).getTime() : 0;
  const needsRefresh = !record.expires_at || expiresAt - 30000 <= now;
  console.log('🔑 [Spotify Auth] Token expires at:', record.expires_at);
  console.log('🔑 [Spotify Auth] Current time:', new Date(now).toISOString());
  console.log('🔑 [Spotify Auth] Needs refresh:', needsRefresh);
  
  if (needsRefresh) {
    console.log('🔑 [Spotify Auth] Refreshing token');
    return await refreshAccessTokenForUser(userId);
  }
  console.log('🔑 [Spotify Auth] Using existing token');
  return record.access_token;
}

export async function spotifyGet<T = any>(request: NextRequest, url: string): Promise<T> {
  console.log('🎵 [Spotify API] Making request to:', url);
  const token = await getValidAccessToken(request);
  console.log('🎵 [Spotify API] Using token (first 20 chars):', token.substring(0, 20) + '...');
  
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  console.log('🎵 [Spotify API] Response status:', res.status);
  
  if (res.status === 401) {
    console.log('🎵 [Spotify API] Token expired, refreshing...');
    // try one refresh
    const userId = getDataFromToken(request);
    if (!userId) throw new Error('Unauthorized');
    const refreshed = await refreshAccessTokenForUser(userId);
    console.log('🎵 [Spotify API] Retrying with refreshed token');
    const retry = await fetch(url, { headers: { Authorization: `Bearer ${refreshed}` } });
    console.log('🎵 [Spotify API] Retry response status:', retry.status);
    if (!retry.ok) throw new Error(`Spotify API error ${retry.status}`);
    return retry.json();
  }
  if (!res.ok) {
    console.error('🎵 [Spotify API] Request failed with status:', res.status);
    const errorText = await res.text();
    console.error('🎵 [Spotify API] Error response:', errorText);
    throw new Error(`Spotify API error ${res.status}`);
  }
  console.log('🎵 [Spotify API] Request successful');
  return res.json();
}



