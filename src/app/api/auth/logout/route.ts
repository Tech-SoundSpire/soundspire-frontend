import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear all auth-related cookies
  response.cookies.set('user', '', { maxAge: 0 });
  response.cookies.set('oauth_state', '', { maxAge: 0 });
  
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  return response;
} 