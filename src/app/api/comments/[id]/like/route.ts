import { NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function POST(request, context) {
  const params = await context.params;
  const { id: comment_id } = params;
  try {
    const { user_id } = await request.json();
    // Check if like exists
    const existing = await Like.findOne({ where: { user_id, comment_id, post_id: null, review_id: null } });
    if (existing) {
      await existing.destroy();
      const likeCount = await Like.count({ where: { comment_id } });
      return NextResponse.json({ liked: false, likeCount });
    } else {
      await Like.create({ user_id, comment_id, post_id: null, review_id: null, created_at: new Date() });
      const likeCount = await Like.count({ where: { comment_id } });
      return NextResponse.json({ liked: true, likeCount });
    }
  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    return NextResponse.json({ error: 'Failed to like/unlike comment', details: error?.message }, { status: 500 });
  }
} 