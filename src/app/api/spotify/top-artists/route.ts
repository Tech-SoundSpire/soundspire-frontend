import { NextRequest, NextResponse } from 'next/server';
import { spotifyGet } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    console.log('🎤 [Top Artists API] Starting request');
    const data = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/top/artists?limit=10');
    console.log('🎤 [Top Artists API] Successfully fetched data:', data);
    console.log('🎤 [Top Artists API] Number of artists:', data.items?.length || 0);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('🎤 [Top Artists API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



