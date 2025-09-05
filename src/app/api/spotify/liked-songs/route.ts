import { NextRequest, NextResponse } from 'next/server';
import { spotifyGet } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const data = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/tracks?limit=50');
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



