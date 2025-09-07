import { NextRequest, NextResponse } from 'next/server';
import { spotifyGet } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    console.log('🎭 [Genres API] Starting request');
    const top = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/top/artists?limit=50');
    console.log('🎭 [Genres API] Fetched top artists:', top);
    console.log('🎭 [Genres API] Number of artists:', top.items?.length || 0);
    
    const counts: Record<string, number> = {};
    for (const artist of top.items || []) {
      console.log('🎭 [Genres API] Processing artist:', artist.name, 'Genres:', artist.genres);
      for (const genre of artist.genres || []) {
        counts[genre] = (counts[genre] || 0) + 1;
      }
    }
    console.log('🎭 [Genres API] Genre counts:', counts);
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([genre, count]) => ({ genre, count }));
    console.log('🎭 [Genres API] Top 10 genres:', sorted);
    
    return NextResponse.json({ genres: sorted });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('🎭 [Genres API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



