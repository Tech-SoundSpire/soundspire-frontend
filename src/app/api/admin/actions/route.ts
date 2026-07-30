import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import ModeratorAction from "@/models/ModeratorAction";
import { User } from "@/models";

// GET /api/admin/actions - moderator action audit log.
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const actions = await ModeratorAction.findAll({
      order: [["created_at", "DESC"]],
      limit: 200,
    });

    // Attach moderator usernames (small set, do a lookup map).
    const modIds = [...new Set(actions.map((a) => (a as unknown as { moderator_user_id: string }).moderator_user_id))];
    const mods = await User.findAll({ where: { user_id: modIds }, attributes: ["user_id", "username"] });
    const nameById = new Map(mods.map((m) => [m.user_id, m.username]));

    const withNames = actions.map((a) => {
      const o = a.toJSON() as Record<string, unknown>;
      o.moderator_username = nameById.get(o.moderator_user_id as string) || null;
      return o;
    });

    return NextResponse.json({ actions: withNames });
  } catch (error) {
    console.error("Error listing actions:", error);
    return NextResponse.json({ error: "Failed to list actions" }, { status: 500 });
  }
}
