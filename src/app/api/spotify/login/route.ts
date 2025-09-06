import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const state = Math.random().toString(36).slice(2);
  const url = getSpotifyAuthUrl(state);
  const { searchParams } = new URL(request.url);
  if (searchParams.get('debug') === '1') {
    const parsed = new URL(url);
    return NextResponse.json({
      authorize_url: url,
      redirect_uri: parsed.searchParams.get('redirect_uri'),
      scope: parsed.searchParams.get('scope'),
      state,
    });
  }
  const res = NextResponse.redirect(url);
  // set short-lived state cookie for csrf protection
  res.cookies.set('spotify_oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 300, path: '/' });
  return res;
}


