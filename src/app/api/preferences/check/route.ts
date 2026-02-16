import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import UserPreferences from "@/models/UserPreferences";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if user has preferences
    const preferences = await UserPreferences.findOne({
      where: { user_id: userId }
    });

    if (preferences) {
      // Check if they have any meaningful preferences
      const hasPreferences = (
        (preferences.genres && preferences.genres.length > 0) ||
        (preferences.languages && preferences.languages.length > 0) ||
        (preferences.favorite_artists && preferences.favorite_artists.length > 0) ||
        (preferences.favorite_soundcharts_artists && (preferences.favorite_soundcharts_artists as any[]).length > 0) ||
        (preferences.genre_names && (preferences.genre_names as any[]).length > 0) ||
        (preferences.language_names && (preferences.language_names as any[]).length > 0)
      );

      return NextResponse.json({
        hasPreferences,
        preferences: preferences.toJSON()
      });
    }

    return NextResponse.json({
      hasPreferences: false,
      preferences: null
    });

  } catch (error) {
    console.error("Error checking preferences:", error);
    return NextResponse.json(
      { error: "Failed to check preferences" },
      { status: 500 }
    );
  }
}
