import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { getDataFromToken } from "@/utils/getDataFromToken";
import Block from "@/models/Block";
import { User } from "@/models";

// GET /api/blocks - list users the caller has blocked.
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const blocks = await Block.findAll({
      where: { blocker_user_id: userId },
      include: [{ model: User, as: "blockedUser", attributes: ["user_id", "username", "full_name", "profile_picture_url"] }],
      order: [["created_at", "DESC"]],
    });
    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("Error listing blocks:", error);
    return NextResponse.json({ error: "Failed to list blocks" }, { status: 500 });
  }
}

// POST /api/blocks - block a user. Idempotent.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const blockerId = await getDataFromToken(request);
    if (!blockerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blocked_user_id } = await request.json();
    if (!blocked_user_id) {
      return NextResponse.json({ error: "blocked_user_id is required" }, { status: 400 });
    }
    if (blocked_user_id === blockerId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const [block] = await Block.findOrCreate({
      where: { blocker_user_id: blockerId, blocked_user_id },
    });
    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}
