import { NextRequest, NextResponse } from 'next/server';
import Like from '@/models/Like';
import { getDataFromToken } from '@/utils/getDataFromToken';

// Resolve the acting user from the verified JWT, never from the request body.
function getCallerId(request: NextRequest): string | undefined {
  try {
    return getDataFromToken(request);
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest, context:{ params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: comment_id } = params;

  try {
    const user_id = getCallerId(request);
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

export async function DELETE(request: NextRequest, context:{ params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: comment_id } = params;

  try {
    const user_id = getCallerId(request);
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Like.destroy({
      where: {
        user_id,
        comment_id,
        review_id: null,
        post_id: null,
      },
    });

    const count = await Like.count({ where: { comment_id, review_id: null, post_id: null } });

    return NextResponse.json({ liked: false, count });
  } catch (error: unknown) {
    console.error('Error unliking comment:', error);
    const err = error as Error;
    return NextResponse.json({ error: 'Failed to unlike comment', details: err?.message }, { status: 500 });
  }
}

// GET requests are handled by dedicated routes:
// - /api/comments/[id]/like/count - for like count
// - /api/comments/[id]/like/status - for like status
