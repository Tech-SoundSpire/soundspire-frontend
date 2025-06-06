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
    // Check if like exists (using review_id for review likes)
    const existing = await Like.findOne({ where: { user_id, review_id, post_id: null, comment_id: null } });
    if (existing) {
      await existing.destroy();
      return NextResponse.json({ liked: false });
    } else {
      await Like.create({ user_id, review_id, post_id: null, comment_id: null, created_at: new Date() });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error liking/unliking review:', error);
    return NextResponse.json({ error: 'Failed to like/unlike review', details: error?.message }, { status: 500 });
  }
}

export async function GET(request, context) {
  const params = await context.params;
  const { id: review_id } = params;
  const { searchParams } = new URL(request.url);
  if (request.url.endsWith('/count')) {
    // Return like count for the review
    const count = await Like.count({ where: { review_id, post_id: null, comment_id: null } });
    return NextResponse.json({ count });
  } else if (request.url.includes('/status')) {
    // Return if user liked the review
    const user_id = searchParams.get('user_id');
    if (!user_id) return NextResponse.json({ liked: false });
    const existing = await Like.findOne({ where: { user_id, review_id, post_id: null, comment_id: null } });
    return NextResponse.json({ liked: !!existing });
  }
  return NextResponse.json({});
} 