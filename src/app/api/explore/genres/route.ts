import { NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { genresByPopularity } from "@/lib/genres";
import "@/models/index";

// GET /api/explore/genres - the 8 most popular genres for Explore's "Discover by Genre"
// (was the first 8 alphabetically, which surfaced duplicate spellings).
export async function GET() {
    try {
        await connectionTestingAndHelper();
        const genres = (await genresByPopularity()).slice(0, 8).map(({ genre_id, name }) => ({ genre_id, name }));
        return NextResponse.json(genres);
    } catch (error) {
        console.error("Error fetching genres:", error);
        return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 });
    }
}
