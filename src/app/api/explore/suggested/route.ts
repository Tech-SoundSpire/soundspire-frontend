import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import UserPreferences from "@/models/UserPreferences";
import Artist from "@/models/Artist";
import "@/models/index";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const prefs = await UserPreferences.findOne({ where: { user_id: userId } });
    if (!prefs) {
      return NextResponse.json({ artists: [] });
    }

    // Get SoundCharts artists from preferences
    const scArtists = (prefs.favorite_soundcharts_artists || []) as any[];

    // Get DB artists from preferences
    const dbArtistIds = prefs.favorite_artists || [];
    const dbArtists = dbArtistIds.length > 0
      ? await Artist.findAll({
          where: { artist_id: dbArtistIds },
          attributes: ["artist_id", "artist_name", "profile_picture_url", "slug"],
        })
      : [];

    // Merge: DB artists get slug (they're on SoundSpire), SC-only artists don't
    const dbSlugs = new Set(dbArtists.map((a) => a.artist_name));
    const merged = [
      ...dbArtists.map((a) => ({
        artist_id: a.artist_id,
        name: a.artist_name,
        imageUrl: a.profile_picture_url,
        slug: a.slug,
        onSoundSpire: true,
      })),
      ...scArtists
        .filter((a: any) => !dbSlugs.has(a.name))
        .map((a: any) => ({
          artist_id: a.soundcharts_uuid,
          name: a.name,
          imageUrl: a.imageUrl,
          soundcharts_uuid: a.soundcharts_uuid,
          slug: null,
          onSoundSpire: false,
        })),
    ];

    return NextResponse.json({ artists: merged });
  } catch (error) {
    console.error("Error fetching suggested artists:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
