import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { getDataFromToken } from "@/utils/getDataFromToken";
import Report, { REPORT_TARGET_TYPES, REPORT_REASONS } from "@/models/Report";

// POST /api/reports - file a report against a UGC item or a user.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const reporterId = await getDataFromToken(request);
    if (!reporterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { target_type, target_id, reason, details } = await request.json();

    if (!REPORT_TARGET_TYPES.includes(target_type)) {
      return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
    }
    if (!target_id) {
      return NextResponse.json({ error: "target_id is required" }, { status: 400 });
    }
    if (!REPORT_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    // One open report per reporter per target.
    const existing = await Report.findOne({
      where: { reporter_user_id: reporterId, target_type, target_id, status: "open" },
    });
    if (existing) {
      return NextResponse.json({ success: true, report: existing, alreadyReported: true });
    }

    const report = await Report.create({
      reporter_user_id: reporterId,
      target_type,
      target_id: String(target_id),
      reason,
      details: details ? String(details).slice(0, 2000) : null,
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
