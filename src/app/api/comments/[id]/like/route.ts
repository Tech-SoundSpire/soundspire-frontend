import { NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function POST(request: Request, context: any) {
  const params = await context.params;
  const { id: comment_id } = params;

  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Always create a new like — no unlike
    await Like.create({
      user_id,
      comment_id,
      review_id: null,
      post_id: null,
      created_at: new Date(),
    });

    // Return updated like count
    const count = await Like.count({ where: { comment_id, review_id: null, post_id: null } });

    return NextResponse.json({ liked: true, count });
  } catch (error: unknown) {
    console.error('Error liking comment:', error);
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return NextResponse.json({ error: 'Failed to like comment', details: message }, { status: 500 });
  }
}

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const { id: comment_id } = params;
  const { searchParams } = new URL(request.url);

  if (request.url.endsWith('/count')) {
    const count = await Like.count({ where: { comment_id, review_id: null, post_id: null } });
    return NextResponse.json({ count });
  }

  if (request.url.includes('/status')) {
    const user_id = searchParams.get('user_id');
    if (!user_id) return NextResponse.json({ liked: false });

    const existing = await Like.findOne({ where: { user_id, comment_id, review_id: null, post_id: null } });
    return NextResponse.json({ liked: !!existing });
  }

  return NextResponse.json({});
}
