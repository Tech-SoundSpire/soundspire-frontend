import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongRating from "@/models/reviews/SongRating";
import SongAggregate from "@/models/reviews/SongAggregate";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectionTestingAndHelper();
    const { id } = await params;

    const aggregate = await SongAggregate.findByPk(id);

    let userRating = null;
    const token = request.cookies.get("token")?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const rating = await SongRating.findOne({ where: { user_id: decoded.id, spotify_track_id: id } });
        userRating = rating ? Number(rating.rating) : null;
      } catch {}
    }

    return NextResponse.json({
      spotify_track_id: id,
      avg_rating: aggregate ? Number(aggregate.avg_rating) : null,
      rating_count: aggregate?.rating_count || 0,
      review_count: aggregate?.review_count || 0,
      like_count: aggregate?.like_count || 0,
      log_count: aggregate?.log_count || 0,
      rating_distribution: aggregate?.rating_distribution || {},
      user_rating: userRating,
    });
  } catch (error: any) {
    console.error("Rating fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
