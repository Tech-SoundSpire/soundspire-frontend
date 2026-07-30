import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { getDataFromToken } from "@/utils/getDataFromToken";
import Block from "@/models/Block";

// DELETE /api/blocks/[blockedUserId] - unblock a user.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ blockedUserId: string }> }
) {
  try {
    await connectionTestingAndHelper();
    const blockerId = await getDataFromToken(request);
    if (!blockerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blockedUserId } = await params;
    await Block.destroy({
      where: { blocker_user_id: blockerId, blocked_user_id: blockedUserId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing block:", error);
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
}
