import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import { User, ModeratorAction } from "@/models";

// POST /api/admin/unban-user - reverse a ban.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { user_id } = await request.json();
    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

    const [updated] = await User.update({ is_banned: false }, { where: { user_id } });
    if (updated === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await ModeratorAction.create({
      moderator_user_id: admin.userId,
      action: "unban",
      target_type: "user",
      target_id: String(user_id),
      note: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json({ error: "Failed to unban user" }, { status: 500 });
  }
}
