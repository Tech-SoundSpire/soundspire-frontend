import { NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongReview from "@/models/reviews/SongReview";
import SongCache from "@/models/reviews/SongCache";
import { QueryTypes } from "sequelize";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectionTestingAndHelper();

    // Get songs with most reviews in the last 24 hours, then fall back to most recent
    const trending = await User.sequelize!.query(
      `SELECT spotify_track_id, COUNT(*) as review_count, MAX(created_at) as latest_review
       FROM song_reviews
       WHERE is_private = false
       GROUP BY spotify_track_id
       ORDER BY
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') DESC,
         COUNT(*) DESC,
         MAX(created_at) DESC
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );

    if (!trending || trending.length === 0) {
      return NextResponse.json({ trending: [] });
    }

    // Get cached metadata for these tracks
    const trackIds = trending.map((t: any) => t.spotify_track_id);
    const songs = await SongCache.findAll({
      where: { spotify_track_id: trackIds },
      attributes: ["spotify_track_id", "track_name", "artist_name", "album_art_url"],
      raw: true,
    });
    const songMap = new Map(songs.map((s: any) => [s.spotify_track_id, s]));

    const enriched = trending.map((t: any) => ({
      spotify_track_id: t.spotify_track_id,
      review_count: Number(t.review_count),
      song: songMap.get(t.spotify_track_id) || null,
    }));

    return NextResponse.json({ trending: enriched });
  } catch (error: any) {
    console.error("Trending error:", error);
    return NextResponse.json({ trending: [] }, { status: 500 });
  }
}
