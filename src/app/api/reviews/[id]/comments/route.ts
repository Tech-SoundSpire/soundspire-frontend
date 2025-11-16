import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
const { Comment, Like, User, Review } = models;

// GET: Fetch all comments for a review
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: review_id } = params;

    const comments = await Comment.findAll({
      where: {
        review_id,
        deleted_at: null,
        parent_comment_id: null, // Only top-level comments
      },
      include: [
        {
          model: Like,
          as: 'likes',
          required: false,
        },
        {
          model: Comment,
          as: 'replies',
          required: false,
          where: { deleted_at: null },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'username', 'profile_picture_url', 'full_name'],
              required: false,
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'profile_picture_url', 'full_name'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return NextResponse.json({ comments });
  } catch (error: unknown) {
    console.error('Error fetching comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Create a new comment on a review
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: review_id } = params;
    const { user_id, content, parent_comment_id } = await request.json();

    if (!user_id || !content || !review_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id, content, and review_id are required' },
        { status: 400 }
      );
    }

    // Verify the review exists
    const review = await Review.findByPk(review_id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const comment = await Comment.create({
      user_id,
      content,
      review_id,
      post_id: null,
      ...(parent_comment_id && { parent_comment_id }),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const detailedComment = await comment.reload({
      include: [
        {
          model: Like,
          as: 'likes',
          required: false,
        },
        {
          model: Comment,
          as: 'replies',
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'username', 'profile_picture_url', 'full_name'],
              required: false,
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'profile_picture_url', 'full_name'],
          required: false,
        },
      ],
    });

    return NextResponse.json(detailedComment.get({ plain: true }));
  } catch (error: unknown) {
    console.error('Error adding comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add comment', details: errorMessage },
      { status: 500 }
    );
  }
}
