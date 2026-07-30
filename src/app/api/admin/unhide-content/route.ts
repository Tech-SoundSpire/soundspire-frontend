import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import { ForumPost, ModeratorAction } from "@/models";
import SongReview from "@/models/reviews/SongReview";

async function unhideTarget(targetType: string, targetId: string): Promise<number> {
  if (targetType === "chat_message" || targetType === "fan_art") {
    const [n] = await ForumPost.update(
      { is_hidden: false, hidden_reason: null },
      { where: { forum_post_id: targetId } }
    );
    return n;
  }
  if (targetType === "review") {
    const [n] = await SongReview.update(
      { is_hidden: false, hidden_reason: null },
      { where: { review_id: targetId } }
    );
    return n;
  }
  return -1;
}

// POST /api/admin/unhide-content - reverse a hide.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { target_type, target_id } = await request.json();
    if (!target_id) return NextResponse.json({ error: "target_id is required" }, { status: 400 });

    const updated = await unhideTarget(target_type, String(target_id));
    if (updated === -1) return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
    if (updated === 0) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    await ModeratorAction.create({
      moderator_user_id: admin.userId,
      action: "unhide",
      target_type,
      target_id: String(target_id),
      note: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unhiding content:", error);
    return NextResponse.json({ error: "Failed to unhide content" }, { status: 500 });
  }
}
