import { NextRequest, NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function GET(request:NextRequest, context:{ params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id: review_id } = params;
  const count = await Like.count({ where: { review_id, post_id: null, comment_id: null } });
  return NextResponse.json({ count });
} 