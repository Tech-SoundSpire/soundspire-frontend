import { NextRequest, NextResponse } from "next/server";
import { getTrack } from "@/lib/spotify";
import { getCreditsForISRC } from "@/lib/musicbrainz";
import SongCache from "@/models/reviews/SongCache";
import { connectionTestingAndHelper } from "@/utils/dbConnection";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectionTestingAndHelper();

    const cached = await SongCache.findByPk(id);
    const cacheExpired = cached && (Date.now() - new Date(cached.metadata_cached_at).getTime() > 24 * 60 * 60 * 1000);
    // Older cache rows may not have artists_json populated — force refresh to backfill.
    const needsBackfill = cached && !cached.artists_json;

    let trackData: any;

    if (cached && !cacheExpired && !needsBackfill) {
      trackData = {
        spotify_track_id: cached.spotify_track_id,
        track_name: cached.track_name,
        artist_name: cached.artist_name,
        artist_id: cached.artist_id,
        artists: cached.artists_json,
        album_name: cached.album_name,
        album_id: cached.album_id,
        album_art_url: cached.album_art_url,
        duration_ms: cached.duration_ms,
        isrc: cached.isrc,
        explicit: cached.explicit,
        release_date: cached.release_date,
        spotify_url: cached.spotify_url,
        credits: cached.credits_json,
      };
    } else {
      const spotify = await getTrack(id);
      const artistsList = (spotify.artists || []).map((a: any) => ({ id: a.id, name: a.name }));

      const cacheEntry = {
        spotify_track_id: spotify.id,
        track_name: spotify.name,
        artist_name: spotify.artists.map((a: any) => a.name).join(", "),
        artist_id: spotify.artists[0]?.id || "",
        artists_json: artistsList,
        album_name: spotify.album?.name || null,
        album_id: spotify.album?.id || null,
        album_art_url: spotify.album?.images?.[0]?.url || null,
        duration_ms: spotify.duration_ms,
        isrc: spotify.external_ids?.isrc || null,
        explicit: spotify.explicit || false,
        release_date: spotify.album?.release_date || null,
        spotify_url: spotify.external_urls?.spotify || null,
        metadata_cached_at: new Date(),
        credits_json: cached?.credits_json || null,
        credits_cached_at: cached?.credits_cached_at || null,
      };

      await SongCache.upsert(cacheEntry);

      trackData = {
        ...cacheEntry,
        artists: cacheEntry.artists_json,
        credits: cacheEntry.credits_json,
      };
    }

    if (!trackData.credits && trackData.isrc) {
      try {
        const credits = await getCreditsForISRC(trackData.isrc);
        if (credits && credits.length > 0) {
          trackData.credits = credits;
          await SongCache.update(
            { credits_json: credits as any, credits_cached_at: new Date() },
            { where: { spotify_track_id: id } }
          );
        }
      } catch {
        // Credits fetch failed — non-fatal
      }
    }

    return NextResponse.json(trackData);
  } catch (error: any) {
    console.error("Track fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch track" }, { status: 500 });
  }
}
