import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/index";
import { connectionTestingAndHelper } from "@/utils/temp";

interface DecodedToken {
  id: string;
}

export async function GET() {
  try {
    await connectionTestingAndHelper();
    
    const cookieStore = await cookies(); // <-- await here
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ user: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const user = await User.findOne({ where: { user_id: decoded.id } });
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        photoURL: user.profile_picture_url,
        provider: (user as any).provider || "local",
        is_verified: user.is_verified,
        spotifyLinked: user.spotify_linked,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null });
  }
}
