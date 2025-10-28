import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const { artist_id } = await request.json();
    if (!artist_id) {
        return NextResponse.json({ error: "artist_id required" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    
    res.cookies.set("artist_id", artist_id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 2, // 2 days
    });
    return res;
}
