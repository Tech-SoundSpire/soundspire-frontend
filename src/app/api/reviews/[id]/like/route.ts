import { NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function POST(request, context) {
  const params = await context.params;
  const { id: review_id } = params;

  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Always create a new like — no toggle
    await Like.create({
      user_id,
      review_id,
      post_id: null,
      comment_id: null,
      created_at: new Date(),
    });

    // Return updated like count
    const count = await Like.count({ where: { review_id, post_id: null, comment_id: null } });

    return NextResponse.json({ liked: true, count });
  } catch (error) {
    console.error('Error liking review:', error);
    return NextResponse.json({ error: 'Failed to like review', details: error?.message }, { status: 500 });
  }
}

export async function GET(request, context) {
  const params = await context.params;
  const { id: review_id } = params;
  const { searchParams } = new URL(request.url);

  if (request.url.endsWith('/count')) {
    const count = await Like.count({ where: { review_id, post_id: null, comment_id: null } });
    return NextResponse.json({ count });
  }

  if (request.url.includes('/status')) {
    const user_id = searchParams.get('user_id');
    if (!user_id) return NextResponse.json({ liked: false });

    const existing = await Like.findOne({ where: { user_id, review_id, post_id: null, comment_id: null } });
    return NextResponse.json({ liked: !!existing });
  }

  return NextResponse.json({});
}
