import { NextRequest, NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: review_id } = await context.params; // ✅ await this line
    const user_id = request.nextUrl.searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const like = await Like.findOne({
      where: {
        review_id,
        user_id,
        post_id: null,
        comment_id: null,
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch like status', details: (error as Error).message },
      { status: 500 }
    );
  }
}
