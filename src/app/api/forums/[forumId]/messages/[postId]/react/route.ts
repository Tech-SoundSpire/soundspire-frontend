import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { getDataFromToken } from "@/utils/getDataFromToken";
import { verifyForumAccess } from "@/utils/forumAccess";
import { notifyUser } from "@/utils/notifications";
import { User, ForumPost, Community, Artist } from "@/models";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string; postId: string }> }
) {
  try {
    await connectionTestingAndHelper();

    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { forumId, postId } = await params;
    const { emoji } = await request.json();
    if (!emoji) {
      return NextResponse.json({ error: "emoji is required" }, { status: 400 });
    }

    const access = await verifyForumAccess(forumId, userId);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const post = await ForumPost.findByPk(postId);
    if (!post || post.forum_id !== forumId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Toggle this user's reaction. reactions is a JSONB map emoji -> user_id[].
    const reactions: Record<string, string[]> = { ...(post.reactions || {}) };
    const list = reactions[emoji] || [];
    const idx = list.indexOf(userId);
    if (idx > -1) {
      list.splice(idx, 1);
      if (list.length === 0) delete reactions[emoji];
      else reactions[emoji] = list;
    } else {
      reactions[emoji] = [...list, userId];
    }

    post.reactions = reactions;
    post.changed("reactions", true); // JSONB in-place mutation needs an explicit flag
    await post.save();

    // Notify the post owner when a reaction is added (not on removal).
    if (reactions[emoji]?.includes(userId) && post.user_id !== userId) {
      try {
        const reactor = await User.findByPk(userId, {
          attributes: ["username", "profile_picture_url"],
        });
        let link = "/feed";
        const comm = await Community.findByPk(access.forum.community_id);
        if (comm) {
          const art = await Artist.findByPk(comm.artist_id);
          if (art) {
            const page = post.media_type === "image" ? "fan-art" : "all-chat";
            link = `/community/${art.slug}/${page}?highlight=${postId}`;
          }
        }
        await notifyUser(
          post.user_id,
          `${reactor?.username || "Someone"} reacted ${emoji} to your post`,
          link,
          "fanart_like",
          { actorImage: reactor?.profile_picture_url }
        );
      } catch (err) {
        console.error("Notification error:", err);
      }
    }

    return NextResponse.json({ success: true, reactions });
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}
