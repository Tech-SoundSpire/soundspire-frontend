import { NextResponse } from "next/server";
import Artist from "@/models/Artist";
import "@/models/index";

export async function GET() {
    try {
        const artists = await Artist.findAll({
            where: {
                featured: true,
            },
            attributes: [
                "artist_id",
                "artist_name",
                "profile_picture_url",
                "bio",
                "slug",
            ],
            order: [["created_at", "DESC"]],
            limit: 8, // Limit to 8 artists for the explore page
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
