import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Genres from "@/models/Genres";
import "@/models/index";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const whereClause: any = {};

    // ✅ Search logic (only if search param exists)
    if (search && search.trim().length > 0) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const genres = await Genres.findAll({
      where: whereClause,
      attributes: ["genre_id", "name"],
      order: [["name", "ASC"]],
      limit: 8,
    });

    return NextResponse.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
