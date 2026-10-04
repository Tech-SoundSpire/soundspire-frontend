export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getCommunityArtist } from "@/lib/communityArtist";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const artist = await getCommunityArtist(slug);
        if (!artist) {
            return NextResponse.json({ error: "Artist not found" }, { status: 404 });
        }
        return NextResponse.json({ artist });
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
