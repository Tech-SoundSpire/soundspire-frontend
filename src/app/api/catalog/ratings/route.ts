import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongRating from "@/models/reviews/SongRating";
import SongReview from "@/models/reviews/SongReview";
import SongAggregate from "@/models/reviews/SongAggregate";
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
    const { spotify_track_id, rating } = await request.json();

    if (!spotify_track_id || !rating || rating < 0.5 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const [songRating, created] = await SongRating.upsert({
      user_id: userId,
      spotify_track_id,
      rating,
      updated_at: new Date(),
    });

    // Sync rating to user's existing review if they have one
    await SongReview.update(
      { rating, updated_at: new Date() },
      { where: { user_id: userId, spotify_track_id } }
    );

    // Update aggregate
    const allRatings = await SongRating.findAll({ where: { spotify_track_id } });
    const ratings = allRatings.map(r => Number(r.rating));
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const distribution: Record<string, number> = {};
    ratings.forEach(r => { distribution[r.toString()] = (distribution[r.toString()] || 0) + 1; });

    await SongAggregate.upsert({
      spotify_track_id,
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: ratings.length,
      review_count: 0,
      like_count: 0,
      log_count: 0,
      rating_distribution: distribution,
      last_updated: new Date(),
    });

    return NextResponse.json({ success: true, rating: songRating, created });
  } catch (error: any) {
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionTestingAndHelper();
    const { spotify_track_id } = await request.json();

    await SongRating.destroy({ where: { user_id: userId, spotify_track_id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Rating delete error:", error);
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 });
  }
}
