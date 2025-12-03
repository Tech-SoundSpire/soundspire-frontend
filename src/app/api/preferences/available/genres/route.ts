import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Genres from "@/models/Genres";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    
    // Get all available genres
    const genres = await Genres.findAll({
      order: [['name', 'ASC']]
    });

    return NextResponse.json({
      genres: genres.map(genre => genre.toJSON())
    });

  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
