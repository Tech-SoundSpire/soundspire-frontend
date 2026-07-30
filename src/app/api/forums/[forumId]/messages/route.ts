import { NextRequest, NextResponse } from 'next/server';
import { ForumPost, User } from '@/models';
import { getDataFromToken } from '@/utils/getDataFromToken';
import { verifyForumAccess } from '@/utils/forumAccess';
import { applyUgcVisibility, isBanned } from '@/utils/moderation';
import { Op } from 'sequelize';

const USER_ATTRS = ['user_id', 'username', 'full_name', 'profile_picture_url'];

// GET messages for a forum.
//   ?parent=root   -> top-level messages (default), each with replyCount
//   ?parent=<id>   -> replies to that message
//   ?before=<iso>  -> pagination (root only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { forumId } = await params;
    const access = await verifyForumAccess(forumId, userId);
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { searchParams } = new URL(request.url);
    const parent = searchParams.get('parent') || 'root';
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    const where: Record<string, unknown> = { forum_id: forumId };
    if (parent === 'root') {
      where.parent_post_id = { [Op.is]: null };
      if (before) where.created_at = { [Op.lt]: new Date(before) };
    } else {
      where.parent_post_id = parent;
    }
    // Hide moderator-hidden posts + posts by blocked/banned authors.
    await applyUgcVisibility(where, userId);

    const messages = await ForumPost.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: USER_ATTRS }],
      order: [['created_at', 'ASC']],
      limit: parent === 'root' ? limit : undefined,
    });

    // Attach reply counts for root messages only.
    let withCounts = messages.map((m) => m.toJSON());
    if (parent === 'root') {
      withCounts = await Promise.all(
        withCounts.map(async (m) => ({
          ...m,
          replyCount: await ForumPost.count({ where: { parent_post_id: m.forum_post_id } }),
        }))
      );
    }

    return NextResponse.json({ messages: withCounts });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST a new message (or reply) to a forum.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (await isBanned(userId)) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const { forumId } = await params;
    const access = await verifyForumAccess(forumId, userId);
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await request.json();
    const content = (body.content || '').toString().slice(0, 5000);
    const mediaUrls: string[] = Array.isArray(body.media_urls) ? body.media_urls.slice(0, 10) : [];
    const parentPostId = body.parent_post_id || null;

    if (!content && mediaUrls.length === 0) {
      return NextResponse.json({ error: 'Message is empty' }, { status: 400 });
    }

    const created = await ForumPost.create({
      forum_id: forumId,
      user_id: userId,
      content,
      media_type: body.media_type || 'text',
      media_urls: mediaUrls,
      parent_post_id: parentPostId,
    });

    const withUser = await ForumPost.findByPk(created.forum_post_id, {
      include: [{ model: User, as: 'user', attributes: USER_ATTRS }],
    });

    return NextResponse.json({ message: withUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
