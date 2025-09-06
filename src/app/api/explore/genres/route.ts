import { NextRequest, NextResponse } from "next/server";
import Genres from "@/models/Genres";
import "@/models/index";

export async function GET() {
  try {
    const genres = await Genres.findAll({
      attributes: ["genre_id", "name"],
      order: [["name", "ASC"]],
      limit: 8, // Limit to 8 genres for the explore page
    });

    return NextResponse.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 },
    );
  }
}
