import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";
import Community from "@/models/Community";
import { User } from "@/models/User";
import SongCache from "@/models/reviews/SongCache";
import SongReview from "@/models/reviews/SongReview";
import "@/models/index";
import { searchCatalog } from "@/lib/spotify";

export async function GET(req: Request) {
  try {
    await connectionTestingAndHelper();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search");

    if (!query || !query.trim()) {
      return NextResponse.json({ artists: [], reviews: [], communities: [] });
    }

    const searchValue = `%${query}%`;

    const [artists, communities, songs, users, songReviews] = await Promise.all([
      Artist.findAll({
        where: { artist_name: { [Op.iLike]: searchValue } },
        attributes: ["artist_id", "artist_name", "slug", "profile_picture_url"],
        limit: 5,
      }),
      Community.findAll({
        where: { name: { [Op.iLike]: searchValue } },
        include: [{ model: Artist, as: "Artist", attributes: ["slug", "profile_picture_url"] }],
        attributes: ["community_id", "name"],
        limit: 5,
      }),
      SongCache.findAll({
        where: {
          [Op.or]: [
            { track_name: { [Op.iLike]: searchValue } },
            { artist_name: { [Op.iLike]: searchValue } },
          ],
        },
        attributes: ["spotify_track_id", "track_name", "artist_name", "album_art_url"],
        limit: 8,
      }),
      User.findAll({
        where: { username: { [Op.iLike]: searchValue } },
        attributes: ["user_id", "username", "full_name", "profile_picture_url"],
        limit: 5,
      }),
      SongReview.findAll({
        where: { review_text: { [Op.iLike]: searchValue } },
        attributes: ["review_id", "spotify_track_id", "review_text", "rating"],
        limit: 5,
      }),
    ]);

    // If no songs found in local cache, search Spotify catalog
    let songResults = songs.map((s: any) => ({
      spotify_track_id: s.spotify_track_id,
      track_name: s.track_name,
      artist_name: s.artist_name,
      album_art_url: s.album_art_url,
    }));

    if (songResults.length === 0) {
      try {
        const catalogResults = await searchCatalog(query, "track,artist", 8);
        const spotifyTracks = catalogResults?.tracks?.items?.map((t: any) => ({
          spotify_track_id: t.id,
          track_name: t.name,
          artist_name: t.artists?.map((a: any) => a.name).join(", ") || "",
          album_art_url: t.album?.images?.[0]?.url || null,
          source: "spotify",
        })) || [];
        songResults = spotifyTracks;

        // Also add Spotify artists if no internal artists found
        if (artists.length === 0) {
          const spotifyArtists = catalogResults?.artists?.items?.map((a: any) => ({
            artist_name: a.name,
            slug: null,
            profile_picture_url: a.images?.[0]?.url || null,
            source: "spotify",
          })) || [];
          return NextResponse.json({
            artists: spotifyArtists,
            communities: communities.map((c: any) => ({
              name: c.name,
              artist_slug: c.Artist?.slug ?? null,
              profile_picture_url: c.Artist?.profile_picture_url ?? null,
            })),
            songs: songResults,
            users: users.map((u: any) => ({
              user_id: u.user_id,
              username: u.username,
              full_name: u.full_name,
              profile_picture_url: u.profile_picture_url,
            })),
            reviews: songReviews.map((r: any) => ({
              review_id: r.review_id,
              spotify_track_id: r.spotify_track_id,
              title: r.review_text?.substring(0, 80),
              rating: r.rating,
            })),
          });
        }
      } catch (spotifyErr) {
        console.error("Spotify fallback search failed:", spotifyErr);
      }
    }

    return NextResponse.json({
      artists: artists.map((a: any) => ({
        artist_name: a.artist_name,
        slug: a.slug,
        profile_picture_url: a.profile_picture_url,
      })),
      communities: communities.map((c: any) => ({
        name: c.name,
        artist_slug: c.Artist?.slug ?? null,
        profile_picture_url: c.Artist?.profile_picture_url ?? null,
      })),
      songs: songResults,
      users: users.map((u: any) => ({
        user_id: u.user_id,
        username: u.username,
        full_name: u.full_name,
        profile_picture_url: u.profile_picture_url,
      })),
      reviews: songReviews.map((r: any) => ({
        review_id: r.review_id,
        spotify_track_id: r.spotify_track_id,
        title: r.review_text?.substring(0, 80),
        rating: r.rating,
      })),
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
