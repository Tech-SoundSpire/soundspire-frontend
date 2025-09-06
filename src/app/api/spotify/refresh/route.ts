import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessTokenForUser } from '@/lib/spotify';
import { getDataFromToken } from '@/utils/getDataFromToken';

export async function POST(request: NextRequest) {
  const userId = getDataFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const token = await refreshAccessTokenForUser(userId);
    return NextResponse.json({ access_token: token });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



