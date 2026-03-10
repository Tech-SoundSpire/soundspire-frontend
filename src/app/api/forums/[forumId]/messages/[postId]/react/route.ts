import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { supabase } from "@/lib/supabaseClient";
import { notifyUser } from "@/utils/notifications";
import { User } from "@/models/User";
import { Forum, Community, Artist } from "@/models";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string; postId: string }> }
) {
  try {
    await connectionTestingAndHelper();
    
    const { forumId, postId } = await params;
    const { userId, emoji } = await request.json();
    
    if (!userId || !emoji) {
      return NextResponse.json(
        { error: "userId and emoji are required" },
        { status: 400 }
      );
    }

    // Store reaction in Supabase (using JSONB column or separate table)
    // For now, we'll use a simple approach with a reactions JSONB column
    const { data: post } = await supabase
      .from('forum_posts')
      .select('reactions')
      .eq('forum_post_id', postId)
      .single();

    const reactions = post?.reactions || {};
    
    // Toggle reaction
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    
    const userIndex = reactions[emoji].indexOf(userId);
    if (userIndex > -1) {
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      reactions[emoji].push(userId);
    }

    const { error } = await supabase
      .from('forum_posts')
      .update({ reactions })
      .eq('forum_post_id', postId);

    if (error) throw error;

    // Notify post owner about reaction (only when adding, not removing)
    if (reactions[emoji]?.includes(userId)) {
      try {
        const { data: postData } = await supabase.from("forum_posts").select("user_id, media_type").eq("forum_post_id", postId).single();
        if (postData && postData.user_id !== userId) {
          const reactor = await User.findByPk(userId, { attributes: ["username", "profile_picture_url"] });
          let link = "/feed";
          const forum = await Forum.findByPk(forumId);
          if (forum) {
            const comm = await Community.findByPk(forum.community_id);
            if (comm) {
              const art = await Artist.findByPk(comm.artist_id);
              if (art) {
                const page = postData.media_type === "image" ? "fan-art" : "all-chat";
                link = `/community/${art.slug}/${page}?highlight=${postId}`;
              }
            }
          }
          await notifyUser(postData.user_id, `${reactor?.username || "Someone"} reacted ${emoji} to your post`, link, "fanart_like", { actorImage: reactor?.profile_picture_url });
        }
      } catch (err) { console.error("Notification error:", err); }
    }

    return NextResponse.json({ success: true, reactions });
  } catch (error: any) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add reaction" },
      { status: 500 }
    );
  }
}
