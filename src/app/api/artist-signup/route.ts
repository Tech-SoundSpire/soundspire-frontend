import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { cookies } from "next/headers";
import { connectionTestingAndHelper } from "@/utils/temp";
import Artist from "@/models/Artist";
import { User } from "@/models";

interface DecodedToken { id: string }

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();

    const body = await request.json();
    const {
      // artist fields
      artist_name,
      bio,
      profile_picture_url,
      cover_photo_url,
      third_party_platform,
      third_party_id,
      // account fields when not logged in
      username,
      email,
      password_hash,
    } = body;

    if (!artist_name || !artist_name.trim()) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("token")?.value;
    let userId: string | null = null;

    if (existingToken) {
      try {
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET!) as DecodedToken;
        const u = await User.findOne({ where: { user_id: decoded.id } });
        if (u) {
          userId = u.user_id;
        }
      } catch {

      }
    }

    if (!userId) {
      if (!email || !username || !password_hash) {
        return NextResponse.json(
          { error: "Email, username, and password are required for new accounts" },
          { status: 400 });
      }

      let user = await User.findOne({ where: { email } });
      if (!user) {
        const existngUsername = await User.findOne({ where: { username } });

        if (existngUsername) {
          return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        const hashed = await bcryptjs.hash(password_hash, 10);
        user = await User.create({
          username,
          email,
          password_hash: hashed,
          is_verified: false,
          is_artist: true,
          spotify_linked: false,
        });
      } else {
        if (!user.password_hash && password_hash) {
          const hashed = await bcryptjs.hash(password_hash, 10);
          await user.update({ password_hash: hashed });
        }

        await user.update({ is_artist: true });
      }

      userId = user.user_id;

      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "30d" });
      cookieStore.set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }

    const existingArtistForUser = await Artist.findOne({ where: { user_id: userId } });
    if (existingArtistForUser) {
      cookieStore.set({
        name: "artistId",
        value: existingArtistForUser.artist_id,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });
      return NextResponse.json({
        message: "Artist already exists for user.",
        success: true,
        artist: existingArtistForUser,
        redirect: `/payout?artistId=${existingArtistForUser.artist_id}`,
      });
    }

    const dupByName = await Artist.findOne({ where: { artist_name } });
    if (dupByName) {
      cookieStore.set({
        name: "artist_id",
        value: dupByName.artist_id,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 2,
        sameSite: "lax",
      });
      return NextResponse.json({
        error: "Artist already exists!",
        artist_id: dupByName.artist_id,
        redirect: `/payout?artistId=${dupByName.artist_id}`,
      }, { status: 400 });
    }

    const artist = await Artist.create({
      user_id: userId,
      artist_name,
      bio: bio || null,
      third_party_platform: third_party_platform || null,
      third_party_id: third_party_id || null,
      profile_picture_url: profile_picture_url || null,
      cover_photo_url: cover_photo_url || null,
      verification_status: "pending",
      featured: false,
      payout_method: null,
    })

    cookieStore.set({
      name: "artist_id",
      value: artist.artist_id,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 2,
      sameSite: "lax",
    });

    return NextResponse.json({
      message: "Artist created successfully!",
      success: true,
      artist,
      redirect: `/payout?artistId=${artist.artist_id}`,
    });
  } catch (error: unknown) {
    console.error("❌ Artist signup error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
