import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import UserPreferences from "@/models/UserPreferences";
import Genres from "@/models/Genres";
import Languages from "@/models/Languages";
import Artist from "@/models/Artist";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    
    const reqBody = await request.json();
    const { userId, genres, languages, favoriteArtists } = reqBody;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate and convert genre names to IDs
    let genreIds: string[] = [];
    if (genres && genres.length > 0) {
      const genreRecords = await Genres.findAll({
        where: { name: genres }
      });
      genreIds = genreRecords.map(g => g.genre_id);
    }

    // Validate and convert language names to IDs
    let languageIds: string[] = [];
    if (languages && languages.length > 0) {
      const languageRecords = await Languages.findAll({
        where: { name: languages }
      });
      languageIds = languageRecords.map(l => l.language_id);
    }

    // Validate and convert artist names to IDs from the artists table
    let artistIds: string[] = [];
    if (favoriteArtists && favoriteArtists.length > 0) {
      const artistRecords = await Artist.findAll({
        where: { artist_name: favoriteArtists }
      });
      artistIds = artistRecords.map(a => a.artist_id);
    }

    // Check if user already has preferences
    const existingPreferences = await UserPreferences.findOne({
      where: { user_id: userId }
    });

    if (existingPreferences) {
      // Update existing preferences
      await existingPreferences.update({
        genres: genreIds,
        languages: languageIds,
        favorite_artists: artistIds,
        updated_at: new Date()
      });
    } else {
      // Create new preferences
      await UserPreferences.create({
        user_id: userId,
        genres: genreIds,
        languages: languageIds,
        favorite_artists: artistIds
      });
    }

    return NextResponse.json({
      message: "Preferences saved successfully",
      success: true
    });

  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
