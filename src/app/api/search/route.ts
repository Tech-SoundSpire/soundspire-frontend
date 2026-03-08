import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Artist from "@/models/Artist";
import Review from "@/models/Review";
import Community from "@/models/Community";
import "@/models/index";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search");

    if (!query || !query.trim()) {
      return NextResponse.json({ artists: [], reviews: [], communities: [] });
    }

    const searchValue = `%${query}%`;

    const [artists, reviews, communities] = await Promise.all([
      Artist.findAll({
        where: { artist_name: { [Op.iLike]: searchValue } },
        attributes: ["artist_id", "artist_name", "slug"],
        limit: 5,
      }),
      Review.findAll({
        where: { title: { [Op.iLike]: searchValue } },
        attributes: ["review_id", "title"],
        limit: 5,
      }),
      Community.findAll({
        where: { name: { [Op.iLike]: searchValue } },
        include: [{ model: Artist, as: "Artist", attributes: ["slug"] }],
        attributes: ["community_id", "name"],
        limit: 5,
      }),
    ]);

    return NextResponse.json({
      artists: artists.map((a: any) => ({ artist_name: a.artist_name, slug: a.slug })),
      reviews: reviews.map((r: any) => ({ review_id: r.review_id, title: r.title })),
      communities: communities.map((c: any) => ({ name: c.name, artist_slug: c.Artist?.slug ?? null })),
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
