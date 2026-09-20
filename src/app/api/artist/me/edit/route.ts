import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import Artist from "@/models/Artist";
import { User } from "@/models/User";
import Social from "@/models/Social";
import Community from "@/models/Community";

// Keep at most 3 highlights, each { imageUrl, text } with trimmed, length-capped text.
function sanitizeHighlights(input: unknown): { imageUrl: string | null; text: string }[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 3)
    .map((h: any) => ({
      imageUrl: typeof h?.imageUrl === "string" && h.imageUrl.trim() ? h.imageUrl.trim() : null,
      text: typeof h?.text === "string" ? h.text.trim().slice(0, 120) : "",
    }))
    .filter((h) => h.imageUrl || h.text);
}

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
    const { bio, profile_picture_url, cover_photo_url, socials, highlights } = body;

    await artist.update({
      ...(bio !== undefined && { bio }),
      ...(profile_picture_url !== undefined && { profile_picture_url }),
      ...(cover_photo_url !== undefined && { cover_photo_url }),
    });

    // Also sync profile_picture_url to the users table so it shows correctly in fan mode
    if (profile_picture_url !== undefined) {
      await User.update(
        { profile_picture_url },
        { where: { user_id: decoded.id } }
      );
    }

    if (highlights !== undefined) {
      await Community.update(
        { highlights: sanitizeHighlights(highlights) },
        { where: { artist_id: artist.artist_id } }
      );
    }

    if (Array.isArray(socials)) {
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
