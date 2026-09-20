import { NextRequest, NextResponse } from "next/server";
import Genres from "@/models/Genres";
import Artist from "@/models/Artist";
import Community from "@/models/Community";
import CommunitySubscription from "@/models/CommunitySubscription";
import { Op, fn, col } from "sequelize";
import "@/models/index";

// Artists tagged with a genre, ranked by popularity (active community subscribers).
// Onboarded artists carry a slug (→ community page); off-platform cached artists carry a
// SoundCharts uuid (→ vote page). No popularity column exists, so subscriber count is the proxy.
export async function GET(req: NextRequest, { params }: { params: Promise<{ genreId: string }> }) {
  try {
    const { genreId: rawGenreId } = await params;
    const genreId = decodeURIComponent(rawGenreId).trim();

    const target = await Genres.findByPk(genreId, { attributes: ["genre_id", "name"] });
    if (!target) return NextResponse.json({ genre: null, artists: [] });

    // Duplicate genre rows exist (artist signup uses free-text chips + findOrCreate, so the same
    // genre gets multiple ids/casings). Gather artists across every Genres row sharing this name,
    // not just the curated id Explore links to - otherwise the list is wrongly empty.
    const sameName = await Genres.findAll({
      where: { name: { [Op.iLike]: (target as any).name } },
      include: [{
        model: Artist,
        as: "artist",
        through: { attributes: [] },
        attributes: ["artist_id", "artist_name", "profile_picture_url", "slug", "user_id", "third_party_id"],
      }],
    });
    const byId = new Map<string, any>();
    sameName.forEach((g: any) => (g.artist || []).forEach((a: any) => byId.set(a.artist_id, a)));
    const artists = [...byId.values()];
    const artistIds = artists.map((a) => a.artist_id);

    // artist -> community, community -> active subscriber count
    const communities = artistIds.length
      ? await Community.findAll({ where: { artist_id: artistIds }, attributes: ["community_id", "artist_id"] })
      : [];
    const commByArtist = new Map(communities.map((c: any) => [c.artist_id, c.community_id]));
    const commIds = communities.map((c: any) => c.community_id);

    const counts = commIds.length
      ? await CommunitySubscription.findAll({
          where: { community_id: commIds, is_active: true, end_date: { [Op.gte]: new Date() } },
          attributes: ["community_id", [fn("COUNT", col("subscription_id")), "cnt"]],
          group: ["community_id"],
          raw: true,
        })
      : [];
    const cntByComm = new Map((counts as any[]).map((r) => [r.community_id, parseInt(r.cnt, 10) || 0]));

    const result = artists
      .map((a) => {
        const commId = commByArtist.get(a.artist_id);
        return {
          artist_id: a.artist_id,
          name: a.artist_name,
          imageUrl: a.profile_picture_url,
          slug: a.slug,
          onSoundSpire: !!a.user_id,
          soundcharts_uuid: a.third_party_id || null,
          subscriberCount: commId ? (cntByComm.get(commId) || 0) : 0,
        };
      })
      .sort((x, y) => y.subscriberCount - x.subscriberCount);

    // Temporary diagnostic: /api/explore/genres/<id>/artists?debug=1
    if (req.nextUrl.searchParams.get("debug") === "1") {
      const exact = await Genres.findByPk(genreId, {
        include: [{ model: Artist, as: "artist", through: { attributes: [] }, attributes: ["artist_id"] }],
      });
      return NextResponse.json({
        debug: {
          targetName: (target as any).name,
          matchedGenreRows: sameName.length,
          matchedGenreNames: sameName.map((g: any) => g.name),
          artistsViaExactId: (((exact as any)?.artist) || []).length,
          artistsViaName: artists.length,
        },
        genre: { genre_id: (target as any).genre_id, name: (target as any).name },
        artists: result,
      });
    }

    return NextResponse.json({ genre: { genre_id: (target as any).genre_id, name: (target as any).name }, artists: result });
  } catch (error) {
    console.error("Error fetching genre artists:", error);
    return NextResponse.json({ error: "Failed to fetch genre artists" }, { status: 500 });
  }
}
