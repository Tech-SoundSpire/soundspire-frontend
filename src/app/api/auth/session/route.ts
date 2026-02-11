import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User, Artist } from "@/models/index";
import { connectionTestingAndHelper } from "@/utils/dbConnection";

interface DecodedToken {
  id: string;
  role: "user" | "artist"
}

export async function GET() {
  try {
    await connectionTestingAndHelper();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ user: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const user = await User.findOne({ where: { user_id: decoded.id } });
    if (!user) return NextResponse.json({ user: null });

    const role = decoded.role || (user.is_artist ? "artist" : "user");

    // Check if user also has an artist profile
    let artistId: string | null = null;
    let isAlsoArtist = false;
    if (user.is_artist) {
      const artist = await Artist.findOne({ where: { user_id: user.user_id } });
      if (artist) {
        artistId = artist.artist_id;
        isAlsoArtist = true;
      }
    }

    return NextResponse.json({
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        photoURL: user.profile_picture_url,
        provider: (user as any).provider || "local",
        is_verified: user.is_verified,
        spotifyLinked: user.spotify_linked,
        role,
        isAlsoArtist,
        isAlsoUser: user.is_artist ? true : false, // artists are always also users
        artistId,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null });
  }
}
