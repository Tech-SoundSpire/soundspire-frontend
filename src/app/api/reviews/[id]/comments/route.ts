/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
import { Op } from 'sequelize';

export async function GET(request:NextRequest, context:{ params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: review_id } = params;
  try {
    // Fetch top-level comments with user information
    const comments = await models.Comment.findAll({
      where: { review_id, parent_comment_id: null },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['username', 'profile_picture_url', 'full_name'],
          required: false,
        }
      ]
    });
    
    // Fetch replies for each comment with user information
    const commentIds = comments.map(c => c.comment_id);
    const replies = await models.Comment.findAll({
      where: { parent_comment_id: { [Op.in]: commentIds } },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['username', 'profile_picture_url', 'full_name'],
          required: false,
        }
      ]
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
    const comment = await models.Comment.create({
      review_id,
      user_id,
      content,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Fetch the comment with user information
    const detailedComment = await comment.reload({
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['username', 'profile_picture_url', 'full_name'],
          required: false,
        }
      ]
    });
    
    return NextResponse.json(detailedComment.get({ plain: true }));
  } catch (error:any) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment', details: error?.message }, { status: 500 });
  }
} 