import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";
import Social from "@/models/Social";

export async function PUT(req: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const artist = await Artist.findOne({ where: { user_id: decoded.id } });
    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

    const body = await req.json();
    const { bio, profile_picture_url, cover_photo_url, socials } = body;

    await artist.update({
      ...(bio !== undefined && { bio }),
      ...(profile_picture_url !== undefined && { profile_picture_url }),
      ...(cover_photo_url !== undefined && { cover_photo_url }),
    });

    if (Array.isArray(socials)) {
      // Remove old socials and recreate
      await Social.destroy({ where: { artist_id: artist.artist_id } });
      for (const s of socials) {
        if (s.platform && s.url) {
          await Social.create({
            artist_id: artist.artist_id,
            platform: s.platform.toLowerCase().trim(),
            url: s.url,
            external_id: "",
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating artist:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
