import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import ArtistVote from "@/models/ArtistVote";

// GET: get vote count + whether current user voted
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const uuid = request.nextUrl.searchParams.get("soundcharts_uuid");
    const userId = request.nextUrl.searchParams.get("userId");
    if (!uuid) {
      return NextResponse.json({ error: "soundcharts_uuid required" }, { status: 400 });
    }

    const count = await ArtistVote.count({ where: { soundcharts_uuid: uuid } });
    let userVoted = false;
    if (userId) {
      userVoted = !!(await ArtistVote.findOne({
        where: { soundcharts_uuid: uuid, user_id: userId },
      }));
    }

    return NextResponse.json({ count, userVoted });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}

// POST: cast a vote (idempotent — can't double-vote due to unique constraint)
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const { soundcharts_uuid, artist_name, image_url, userId } = await request.json();

    if (!soundcharts_uuid || !userId) {
      return NextResponse.json({ error: "soundcharts_uuid and userId required" }, { status: 400 });
    }

    // Check if already voted
    const existing = await ArtistVote.findOne({
      where: { soundcharts_uuid, user_id: userId },
    });
    if (existing) {
      const count = await ArtistVote.count({ where: { soundcharts_uuid } });
      return NextResponse.json({ count, userVoted: true, alreadyVoted: true });
    }

    await ArtistVote.create({
      soundcharts_uuid,
      artist_name: artist_name || "Unknown",
      image_url: image_url || null,
      user_id: userId,
    });

    const count = await ArtistVote.count({ where: { soundcharts_uuid } });
    return NextResponse.json({ count, userVoted: true });
  } catch (error) {
    console.error("Error casting vote:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
