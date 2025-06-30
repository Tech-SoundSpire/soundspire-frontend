import { NextResponse } from 'next/server';
import Like from '@/models/Like';

export async function GET(request, context) {
  const params = await context.params;
  const { id: review_id } = params;
  const count = await Like.count({ where: { review_id, post_id: null, comment_id: null } });
  return NextResponse.json({ count });
} 