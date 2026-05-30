import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongReview from "@/models/reviews/SongReview";
import SongRating from "@/models/reviews/SongRating";
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

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionTestingAndHelper();
    const { spotify_track_id, rating, review_text, contains_spoilers } = await request.json();

    if (!spotify_track_id || !review_text || review_text.trim().length < 10) {
      return NextResponse.json({ error: "Review text must be at least 10 characters" }, { status: 400 });
    }

    const existing = await SongReview.findOne({ where: { user_id: userId, spotify_track_id } });
    if (existing) {
      return NextResponse.json({ error: "You already reviewed this song. Edit your existing review." }, { status: 409 });
    }

    const review = await SongReview.create({
      user_id: userId,
      spotify_track_id,
      rating: rating || null,
      review_text: review_text.trim(),
      contains_spoilers: contains_spoilers || false,
    });

    if (rating) {
      await SongRating.upsert({
        user_id: userId,
        spotify_track_id,
        rating,
        updated_at: new Date(),
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Review create error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
