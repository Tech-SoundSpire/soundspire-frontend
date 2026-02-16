import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Review from "@/models/Review";
import { User } from "@/models/User";
import Artist from "@/models/Artist";
import "@/models/index";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const whereClause: any = {};

    // ✅ Search logic (only if search param exists)
    if (search && search.trim().length > 0) {
      whereClause[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          text_content: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const reviews = await Review.findAll({
      where: whereClause,
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
          ...(search
            ? {
                where: {
                  [Op.or]: [
                    { username: { [Op.iLike]: `%${search}%` } },
                    { full_name: { [Op.iLike]: `%${search}%` } },
                  ],
                },
              }
            : {}),
        },
        {
          model: Artist,
          as: "artist",
          attributes: ["artist_id", "artist_name", "profile_picture_url"],
          ...(search
            ? {
                where: {
                  artist_name: { [Op.iLike]: `%${search}%` },
                },
              }
            : {}),
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 6,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
