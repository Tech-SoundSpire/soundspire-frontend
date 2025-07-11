/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import { Op } from 'sequelize';

export async function GET(request:NextRequest, context:{ params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: review_id } = params;
  try {
    // Fetch top-level comments
    const comments = await Comment.findAll({
      where: { review_id, parent_comment_id: null },
      order: [['created_at', 'ASC']],
    });
    // Fetch replies for each comment
    const commentIds = comments.map(c => c.comment_id);
    const replies = await Comment.findAll({
      where: { parent_comment_id: { [Op.in]: commentIds } },
      order: [['created_at', 'ASC']],
    });
    // Nest replies
    const repliesByParent: { [parentId: string]: typeof replies } = {};
    replies.forEach(reply => {
      if (reply.parent_comment_id && !repliesByParent[reply.parent_comment_id]) repliesByParent[reply.parent_comment_id] = [];
      if(reply.parent_comment_id) repliesByParent[reply.parent_comment_id].push(reply);
    });
    const result = comments.map(comment => ({
      ...comment.toJSON(),
      replies: repliesByParent[comment.comment_id] || [],
    }));
    return NextResponse.json(result);
  } catch (error:any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: error?.message }, { status: 500 });
  }
}

export async function POST(request:NextRequest, context:{ params: Promise<{ id: string }> }) {
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
  } catch (error:any) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment', details: error?.message }, { status: 500 });
  }
} 