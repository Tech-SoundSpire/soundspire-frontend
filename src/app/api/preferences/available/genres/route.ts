import { NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { genresByPopularity } from "@/lib/genres";

// GET /api/preferences/available/genres - genres for preference pickers, most popular first,
// one entry per genre (spelling variants merged).
export async function GET() {
    try {
        await connectionTestingAndHelper();
        return NextResponse.json({ genres: await genresByPopularity() });
    } catch (error) {
        console.error("Error fetching genres:", error);
        return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 });
    }
}
