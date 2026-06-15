import { NextRequest, NextResponse } from "next/server";
import Artist from "@/models/Artist";
import { Op } from "sequelize";
import "@/models/index";

export async function GET(request: NextRequest) {
    try {
        const q = request.nextUrl.searchParams.get("q");

        // - q = "<term>"  → name search (any artist, incl. cached SoundCharts rows)
        // - q = ""        → return ALL artists (used by "See More")
        // - no q          → default Explore carousel: ALL ONBOARDED artists (user_id set),
        //                   so every artist who has joined the platform is shown by default,
        //                   regardless of preferences or "featured" status.
        const where: any = q
            ? { artist_name: { [Op.iLike]: `%${q}%` } }
            : q === ""
            ? {}
            : { user_id: { [Op.ne]: null } };

        const artists = await Artist.findAll({
            where,
            attributes: [
                "artist_id",
                "artist_name",
                "profile_picture_url",
                "bio",
                "slug",
                "user_id",
                "third_party_id",
            ],
            order: [["created_at", "DESC"]],
            limit: q ? 20 : 100,
        });

        return NextResponse.json(artists);
    } catch (error) {
        console.error("Error fetching artists:", error);
        return NextResponse.json(
            { error: "Failed to fetch artists" },
            { status: 500 }
        );
    }
}
