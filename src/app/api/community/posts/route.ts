import { NextRequest, NextResponse } from 'next/server';
import Post from '@/models/Post';
import Artist from '@/models/Artist';
import Community from '@/models/Community';
import { User } from '@/models/User';
import Comment from '@/models/Comment';
import Like from '@/models/Like';

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
      const communityIds = subscriptions.map(s => s.community_id);
      whereClause.community_id = communityIds;
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['artist_id', 'artist_name', 'profile_picture_url']
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
    const body = await request.json();
    const { artist_id, community_id, content_text, media_urls } = body;

    if (!artist_id || !community_id) {
      return NextResponse.json(
        { error: 'artist_id and community_id are required' },
        { status: 400 }
      );
    }

    // Verify artist owns the community
    const community = await Community.findOne({
      where: { community_id, artist_id }
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Unauthorized: Artist does not own this community' },
        { status: 403 }
      );
    }

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
          attributes: ['artist_id', 'artist_name', 'profile_picture_url']
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

    return NextResponse.json(fullPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
