import { NextRequest, NextResponse } from 'next/server';
import { spotifyGet } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const top = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/top/artists?limit=50');
    const counts: Record<string, number> = {};
    for (const artist of top.items || []) {
      for (const genre of artist.genres || []) {
        counts[genre] = (counts[genre] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([genre, count]) => ({ genre, count }));
    return NextResponse.json({ genres: sorted });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



