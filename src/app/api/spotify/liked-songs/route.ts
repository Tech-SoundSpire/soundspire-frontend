import { NextRequest, NextResponse } from 'next/server';
import { spotifyGet } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    console.log('❤️ [Liked Songs API] Starting request');
    const data = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/tracks?limit=50');
    console.log('❤️ [Liked Songs API] Successfully fetched data:', data);
    console.log('❤️ [Liked Songs API] Number of liked songs:', data.items?.length || 0);
    
    // Log first few songs for debugging
    if (data.items && data.items.length > 0) {
      console.log('❤️ [Liked Songs API] First 3 songs:', data.items.slice(0, 3).map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists[0]?.name,
        album: item.track.album?.name
      })));
    }
    
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('❤️ [Liked Songs API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



