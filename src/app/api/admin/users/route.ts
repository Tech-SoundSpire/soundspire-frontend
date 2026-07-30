import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import { User } from "@/models";

// GET /api/admin/users?q= - search users (for the ban UI).
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const q = (new URL(request.url).searchParams.get("q") || "").trim();
    const where: Record<string, unknown> = {};
    if (q) {
      where[Op.or as unknown as string] = [
        { username: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      attributes: ["user_id", "username", "email", "full_name", "is_banned", "is_admin", "profile_picture_url"],
      order: [["username", "ASC"]],
      limit: 50,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
