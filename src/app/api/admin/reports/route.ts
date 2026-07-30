import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import Report, { REPORT_TARGET_TYPES, REPORT_STATUSES } from "@/models/Report";
import { User } from "@/models";

// GET /api/admin/reports?status=&target_type= - filtered reports queue.
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const targetType = searchParams.get("target_type");

    const where: Record<string, unknown> = {};
    if (status && REPORT_STATUSES.includes(status as never)) where.status = status;
    if (targetType && REPORT_TARGET_TYPES.includes(targetType as never)) where.target_type = targetType;

    const reports = await Report.findAll({
      where,
      include: [{ model: User, as: "reporter", attributes: ["user_id", "username", "full_name"] }],
      order: [["created_at", "DESC"]],
      limit: 200,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error listing reports:", error);
    return NextResponse.json({ error: "Failed to list reports" }, { status: 500 });
  }
}
