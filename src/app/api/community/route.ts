import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Community from "@/models/Community";
import Artist from "@/models/Artist";
import Forum from "@/models/Forum";

/* =========================
   GET → fetch / search communities
   ========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search && search.trim()) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const communities = await Community.findAll({
      where,
      include: [
        {
          model: Artist,
          as: "artist",          // ✅ MATCHES MODEL
          attributes: [
            "artist_id",
            "artist_name",
            "slug",
            "profile_picture_url",
            "cover_photo_url",
          ],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // 🔁 Normalize response for frontend
    const formatted = communities.map((c: any) => ({
      community_id: c.community_id,
      name: c.name,
      description: c.description,
      artist_slug: c.artist?.slug ?? null,
      artist_profile_picture_url: c.artist?.profile_picture_url ?? null,
      artist_cover_photo_url: c.artist?.cover_photo_url ?? null,
    }));

    return NextResponse.json({ communities: formatted });
  } catch (err) {
    console.error("COMMUNITY SEARCH ERROR 👉", err);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → create community
   ========================= */
export async function POST(req: Request) {
    try {
        const { artist_id, name, description } = await req.json();

        if (!artist_id || !name) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        const community = await Community.create({
            artist_id,
            name,
            description,
            subscription_fee: 0,
            subscription_interval: "monthly",
        });

        // Create default forums
        try {
            await Forum.create({
                community_id: community.community_id,
                name: "All Chat",
                description: "Real-time chat for all subscribed members",
                forum_type: "all_chat",
            });

            await Forum.create({
                community_id: community.community_id,
                name: "Fan Art",
                description: "Share your artwork with the community",
                forum_type: "fan_art",
            });
        } catch (forumError) {
            console.error("Failed to create forums:", forumError);
        }

        return NextResponse.json({ community });
    } catch (err) {
        console.error("Community creation error:", err);
        return NextResponse.json(
            { error: "Failed to create community" },
            { status: 500 }
        );
    }
}
