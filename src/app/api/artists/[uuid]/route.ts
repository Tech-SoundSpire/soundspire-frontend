import { cleanSoundchartsBio } from "@/utils/cleanSoundchartsBio";
import { NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";
import { createArtistSlug } from "@/utils/createArtistSlug";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;

    await connectionTestingAndHelper();

    // 1. Check DB cache first
    const cached = await Artist.findOne({
        where: { third_party_platform: "soundcharts", third_party_id: uuid },
    });

    if (cached) {
        return NextResponse.json({
            uuid,
            slug: cached.slug,
            name: cached.artist_name,
            imageUrl: cached.profile_picture_url,
            biography: cached.bio,
            genres: [],
            onSoundSpire: !!cached.user_id, // has joined the platform
        });
    }

    // 2. Fetch from Soundcharts
    const appId = process.env.SOUNDCHARTS_CLIENT_ID;
    const apiKey = process.env.SOUNDCHARTS_TOKEN;

    if (!appId || !apiKey) {
        return NextResponse.json({ error: "SoundCharts API credentials not configured" }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://customer.api.soundcharts.com/api/v2.9/artist/${encodeURIComponent(uuid)}`,
            { headers: { "x-app-id": appId, "x-api-key": apiKey } }
        );

        if (!response.ok) {
            throw new Error(`Soundcharts fetch failed: ${response.status}`);
        }

        const data = await response.json();
        const artist_info = data.object;
        artist_info.biography = cleanSoundchartsBio(artist_info.biography);

        // 3. Store in DB for future requests
        try {
            const slug = await createArtistSlug(artist_info.name);
            await Artist.create({
                artist_name: artist_info.name,
                bio: artist_info.biography || null,
                profile_picture_url: artist_info.imageUrl || null,
                third_party_platform: "soundcharts",
                third_party_id: uuid,
                slug,
                user_id: null, // not onboarded yet
            });
        } catch (dbErr) {
            // Non-fatal — still return the data even if caching fails
            console.error("Failed to cache artist in DB:", dbErr);
        }

        return NextResponse.json(artist_info);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch artist from SoundCharts" },
            { status: 500 }
        );
    }
}
