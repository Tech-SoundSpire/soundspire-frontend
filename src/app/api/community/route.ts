import { NextResponse } from "next/server";
import Community from "@/models/Community";
import Forum from "@/models/Forum";

export async function POST(req: Request) {
    try {
        const { artist_id, name, description } = await req.json();

        if (!artist_id || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const community = await Community.create({
            artist_id,
            name,
            description,
            subscription_fee: 0,
            subscription_interval: "monthly",
        });

        // Automatically create All Chat and Fan Art forums for new community
        try {
            await Forum.create({
                community_id: community.community_id,
                name: "All Chat",
                description: "Real-time chat for all subscribed members",
                forum_type: "all_chat"
            });

            await Forum.create({
                community_id: community.community_id,
                name: "Fan Art",
                description: "Share your artwork with the community",
                forum_type: "fan_art"
            });

            console.log(`✅ Created forums for community: ${name}`);
        } catch (forumError) {
            console.error("⚠️ Failed to create forums:", forumError);
            // Don't fail the whole request - community still created
        }

        return NextResponse.json({ community });
    } catch (err: any) {
        console.error("Community creation error:", err);
        return NextResponse.json(
            { error: "Failed to create community" },
            { status: 500 }
        );
    }
}
