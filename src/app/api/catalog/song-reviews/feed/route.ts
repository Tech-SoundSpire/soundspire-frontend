import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongReview from "@/models/reviews/SongReview";
import SongCache from "@/models/reviews/SongCache";
import ReviewLike from "@/models/reviews/ReviewLike";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const { rows: reviews, count } = await SongReview.findAndCountAll({
      where: { is_private: false },
      order: [["created_at", "DESC"]],
      limit,
      offset,
      raw: true,
    });

    const userIds = reviews.map((r: any) => r.user_id);
    const users = userIds.length > 0
      ? await User.findAll({
          where: { user_id: userIds },
          attributes: ["user_id", "username", "profile_picture_url"],
          raw: true,
        })
      : [];
    const userMap = new Map(users.map((u: any) => [u.user_id, u]));

    // Fetch song metadata for all reviewed tracks
    const trackIds = [...new Set(reviews.map((r: any) => r.spotify_track_id))];
    const songs = trackIds.length > 0
      ? await SongCache.findAll({
          where: { spotify_track_id: trackIds },
          attributes: ["spotify_track_id", "track_name", "artist_name", "album_art_url"],
          raw: true,
        })
      : [];
    const songMap = new Map(songs.map((s: any) => [s.spotify_track_id, s]));

    // Check which reviews the current user has liked
    let userLikedSet = new Set<string>();
    const token = request.cookies.get("token")?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const reviewIds = reviews.map((r: any) => r.review_id);
        if (reviewIds.length > 0) {
          const likes = await ReviewLike.findAll({
            where: { user_id: decoded.id, review_id: reviewIds },
            attributes: ["review_id"],
            raw: true,
          });
          userLikedSet = new Set(likes.map((l: any) => l.review_id));
        }
      } catch {}
    }

    const enriched = reviews.map((r: any) => ({
      ...r,
      rating: r.rating ? Number(r.rating) : null,
      user: userMap.get(r.user_id) || { username: "Unknown", profile_picture_url: null },
      song: songMap.get(r.spotify_track_id) || null,
      user_liked: userLikedSet.has(r.review_id),
    }));

    return NextResponse.json({
      reviews: enriched,
      total: count,
      page,
    });
  } catch (error: any) {
    console.error("Feed error:", error);
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }
}
