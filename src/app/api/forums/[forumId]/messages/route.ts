import { NextRequest, NextResponse } from 'next/server';
import ForumPost from '@/models/ForumPost';
import Forum from '@/models/Forum';
import { User } from '@/models/User';
import { getDataFromToken } from '@/utils/getDataFromToken';
import { Op } from 'sequelize';
import CommunitySubscription from '@/models/CommunitySubscription';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // ISO timestamp for pagination

    // Get forum
    const forum = await Forum.findByPk(forumId);
    if (!forum) {
      return NextResponse.json({ error: 'Forum not found' }, { status: 404 });
    }

    // Verify subscription
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

    // Build query with optional pagination
    const whereClause: any = { forum_id: forumId };
    if (before) {
      whereClause.created_at = {
        [Op.lt]: new Date(before)
      };
    }

    // Fetch messages with user info
    const messages = await ForumPost.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'username', 'full_name', 'profile_picture_url']
      }],
      order: [['created_at', 'DESC']],
      limit
    });

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
