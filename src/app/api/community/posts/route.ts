import { NextRequest, NextResponse } from 'next/server';
import Post from '@/models/Post';
import Artist from '@/models/Artist';
import Community from '@/models/Community';
import { User } from '@/models/User';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import { notifyCommunitySubscribers } from '@/utils/notifications';
import { getDataFromToken } from '@/utils/getDataFromToken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');
    const userId = searchParams.get('userId');

    let whereClause: any = { deleted_at: null };

    if (communityId) {
      whereClause.community_id = communityId;
    } else if (userId) {
      // Get posts from communities user is subscribed to
      const subscriptions = await Community.findAll({
        include: [{
          association: 'CommunitySubscriptions',
          where: { user_id: userId },
          required: true
        }]
      });
      const subscribedIds = subscriptions.map(s => s.community_id);

      // Also include communities the user owns as an artist
      const artistProfile = await Artist.findOne({ where: { user_id: userId } });
      const ownedIds = artistProfile
        ? (await Community.findAll({ where: { artist_id: artistProfile.artist_id } })).map(c => c.community_id)
        : [];

      const communityIds = [...new Set([...subscribedIds, ...ownedIds])];
      whereClause.community_id = communityIds;
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['artist_id', 'artist_name', 'profile_picture_url', 'slug']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'username', 'full_name', 'profile_picture_url']
            },
            {
              model: Like,
              as: 'likes',
              attributes: ['like_id', 'user_id']
            }
          ]
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['like_id', 'user_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Identify the caller from the verified JWT.
    let userId: string | undefined;
    try {
      userId = getDataFromToken(request);
    } catch {
      userId = undefined;
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { community_id, content_text, media_urls } = body;

    if (!community_id) {
      return NextResponse.json(
        { error: 'community_id is required' },
        { status: 400 }
      );
    }

    // Look up the community and confirm the CALLER actually owns its artist.
    // The artist is taken from the community record, not from the client body,
    // so a caller can't post as an artist they don't control.
    const community = await Community.findOne({
      where: { community_id }
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    const owningArtist = await Artist.findOne({
      where: { artist_id: community.artist_id, user_id: userId }
    });

    if (!owningArtist) {
      return NextResponse.json(
        { error: 'Forbidden: you do not own this community' },
        { status: 403 }
      );
    }

    const artist_id = community.artist_id;

    const post = await Post.create({
      artist_id,
      community_id,
      content_text,
      media_urls: media_urls || [],
      media_type: media_urls?.length > 0 ? 'mixed' : 'text'
    });

    const fullPost = await Post.findByPk(post.post_id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['artist_id', 'artist_name', 'profile_picture_url', 'slug']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'username', 'full_name', 'profile_picture_url']
            },
            {
              model: Like,
              as: 'likes',
              attributes: ['like_id', 'user_id']
            }
          ]
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['like_id', 'user_id']
        }
      ]
    });

    // Notify subscribers
    const artist = await Artist.findByPk(artist_id);
    const artistUserId = artist?.user_id;
    try {
      await notifyCommunitySubscribers(
        community_id,
        artistUserId || "",
        `${community.name || "A community"} has a new post`,
        `/feed?highlight=${post.post_id}`,
        "new_post",
        { actorImage: artist?.profile_picture_url, thumbnail: post.media_urls?.[0] || null }
      );
    } catch (err) { console.error("Notification error:", err); }

    return NextResponse.json(fullPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
