import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await params;
    await connectionTestingAndHelper();
    const { review_text, rating } = await request.json();

    if (!review_text || review_text.trim().length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }

    const review = await SongReview.findByPk(reviewId);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (review.user_id !== userId) return NextResponse.json({ error: "Not your review" }, { status: 403 });

    await review.update({
      review_text: review_text.trim(),
      rating: rating || null,
      updated_at: new Date(),
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Review update error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await params;
    await connectionTestingAndHelper();

    const review = await SongReview.findByPk(reviewId);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (review.user_id !== userId) return NextResponse.json({ error: "Not your review" }, { status: 403 });

    await review.destroy();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review delete error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
