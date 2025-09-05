import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/spotify';
import UserSpotifyToken from '@/models/UserSpotifyToken';
import { getDataFromToken } from '@/utils/getDataFromToken';

// Alias for apps configured with SPOTIFY_REDIRECT_URI pointing to /api/auth/spotify/callback/
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('spotify_oauth_state')?.value;

  if (!code) return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  if (!state || !storedState || state !== storedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  const userId = getDataFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tokenData = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + (tokenData.expires_in - 60) * 1000);

    const existing = await UserSpotifyToken.findOne({ where: { user_id: userId } });
    if (existing) {
      existing.access_token = tokenData.access_token;
      existing.refresh_token = tokenData.refresh_token;
      existing.expires_at = expiresAt;
      existing.scope = tokenData.scope;
      existing.token_type = tokenData.token_type;
      await existing.save();
    } else {
      await UserSpotifyToken.create({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        scope: tokenData.scope,
        token_type: tokenData.token_type,
      });
    }

    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://localhost:3000'}/(protected)/profile`);
    response.cookies.delete('spotify_oauth_state');
    return response;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



