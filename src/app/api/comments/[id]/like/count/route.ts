import { NextRequest, NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: comment_id } = params;
  const count = await Like.count({ where: { comment_id, post_id: null, review_id: null } });
  return NextResponse.json({ count });
} 