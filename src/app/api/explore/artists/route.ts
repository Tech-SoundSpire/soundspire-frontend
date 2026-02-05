import { NextResponse } from "next/server";
import { Op } from "sequelize";
import Artist from "@/models/Artist";
import "@/models/index";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        const whereClause: any = {
            featured: true,
        };

        // ✅ Search logic (only when search param exists)
        if (search && search.trim().length > 0) {
            whereClause[Op.or] = [
                {
                    artist_name: {
                        [Op.iLike]: `%${search}%`,
                    },
                },
                {
                    bio: {
                        [Op.iLike]: `%${search}%`,
                    },
                },
            ];
        }

        const artists = await Artist.findAll({
            where: whereClause,
            attributes: [
                "artist_id",
                "artist_name",
                "profile_picture_url",
                "bio",
                "slug",
            ],
            order: [["created_at", "DESC"]],
            limit: 8,
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
