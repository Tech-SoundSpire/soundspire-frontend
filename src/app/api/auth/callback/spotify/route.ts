import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/spotify';
import UserSpotifyToken from '@/models/UserSpotifyToken';
import { User } from '@/models/User';
import { getDataFromToken } from '@/utils/getDataFromToken';

export async function GET(request: NextRequest) {
  console.log('Spotify callback route hit!');
  console.log('Request URL:', request.url);
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('spotify_oauth_state')?.value;

  console.log('Code:', code ? 'Present' : 'Missing');
  console.log('State:', state);
  console.log('Stored State:', storedState);

  if (!code) {
    console.error('Missing authorization code');
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }
  
  if (!state || !storedState || state !== storedState) {
    console.error('Invalid state parameter');
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  const userId = getDataFromToken(request);
  if (!userId) {
    console.error('Unauthorized - no user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Exchanging code for tokens...');
    const tokenData = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + (tokenData.expires_in - 60) * 1000);

    console.log('Saving tokens to database...');
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

    // Update user's spotify_linked status
    console.log('Updating user spotify_linked status...');
    await User.update(
      { spotify_linked: true },
      { where: { user_id: userId } }
    );

    console.log('OAuth flow completed successfully');
    const baseUrl = process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000';
    const response = NextResponse.redirect(`${baseUrl}/profile`);
    response.cookies.delete('spotify_oauth_state');
    return response;
  } catch (e: unknown) {
    console.error('Error in Spotify callback:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
