import { NextResponse } from "next/server";
import Community from "@/models/Community";

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

        return NextResponse.json({ community });
    } catch (err: any) {
        console.error("Community creation error:", err);
        return NextResponse.json(
            { error: "Failed to create community" },
            { status: 500 }
        );
    }
}