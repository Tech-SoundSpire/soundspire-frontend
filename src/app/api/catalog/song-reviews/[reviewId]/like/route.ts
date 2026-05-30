import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import ReviewLike from "@/models/reviews/ReviewLike";
import SongReview from "@/models/reviews/SongReview";
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

export async function POST(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await params;
    await connectionTestingAndHelper();

    const [, created] = await ReviewLike.findOrCreate({
      where: { user_id: userId, review_id: reviewId },
      defaults: { user_id: userId, review_id: reviewId },
    });

    if (created) {
      await SongReview.increment("like_count", { where: { review_id: reviewId } });
    }

    return NextResponse.json({ success: true, liked: true });
  } catch (error: any) {
    console.error("Review like error:", error);
    return NextResponse.json({ error: "Failed to like" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await params;
    await connectionTestingAndHelper();

    const deleted = await ReviewLike.destroy({ where: { user_id: userId, review_id: reviewId } });

    if (deleted) {
      await SongReview.decrement("like_count", { where: { review_id: reviewId } });
    }

    return NextResponse.json({ success: true, liked: false });
  } catch (error: any) {
    console.error("Review unlike error:", error);
    return NextResponse.json({ error: "Failed to unlike" }, { status: 500 });
  }
}
