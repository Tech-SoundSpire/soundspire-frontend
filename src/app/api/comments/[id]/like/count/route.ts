import { NextResponse } from 'next/server';
import Like from '@/models/Like';
import { NextRequest } from 'next/server';
export async function GET(request: Request, context: any) {
  const { id: comment_id } = context.params;
  const count = await Like.count({ where: { comment_id, post_id: null, review_id: null } });
  return NextResponse.json({ count });
} 