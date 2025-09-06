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
    const liked = await spotifyGet<any>(request, 'https://api.spotify.com/v1/me/tracks?limit=50');
    const langCounts: Record<string, number> = {};
    for (const item of liked.items || []) {
      const markets: string[] = item.track?.available_markets || [];
      for (const m of markets) {
        const lang = marketToLanguage[m];
        if (lang) langCounts[lang] = (langCounts[lang] || 0) + 1;
      }
    }
    const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(([language, count]) => ({ language, count }));
    return NextResponse.json({ languages: sorted });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



