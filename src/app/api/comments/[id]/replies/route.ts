import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';

export async function POST(request:NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: parent_comment_id } = await context.params;
  try {
    const { user_id, content } = await request.json();
    const reply = await models.Comment.create({
      parent_comment_id,
      user_id,
      content,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Fetch the reply with user information
    const detailedReply = await reply.reload({
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['username', 'profile_picture_url', 'full_name'],
          required: false,
        }
      ]
    });
    
    return NextResponse.json(detailedReply.get({ plain: true }));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reply', details: error }, { status: 500 });
  }
} 