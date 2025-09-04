import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear OAuth user cookie
  response.cookies.set('user', '', {
    maxAge: 0,
    path: '/',
  });

  // Clear OAuth state cookie
  response.cookies.set('oauth_state', '', {
    maxAge: 0,
    path: '/',
  });

  // Clear JWT token cookie used by manual login
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  return response;
} 