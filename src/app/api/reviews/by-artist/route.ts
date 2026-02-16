import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Review from "@/models/Review";
import { User } from "@/models/User";
import "@/models/index";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const artistId = request.nextUrl.searchParams.get("artistId");
    if (!artistId) {
      return NextResponse.json({ error: "artistId required" }, { status: 400 });
    }

    const reviews = await Review.findAll({
      where: { artist_id: artistId },
      include: [{ model: User, as: "user", attributes: ["full_name", "username", "profile_picture_url"] }],
      order: [["created_at", "DESC"]],
      limit: 10,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching artist reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
