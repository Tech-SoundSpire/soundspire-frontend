import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";
import Community from "@/models/Community";
import Social from "@/models/Social";

interface DecodedToken {
    id: string;
}

export async function GET(req: NextRequest) {
    try {
        await connectionTestingAndHelper();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as DecodedToken;
        if (!decoded?.id) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        const artist = await Artist.findOne({
            where: { user_id: decoded.id },
            include: [
                {
                    model: Community,
                    as: "Communities",
                    attributes: [
                        "community_id",
                        "name",
                        "description",
                        "subscription_fee",
                        "subscription_interval",
                    ],
                },
                {
                    model: Social,
                    as: "socials",
                    attributes: ["platform", "url"],
                },
            ],
        });

        if (!artist) {
            return NextResponse.json(
                { error: "Artist not found" },
                { status: 404 }
            );
        }

        const artistData = artist.get({ plain: true }) as any;

        return NextResponse.json({
            artist: {
                artist_id: artist.artist_id,
                artist_name: artist.artist_name,
                bio: artist.bio,
                profile_picture_url: artist.profile_picture_url,
                cover_photo_url: artist.cover_photo_url,
                verification_status: artist.verification_status,
                socials: artistData.socials || [],
                community: artistData.Communities?.length
                    ? artistData.Communities[0]
                    : null,
                slug: artist.slug,
            },
        });
    } catch (err) {
        console.error("Error fetching artist dashboard:", err);
        return NextResponse.json(
            { error: "Failed to load artist data" },
            { status: 500 }
        );
    }
}
