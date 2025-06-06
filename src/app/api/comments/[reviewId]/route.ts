import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';

export async function GET(
  req: NextRequest,
  contextPromise: Promise<{ params: { reviewId: string } }>
) {
  try {
    const context = await contextPromise;
    const reviewId = context.params.reviewId;

    console.log('Review ID:', reviewId);

    const comments = await Comment.findAll({
      where: { reviewId, parentId: null },
      order: [['createdAt', 'DESC']],
    });

    const totalLikes = comments.reduce((sum, comment: any) => sum + comment.likes, 0);

    return NextResponse.json({ comments, likes: totalLikes });
  } catch (error) {
    console.error('GET /api/comments/[reviewId] error:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}
