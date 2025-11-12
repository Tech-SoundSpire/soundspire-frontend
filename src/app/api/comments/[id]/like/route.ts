import { NextRequest, NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function POST(request: NextRequest, context:{ params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: comment_id } = params;

  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Check if user has already liked this comment
    const existingLike = await Like.findOne({
      where: {
        user_id,
        comment_id,
        review_id: null,
        post_id: null,
      },
    });

    if (existingLike) {
      // User has already liked this comment, return current status
      const count = await Like.count({ where: { comment_id, review_id: null, post_id: null } });
      return NextResponse.json({ liked: true, count, message: 'Already liked' });
    }

    // Create a new like
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    console.error('Error liking comment:', error);
    return NextResponse.json({ error: 'Failed to like comment', details: error?.message }, { status: 500 });
  }
}

// GET requests are handled by dedicated routes:
// - /api/comments/[id]/like/count - for like count
// - /api/comments/[id]/like/status - for like status
