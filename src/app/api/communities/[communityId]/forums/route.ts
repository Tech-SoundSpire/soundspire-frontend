import { NextRequest, NextResponse } from 'next/server';
import Forum from '@/models/Forum';
import { getDataFromToken } from '@/utils/getDataFromToken';
import { Op } from 'sequelize';
import CommunitySubscription from '@/models/CommunitySubscription';
import Community from '@/models/Community';
import Artist from '@/models/Artist';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { communityId } = await params;

    // Check if community exists
    const community = await Community.findByPk(communityId);
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

    // If not the owner, verify active subscription
    if (!isOwner) {
      const subscription = await CommunitySubscription.findOne({
        where: {
          user_id: userId,
          community_id: communityId,
          is_active: true,
          end_date: {
            [Op.gte]: new Date()
          }
        }
      });

      if (!subscription) {
        return NextResponse.json(
          { error: 'Active subscription required to access community forums' },
          { status: 403 }
        );
      }
    }

    // Get all forums for this community
    const forums = await Forum.findAll({
      where: { community_id: communityId },
      order: [['created_at', 'ASC']]
    });

    return NextResponse.json({ forums });
  } catch (error) {
    console.error('Error fetching forums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forums' },
      { status: 500 }
    );
  }
}
