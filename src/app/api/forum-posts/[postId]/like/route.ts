import { NextRequest, NextResponse } from 'next/server';
import { Like } from '@/models';
import { getDataFromToken } from '@/utils/getDataFromToken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    // Check if already liked
    const existingLike = await Like.findOne({
      where: {
        forum_post_id: postId,
        user_id: userId
      }
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();
      return NextResponse.json({ 
        liked: false, 
        message: 'Post unliked' 
      });
    } else {
      // Like - create new like
      await Like.create({
        forum_post_id: postId,
        user_id: userId
      });
      return NextResponse.json({ 
        liked: true, 
        message: 'Post liked' 
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
