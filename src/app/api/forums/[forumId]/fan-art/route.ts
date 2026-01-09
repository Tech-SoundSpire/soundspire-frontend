import { NextRequest, NextResponse } from 'next/server';
import { ForumPost, Forum, User, Like, CommunitySubscription, Community, Artist } from '@/models';
import { getDataFromToken } from '@/utils/getDataFromToken';
import { Op } from 'sequelize';

// GET - List fan art posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forumId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get forum and verify access
    const forum = await Forum.findByPk(forumId);
    if (!forum) {
      return NextResponse.json({ error: 'Forum not found' }, { status: 404 });
    }

    // Get community
    const community = await Community.findByPk(forum.community_id);
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is the artist who owns this community
    const artist = await Artist.findOne({
      where: {
        artist_id: community.artist_id,
        user_id: userId
      }
    });

    const isOwner = !!artist;

    // If not the owner, verify subscription
    if (!isOwner) {
      const subscription = await CommunitySubscription.findOne({
        where: {
          user_id: userId,
          community_id: forum.community_id,
          is_active: true,
          end_date: {
            [Op.gte]: new Date()
          }
        }
      });

      if (!subscription) {
        return NextResponse.json(
          { error: 'Active subscription required' },
          { status: 403 }
        );
      }
    }

    // Fetch fan art posts (only image posts)
    const posts = await ForumPost.findAll({
      where: {
        forum_id: forumId,
        media_type: 'image'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'full_name', 'profile_picture_url']
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['like_id', 'user_id'],
          where: { forum_post_id: { [Op.ne]: null } },
          required: false
        }
      ],
      order: [
        ['is_pinned', 'DESC'], // Featured posts first
        ['created_at', 'DESC']
      ],
      limit,
      offset
    });

    // Add like count and user liked status
    const postsWithLikeInfo = posts.map(post => {
      const postJson = post.toJSON() as any;
      return {
        ...postJson,
        likes_count: postJson.likes?.length || 0,
        user_has_liked: postJson.likes?.some((like: any) => 
          like.user_id === userId
        ) || false
      };
    });

    const total = await ForumPost.count({
      where: { forum_id: forumId, media_type: 'image' }
    });

    return NextResponse.json({
      posts: postsWithLikeInfo,
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Error fetching fan art:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fan art' },
      { status: 500 }
    );
  }
}

// POST - Upload new fan art
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forumId } = await params;
    const body = await request.json();
    const { title, content, imageUrls } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image URL is required' },
        { status: 400 }
      );
    }

    // Verify forum access
    const forum = await Forum.findByPk(forumId);
    if (!forum) {
      return NextResponse.json({ error: 'Forum not found' }, { status: 404 });
    }

    // Get community
    const community = await Community.findByPk(forum.community_id);
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is the artist who owns this community
    const artist = await Artist.findOne({
      where: {
        artist_id: community.artist_id,
        user_id: userId
      }
    });

    const isOwner = !!artist;

    // If not the owner, verify subscription
    if (!isOwner) {
      const subscription = await CommunitySubscription.findOne({
        where: {
          user_id: userId,
          community_id: forum.community_id,
          is_active: true,
          end_date: {
            [Op.gte]: new Date()
          }
        }
      });

      if (!subscription) {
        return NextResponse.json(
          { error: 'Active subscription required' },
          { status: 403 }
        );
      }
    }

    // Validate image URLs
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const invalidUrls = imageUrls.filter((url: string) => {
      const ext = url.split('.').pop()?.toLowerCase();
      return !ext || !validExtensions.includes(ext);
    });

    if (invalidUrls.length > 0) {
      return NextResponse.json(
        { error: 'Invalid image format. Only jpg, jpeg, png, gif, webp allowed' },
        { status: 400 }
      );
    }

    // Create fan art post
    const post = await ForumPost.create({
      forum_id: forumId,
      user_id: userId,
      title: title || 'Untitled',
      content: content || '',
      media_type: 'image',
      media_urls: imageUrls
    });

    // Fetch with user info
    const postWithUser = await ForumPost.findByPk(post.forum_post_id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'username', 'full_name', 'profile_picture_url']
      }]
    });

    return NextResponse.json({ post: postWithUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating fan art:', error);
    return NextResponse.json(
      { error: 'Failed to create fan art' },
      { status: 500 }
    );
  }
}
