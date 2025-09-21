import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const state = Math.random().toString(36).slice(2);
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === '1';
  const url = getSpotifyAuthUrl(state, { forceConsent: force });
  if (searchParams.get('debug') === '1') {
    const parsed = new URL(url);
    return NextResponse.json({
      authorize_url: url,
      redirect_uri: parsed.searchParams.get('redirect_uri'),
      scope: parsed.searchParams.get('scope'),
      show_dialog: parsed.searchParams.get('show_dialog'),
      state,
      client_id: parsed.searchParams.get('client_id'),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'NOT SET',
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? 'SET' : 'NOT SET',
      }
    });
  }
  const res = NextResponse.redirect(url);
  // set short-lived state cookie for csrf protection
  res.cookies.set('spotify_oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 300, path: '/' });
  return res;
}


