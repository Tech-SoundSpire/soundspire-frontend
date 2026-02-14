import { NextRequest, NextResponse } from "next/server";
import Artist from "@/models/Artist";
import { Op } from "sequelize";
import "@/models/index";

export async function GET(request: NextRequest) {
    try {
        const q = request.nextUrl.searchParams.get("q");

        const where: any = q
            ? { artist_name: { [Op.iLike]: `%${q}%` } }
            : q === ""
            ? {} // empty string = return all
            : { featured: true };

        const artists = await Artist.findAll({
            where,
            attributes: [
                "artist_id",
                "artist_name",
                "profile_picture_url",
                "bio",
                "slug",
            ],
            order: [["created_at", "DESC"]],
            limit: q ? 20 : 8,
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
