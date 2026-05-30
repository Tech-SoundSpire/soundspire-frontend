import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import ReviewComment from "@/models/reviews/ReviewComment";
import SongReview from "@/models/reviews/SongReview";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { reviewId } = await params;
    await connectionTestingAndHelper();

    const comments = await ReviewComment.findAll({
      where: { review_id: reviewId },
      order: [["created_at", "ASC"]],
      raw: true,
    });

    const userIds = comments.map((c: any) => c.user_id);
    const users = userIds.length > 0
      ? await User.findAll({
          where: { user_id: userIds },
          attributes: ["user_id", "username", "profile_picture_url"],
          raw: true,
        })
      : [];
    const userMap = new Map(users.map((u: any) => [u.user_id, u]));

    const enriched = comments.map((c: any) => ({
      ...c,
      username: userMap.get(c.user_id)?.username || "Unknown",
      profile_picture_url: userMap.get(c.user_id)?.profile_picture_url || null,
    }));

    return NextResponse.json({ comments: enriched });
  } catch (error: any) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ comments: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await params;
    await connectionTestingAndHelper();
    const { comment_text } = await request.json();

    if (!comment_text || comment_text.trim().length < 1) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const comment = await ReviewComment.create({
      user_id: userId,
      review_id: reviewId,
      comment_text: comment_text.trim(),
    });

    await SongReview.increment("comment_count", { where: { review_id: reviewId } });

    const user = await User.findByPk(userId, {
      attributes: ["username", "profile_picture_url"],
      raw: true,
    });

    return NextResponse.json({
      success: true,
      comment: {
        ...(comment as any).dataValues || comment,
        username: (user as any)?.username || "Unknown",
        profile_picture_url: (user as any)?.profile_picture_url || null,
      },
    });
  } catch (error: any) {
    console.error("Comment create error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
