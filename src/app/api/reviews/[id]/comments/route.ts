import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import { Op } from 'sequelize';

// GET: Fetch all top-level comments for a review, including replies
export async function GET(request: Request, context: any) {
  const params = await context.params;
  const { id: review_id } = params;
  try {
    // Fetch top-level comments
    const comments = await Comment.findAll({
      where: { review_id, parent_comment_id: null },
      order: [['created_at', 'ASC']],
    });
    // Convert to plain objects
    const plainComments = comments.map(c => c.toJSON());
    // Fetch replies for each comment
    const commentIds = plainComments.map(c => c.comment_id);
    const replies = await Comment.findAll({
      where: { parent_comment_id: { [Op.in]: commentIds } },
      order: [['created_at', 'ASC']],
    });
    // Nest replies
    const repliesByParent: { [key: string]: any[] } = {};
    replies.forEach(reply => {
      const replyObj = reply.toJSON();
      const parentId = String(replyObj.parent_comment_id);
      if (!repliesByParent[parentId]) repliesByParent[parentId] = [];
      repliesByParent[parentId].push(replyObj);
    });
    const result = plainComments.map(comment => ({
      ...comment,
      replies: repliesByParent[String(comment.comment_id)] || [],
    }));
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error fetching comments:', error);
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return NextResponse.json({ error: 'Failed to fetch comments', details: message }, { status: 500 });
  }
}

// POST: Add a new top-level comment to a review
export async function POST(request: Request, context: any) {
  const params = await context.params;
  const { id: review_id } = params;
  try {
    const { user_id, content } = await request.json();
    if (!user_id || !content) {
      return NextResponse.json({ error: 'user_id and content are required' }, { status: 400 });
    }
    const comment = await Comment.create({
      review_id,
      user_id,
      content,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return NextResponse.json(comment);
  } catch (error: unknown) {
    console.error('Error adding comment:', error);
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return NextResponse.json({ error: 'Failed to add comment', details: message }, { status: 500 });
  }
} 