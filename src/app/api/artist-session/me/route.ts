import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const artistId = cookieStore.get("artist_id")?.value || null;

    return NextResponse.json({ artist_id: artistId });
}
