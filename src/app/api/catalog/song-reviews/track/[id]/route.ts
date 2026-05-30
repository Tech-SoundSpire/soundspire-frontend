import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongReview from "@/models/reviews/SongReview";
import { User } from "@/models/User";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectionTestingAndHelper();
    const { id } = await params;
    const sort = request.nextUrl.searchParams.get("sort") || "popular";
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const order: any = sort === "popular" ? [["like_count", "DESC"]] : [["created_at", "DESC"]];

    const { rows: reviews, count } = await SongReview.findAndCountAll({
      where: { spotify_track_id: id, is_private: false },
      order,
      limit,
      offset,
      raw: true,
    });

    const userIds = reviews.map((r: any) => r.user_id);
    const users = await User.findAll({
      where: { user_id: userIds },
      attributes: ["user_id", "username", "profile_picture_url"],
      raw: true,
    });
    const userMap = new Map(users.map((u: any) => [u.user_id, u]));

    const enriched = reviews.map((r: any) => ({
      ...r,
      rating: r.rating ? Number(r.rating) : null,
      user: userMap.get(r.user_id) || { username: "Unknown", profile_picture_url: null },
    }));

    return NextResponse.json({
      reviews: enriched,
      total: count,
      page,
      total_pages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
