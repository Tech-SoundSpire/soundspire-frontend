import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {

    const cookies = request.headers.get('cookie');
    const userCookie = cookies?.split(';')
      .find(c => c.trim().startsWith('user='))
      ?.split('=')[1];

    if (!userCookie) {
      return NextResponse.json({ user: null });
    }

    const user = JSON.parse(decodeURIComponent(userCookie));
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
} 