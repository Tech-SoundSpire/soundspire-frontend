import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";
import { User } from "@/models/User";
import SongReview from "@/models/reviews/SongReview";
import SongCache from "@/models/reviews/SongCache";
import { searchCatalog } from "@/lib/spotify";
import { sequelize } from "@/lib/dbConfig";
import { Op } from "sequelize";
import "@/models/index";

// Resolve an onboarded artist's Spotify artist ID by searching the SPOTIFY catalog by name.
// We must use Spotify (not SoundCharts) as the source because reviews/SongCache are keyed by
// Spotify IDs, and SoundCharts sometimes links a DIFFERENT Spotify artist ID than Spotify's
// own catalog uses (e.g. Kanye West) — which would never match the cached tracks.
async function resolveSpotifyArtistId(artistName: string | null): Promise<string | null> {
  if (!artistName || !artistName.trim()) return null;
  try {
    const results = await searchCatalog(artistName.trim(), "artist", 5);
    const items: any[] = results?.artists?.items || [];
    if (items.length === 0) return null;
    // Prefer an exact (case-insensitive) name match; else the top result.
    const exact = items.find((a) => a.name?.toLowerCase() === artistName.trim().toLowerCase());
    return (exact?.id || items[0]?.id || null) as string | null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const artistId = request.nextUrl.searchParams.get("artistId");
    if (!artistId) {
      return NextResponse.json({ error: "artistId required" }, { status: 400 });
    }

    const debug = request.nextUrl.searchParams.get("debug") === "1";

    // Look up the onboarded artist to get its Spotify artist ID (via SoundCharts uuid).
    const artist = await Artist.findByPk(artistId);
    if (!artist) return NextResponse.json(debug ? { reviews: [], _debug: "artist row not found" } : { reviews: [] });

    const spotifyArtistId = await resolveSpotifyArtistId(artist.artist_name);
    // Spotify IDs are base62 (alphanumeric); reject anything else before using in a literal.
    if (!spotifyArtistId || !/^[A-Za-z0-9]+$/.test(spotifyArtistId)) {
      return NextResponse.json(debug ? { reviews: [], _debug: { msg: "no spotify id resolved", artist_name: artist.artist_name } } : { reviews: [] });
    }

    // Find cached tracks/albums by this Spotify artist. Match BOTH:
    //  - the scalar primary artist_id column (always set), and
    //  - artists_json containment (covers featured/secondary artists; null on older rows).
    // spotifyArtistId is validated as base62 above, so it's safe to inline.
    const songs = await SongCache.findAll({
      where: {
        [Op.or]: [
          { artist_id: spotifyArtistId },
          sequelize.literal(`artists_json @> '[{"id":"${spotifyArtistId}"}]'`),
        ],
      },
      attributes: ["spotify_track_id", "track_name", "artist_name", "album_art_url"],
      limit: 200,
    });

    if (songs.length === 0) return NextResponse.json(debug ? { reviews: [], _debug: { msg: "no cached songs for spotify artist", spotifyArtistId } } : { reviews: [] });

    const trackIds = songs.map((s: any) => s.spotify_track_id);
    const songByTrack = new Map(songs.map((s: any) => [s.spotify_track_id, s]));

    // Public reviews for those tracks/albums.
    const reviews = await SongReview.findAll({
      where: { spotify_track_id: { [Op.in]: trackIds }, is_private: false },
      order: [["created_at", "DESC"]],
      limit: 50,
    });

    // Enrich with user + song display info, matching the SongReview shape the app expects.
    const userIds = [...new Set(reviews.map((r: any) => r.user_id))];
    const users = userIds.length > 0
      ? await User.findAll({ where: { user_id: userIds }, attributes: ["user_id", "username", "full_name", "profile_picture_url"] })
      : [];
    const userMap = new Map(users.map((u: any) => [u.user_id, u]));

    const enriched = reviews.map((r: any) => {
      const song = songByTrack.get(r.spotify_track_id);
      const u = userMap.get(r.user_id);
      return {
        review_id: r.review_id,
        spotify_track_id: r.spotify_track_id,
        review_text: r.review_text,
        rating: r.rating != null ? Number(r.rating) : null,
        like_count: r.like_count,
        comment_count: r.comment_count,
        created_at: r.created_at,
        user: u ? { username: u.username, full_name: u.full_name, profile_picture_url: u.profile_picture_url } : null,
        song: song ? { track_name: song.track_name, artist_name: song.artist_name, album_art_url: song.album_art_url } : null,
      };
    });

    return NextResponse.json({ reviews: enriched });
  } catch (error) {
    console.error("Error fetching artist reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
