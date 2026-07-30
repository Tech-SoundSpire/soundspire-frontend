import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import { User, Report, ModeratorAction } from "@/models";

// POST /api/admin/ban-user - ban a user. Banned users are logged out on next
// session fetch and blocked at write entry points.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { user_id, note } = await request.json();
    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    if (user_id === admin.userId) return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });

    const [updated] = await User.update({ is_banned: true }, { where: { user_id } });
    if (updated === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Resolve any open reports against this user.
    await Report.update(
      { status: "actioned" },
      { where: { target_type: "user", target_id: String(user_id), status: "open" } }
    );

    await ModeratorAction.create({
      moderator_user_id: admin.userId,
      action: "ban",
      target_type: "user",
      target_id: String(user_id),
      note: note || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}
