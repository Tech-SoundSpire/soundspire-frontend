import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';

export async function POST(request:NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: parent_comment_id } = await context.params;
  try {
    const { user_id, content } = await request.json();
    const reply = await Comment.create({
      parent_comment_id,
      user_id,
      content,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reply', details: error }, { status: 500 });
  }
} 