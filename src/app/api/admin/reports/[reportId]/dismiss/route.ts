import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import Report from "@/models/Report";
import { ModeratorAction } from "@/models";

// POST /api/admin/reports/[reportId]/dismiss - dismiss a report without action.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { reportId } = await params;
    const report = await Report.findByPk(reportId);
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    await report.update({ status: "dismissed" });
    await ModeratorAction.create({
      moderator_user_id: admin.userId,
      action: "dismiss",
      target_type: (report as unknown as { target_type: string }).target_type,
      target_id: (report as unknown as { target_id: string }).target_id,
      note: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing report:", error);
    return NextResponse.json({ error: "Failed to dismiss report" }, { status: 500 });
  }
}
