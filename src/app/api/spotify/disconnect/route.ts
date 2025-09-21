import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/utils/getDataFromToken';
import UserSpotifyToken from '@/models/UserSpotifyToken';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await UserSpotifyToken.destroy({ where: { user_id: userId } });
    await User.update({ spotify_linked: false }, { where: { user_id: userId } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


