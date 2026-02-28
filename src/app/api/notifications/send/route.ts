import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { notifyCommunitySubscribers } from "@/utils/notifications";
import jwt from "jsonwebtoken";

// POST: create notifications for community subscribers (used by client-side actions like all-chat)
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const { communityId, message, link, type } = await request.json();
    if (!communityId || !message) {
      return NextResponse.json({ error: "communityId and message required" }, { status: 400 });
    }

    await notifyCommunitySubscribers(communityId, decoded.id, message, link || "/feed", type || "new_post");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
