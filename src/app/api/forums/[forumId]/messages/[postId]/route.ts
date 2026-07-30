import { NextRequest, NextResponse } from 'next/server';
import { ForumPost } from '@/models';
import { getDataFromToken } from '@/utils/getDataFromToken';
import { verifyForumAccess } from '@/utils/forumAccess';

// Load the post and confirm the caller owns it. Returns the post or an error.
async function loadOwnedPost(forumId: string, postId: string, userId: string) {
  const access = await verifyForumAccess(forumId, userId);
  if ('error' in access) return { error: access.error, status: access.status };

  const post = await ForumPost.findByPk(postId);
  if (!post || post.forum_id !== forumId) {
    return { error: 'Message not found', status: 404 as const };
  }
  if (post.user_id !== userId) {
    return { error: 'Not your message', status: 403 as const };
  }
  return { post };
}

// PATCH - edit message content (owner only).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string; postId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { forumId, postId } = await params;
    const result = await loadOwnedPost(forumId, postId, userId);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { content } = await request.json();
    const trimmed = (content || '').toString().trim().slice(0, 5000);
    if (!trimmed) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    result.post.content = trimmed;
    await result.post.save();

    return NextResponse.json({ message: result.post });
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json({ error: 'Failed to edit message' }, { status: 500 });
  }
}

// DELETE - remove a message (owner only).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string; postId: string }> }
) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { forumId, postId } = await params;
    const result = await loadOwnedPost(forumId, postId, userId);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await result.post.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
