import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import { ForumPost, Report, ModeratorAction } from "@/models";
import SongReview from "@/models/reviews/SongReview";

// Hide a content item. chat_message + fan_art -> ForumPost; review -> SongReview.
// Branch per model (their `update` `this` types differ, so no shared union var).
async function hideTarget(targetType: string, targetId: string, reason: string | null): Promise<number> {
  if (targetType === "chat_message" || targetType === "fan_art") {
    const [n] = await ForumPost.update(
      { is_hidden: true, hidden_reason: reason },
      { where: { forum_post_id: targetId } }
    );
    return n;
  }
  if (targetType === "review") {
    const [n] = await SongReview.update(
      { is_hidden: true, hidden_reason: reason },
      { where: { review_id: targetId } }
    );
    return n;
  }
  return -1; // "user" is handled by ban-user, not hide-content
}

// POST /api/admin/hide-content - soft-hide a reported content item.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { target_type, target_id, hidden_reason } = await request.json();
    if (!target_id) return NextResponse.json({ error: "target_id is required" }, { status: 400 });

    const updated = await hideTarget(target_type, String(target_id), hidden_reason || null);
    if (updated === -1) return NextResponse.json({ error: "Invalid target_type for hide" }, { status: 400 });
    if (updated === 0) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    // Mark matching open reports as actioned.
    await Report.update(
      { status: "actioned" },
      { where: { target_type, target_id: String(target_id), status: "open" } }
    );

    await ModeratorAction.create({
      moderator_user_id: admin.userId,
      action: "hide",
      target_type,
      target_id: String(target_id),
      note: hidden_reason || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error hiding content:", error);
    return NextResponse.json({ error: "Failed to hide content" }, { status: 500 });
  }
}
