import { NextResponse } from 'next/server';
import { User } from '@/models';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/google/callback';
const FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${FRONTEND_URL}?error=${error}`);
    }

    const cookies = request.headers.get('cookie');
    const storedState = cookies
      ?.split(';')
      .find((c) => c.trim().startsWith('oauth_state='))
      ?.split('=')[1];

    if (!state || state !== storedState) {
      return NextResponse.redirect(`${FRONTEND_URL}?error=invalid_state`);
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code!,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || 'Failed to get access token');
    }

    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const existingUser = await User.findOne({ where: { email: userData.email } });
    const username = existingUser?.username || userData.email.split('@')[0].toLowerCase();

    await User.upsert({
      google_id: userData.id,
      email: userData.email,
      full_name: userData.name || existingUser?.full_name || userData.email.split('@')[0],
      profile_picture_url: userData.picture || existingUser?.profile_picture_url,
      username,
      is_verified: true,
      created_at: existingUser?.created_at || new Date(),
      updated_at: new Date(),
    });

    const authUser = {
      id: userData.id,
      name: userData.name,
      displayName: userData.name,
      email: userData.email,
      photoURL: userData.picture,
      username,
    };

    const response = NextResponse.redirect(`${FRONTEND_URL}/profile`);

    response.cookies.set('user', JSON.stringify(authUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${FRONTEND_URL}?error=oauth_error`);
  }
}