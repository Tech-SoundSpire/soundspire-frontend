import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Comment from '@/models/Comment';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub; // this is the user's ID from the JWT
  const body = await req.json();
  const { reviewId, text, parentId } = body;

  if (!reviewId || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const comment = await Comment.create({
    reviewId,
    text,
    userId,
    parentId: parentId || null,
  });

  return NextResponse.json({ message: 'Comment added', comment });
}
