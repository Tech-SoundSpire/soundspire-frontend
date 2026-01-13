import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { supabase } from "@/lib/supabaseClient";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connectionTestingAndHelper();
    
    const { postId } = await params;
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

    return NextResponse.json({ success: true, reactions });
  } catch (error: any) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add reaction" },
      { status: 500 }
    );
  }
}
