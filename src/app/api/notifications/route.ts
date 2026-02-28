import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

// GET: fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const notifications = await Notification.findAll({
      where: { user_id: decoded.id },
      order: [["created_at", "DESC"]],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: { user_id: decoded.id, is_read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// PATCH: mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const { notificationIds } = await request.json();

    if (notificationIds === "all") {
      await Notification.update({ is_read: true }, { where: { user_id: decoded.id } });
    } else if (Array.isArray(notificationIds)) {
      await Notification.update({ is_read: true }, { where: { notification_id: notificationIds, user_id: decoded.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
