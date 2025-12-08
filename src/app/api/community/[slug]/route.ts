import Artist from "@/models/Artist";
import Community from "@/models/Community";
import Social from "@/models/Social";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectionTestingAndHelper();
        const { slug } = await params;

        const artist = await Artist.findOne({
            where: { slug },
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
            },
        });
    } catch (err) {
        console.error("Error fetching artist profile: ", err);
        return NextResponse.json(
            {
                error: "Failed to load artist data",
            },
            { status: 500 }
        );
    }
}
