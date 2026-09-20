import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import UserPreferences from "@/models/UserPreferences";
import Artist from "@/models/Artist";
import { Op } from "sequelize";
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
          attributes: ["artist_id", "artist_name", "profile_picture_url", "slug", "user_id", "third_party_id"],
        })
      : [];

    // Merge: DB artists get slug (they're on SoundSpire), SC-only artists don't
    const dbByName = new Map(dbArtists.map((a) => [a.artist_name.toLowerCase(), a]));

    // For SC artists, check if they've since joined the platform via third_party_id
    const scUuids = scArtists.map((a: any) => a.soundcharts_uuid).filter(Boolean);
    const joinedSCMap = new Map<string, any>();
    if (scUuids.length > 0) {
      const joined = await Artist.findAll({
        where: { third_party_id: scUuids, third_party_platform: "soundcharts" },
        attributes: ["artist_id", "artist_name", "profile_picture_url", "slug", "third_party_id", "user_id"],
      });
      joined.forEach((a) => {
        if (a.user_id) joinedSCMap.set(a.third_party_id!, a); // only if actually onboarded
      });
    }

    // Fallback reconciliation by name (temporary): an artist may onboard without carrying the
    // favorited SoundCharts uuid as third_party_id, so also match onboarded artists by name.
    // NOTE: name matching is unsafe for homonyms/spelling variants - replace with a stable
    // external-ID bridge (Spotify artist ID / SoundCharts UUID) captured at onboarding.
    const scNames = scArtists.map((a: any) => a.name).filter(Boolean);
    const joinedByName = new Map<string, any>();
    if (scNames.length > 0) {
      const byName = await Artist.findAll({
        where: {
          user_id: { [Op.ne]: null },
          [Op.or]: scNames.map((n: string) => ({ artist_name: { [Op.iLike]: n } })),
        },
        attributes: ["artist_id", "artist_name", "profile_picture_url", "slug", "third_party_id", "user_id"],
      });
      byName.forEach((a) => joinedByName.set(a.artist_name.toLowerCase(), a));
    }

    const merged = [
      ...dbArtists.map((a) => ({
        artist_id: a.artist_id,
        name: a.artist_name,
        imageUrl: a.profile_picture_url,
        slug: a.slug,
        onSoundSpire: !!a.user_id,
        soundcharts_uuid: a.third_party_id || null,
      })),
      ...scArtists
        .filter((a: any) => !dbByName.has(a.name?.toLowerCase()))
        .map((a: any) => {
          const joined = joinedSCMap.get(a.soundcharts_uuid) || joinedByName.get(a.name?.toLowerCase());
          if (joined) {
            // Artist has joined the platform — show their community page
            return {
              artist_id: joined.artist_id,
              name: joined.artist_name,
              imageUrl: joined.profile_picture_url,
              slug: joined.slug,
              onSoundSpire: true,
            };
          }
          return {
            artist_id: a.soundcharts_uuid,
            name: a.name,
            imageUrl: a.imageUrl,
            soundcharts_uuid: a.soundcharts_uuid,
            slug: null,
            onSoundSpire: false,
          };
        }),
    ];

    return NextResponse.json({ artists: merged });
  } catch (error) {
    console.error("Error fetching suggested artists:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
