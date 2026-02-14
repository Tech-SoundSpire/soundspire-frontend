import { NextRequest, NextResponse } from "next/server";
import Review from "@/models/Review";
import { User } from "@/models/User";
import Artist from "@/models/Artist";
import "@/models/index";

export async function GET() {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_id",
            "username",
            "full_name",
            "profile_picture_url",
          ],
        },
        {
          model: Artist,
          as: "artist",
          attributes: ["artist_id", "artist_name", "profile_picture_url", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 6, // Limit to 6 reviews for the explore page
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
