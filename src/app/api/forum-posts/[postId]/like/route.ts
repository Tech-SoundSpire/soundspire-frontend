import { NextRequest, NextResponse } from 'next/server';
import { Like, ForumPost, User, Forum, Community, Artist } from '@/models';
import { getDataFromToken } from '@/utils/getDataFromToken';
import { notifyUser } from '@/utils/notifications';

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
      // Notify post owner
      try {
        const post = await ForumPost.findByPk(postId);
        const liker = await User.findByPk(userId, { attributes: ["username"] });
        if (post && post.user_id !== userId) {
          let link = "/feed";
          const forum = await Forum.findByPk(post.forum_id);
          if (forum) {
            const comm = await Community.findByPk(forum.community_id);
            if (comm) {
              const art = await Artist.findByPk(comm.artist_id);
              if (art) link = `/community/${art.slug}/fan-art?highlight=${postId}`;
            }
          }
          await notifyUser(post.user_id, `${liker?.username || "Someone"} liked your fan art`, link, "fanart_like");
        }
      } catch (err) { console.error("Notification error:", err); }
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
