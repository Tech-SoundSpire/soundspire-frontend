import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    
    // Get all available artists, ordered by name
    const artists = await Artist.findAll({
      order: [['artist_name', 'ASC']],
      attributes: ['artist_id', 'artist_name', 'profile_picture_url', 'bio', 'verification_status', 'featured']
    });

    return NextResponse.json({
      artists: artists.map(artist => artist.toJSON())
    });

  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}
