import { NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function POST(request, { params }) {
  const { id: comment_id } = params;
  try {
    const { user_id } = await request.json();
    // Check if like exists
    const existing = await Like.findOne({ where: { user_id, comment_id } });
    if (existing) {
      await existing.destroy();
      return NextResponse.json({ liked: false });
    } else {
      await Like.create({ user_id, comment_id, created_at: new Date() });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to like/unlike comment', details: error }, { status: 500 });
  }
} 