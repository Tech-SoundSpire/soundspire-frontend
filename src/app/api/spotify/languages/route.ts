import { NextRequest, NextResponse } from 'next/server';
import { spotifyGet } from '@/lib/spotify';

// Heuristic: Infer languages from track/album market codes; map major markets to language
const marketToLanguage: Record<string, string> = {
  US: 'English',
  GB: 'English',
  IN: 'Hindi/English',
  BR: 'Portuguese',
  ES: 'Spanish',
  MX: 'Spanish',
  FR: 'French',
  DE: 'German',
  JP: 'Japanese',
  KR: 'Korean',
};

export async function GET(request: NextRequest) {
  try {
    console.log('🌍 [Languages API] Starting request');
    const liked = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/tracks?limit=50');
    console.log('🌍 [Languages API] Fetched liked songs:', liked);
    console.log('🌍 [Languages API] Number of liked songs:', liked.items?.length || 0);
    
    const langCounts: Record<string, number> = {};
    for (const item of liked.items || []) {
      const markets: string[] = item.track?.available_markets || [];
      console.log('🌍 [Languages API] Song:', item.track?.name, 'Markets:', markets);
      for (const m of markets) {
        const lang = marketToLanguage[m];
        if (lang) {
          langCounts[lang] = (langCounts[lang] || 0) + 1;
          console.log('🌍 [Languages API] Found language:', lang, 'for market:', m);
        }
      }
    }
    console.log('🌍 [Languages API] Language counts:', langCounts);
    
    const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(([language, count]) => ({ language, count }));
    console.log('🌍 [Languages API] Sorted languages:', sorted);
    
    return NextResponse.json({ languages: sorted });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('🌍 [Languages API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



