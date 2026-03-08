import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Community from "@/models/Community";
import Artist from "@/models/Artist";
import CommunitySubscription from "@/models/CommunitySubscription";
import "@/models/index";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search");

    if (!query || !query.trim()) {
      return NextResponse.json({ communities: [] });
    }

    const searchValue = `%${query}%`;

    const communities = await Community.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: searchValue } },
          { description: { [Op.iLike]: searchValue } },
        ],
      },
      include: [{
        model: Artist,
        as: "Artist",
        attributes: ["artist_name", "slug", "profile_picture_url"],
      }],
      attributes: ["community_id", "name", "description"],
      limit: 10,
    });

    return NextResponse.json({
      communities: communities.map((c: any) => ({
        community_id: c.community_id,
        name: c.name,
        description: c.description,
        artist_name: c.Artist?.artist_name,
        artist_slug: c.Artist?.slug,
        artist_profile_picture_url: c.Artist?.profile_picture_url,
      })),
    });
  } catch (error) {
    console.error("COMMUNITIES SEARCH ERROR:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
