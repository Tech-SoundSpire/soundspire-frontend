import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import Artist from "@/models/Artist";
import Genres from "@/models/Genres";
import "@/models/index";

// One-off admin backfill: tag artists with genres pulled from SoundCharts.
//   GET /api/admin/backfill-artist-genres            -> DRY RUN (shows what it would tag)
//   GET /api/admin/backfill-artist-genres?apply=1    -> writes artist_genres
//   &limit=50  (batch size, default 50)   &force=1  (re-tag artists that already have genres)
// Only artists with a SoundCharts third_party_id can be sourced; others need manual tagging.
const SC_BASE = "https://customer.api.soundcharts.com/api/v2.9/artist";

function parseGenreNames(object: any): string[] {
  const out = new Set<string>();
  const add = (s?: unknown) => { if (typeof s === "string" && s.trim()) out.add(s.trim()); };
  const g = object?.genres;
  if (Array.isArray(g)) {
    for (const item of g) {
      if (typeof item === "string") add(item);
      else if (item && typeof item === "object") {
        add((item as any).root);
        add((item as any).name);
        const sub = (item as any).sub;
        if (Array.isArray(sub)) sub.forEach((s: any) => add(typeof s === "string" ? s : s?.name));
      }
    }
  }
  return [...out];
}

// Reuse an existing genre row (case-insensitive) so artists link to the canonical genre Explore
// uses, instead of spawning duplicates.
async function resolveGenre(name: string) {
  const existing = await Genres.findOne({ where: { name: { [Op.iLike]: name } } });
  if (existing) return existing;
  const [g] = await Genres.findOrCreate({ where: { name } });
  return g;
}

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const url = new URL(request.url);
    const apply = url.searchParams.get("apply") === "1";
    const force = url.searchParams.get("force") === "1";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);

    const appId = process.env.SOUNDCHARTS_CLIENT_ID;
    const apiKey = process.env.SOUNDCHARTS_TOKEN;
    if (!appId || !apiKey) return NextResponse.json({ error: "SoundCharts credentials missing" }, { status: 500 });

    const artists = await Artist.findAll({
      where: { third_party_platform: "soundcharts", third_party_id: { [Op.ne]: null } },
      attributes: ["artist_id", "artist_name", "third_party_id"],
      limit,
    });

    const results: any[] = [];
    let tagged = 0, skipped = 0, noGenres = 0, failed = 0;

    for (const a of artists as any[]) {
      if (!force) {
        const existing = await a.getGenres({ attributes: ["genre_id"] });
        if (existing?.length) { skipped++; continue; }
      }
      try {
        const res = await fetch(`${SC_BASE}/${encodeURIComponent(a.third_party_id)}`, {
          headers: { "x-app-id": appId, "x-api-key": apiKey },
        });
        if (!res.ok) { failed++; results.push({ artist: a.artist_name, error: `SoundCharts ${res.status}` }); continue; }
        const data = await res.json();
        const names = parseGenreNames(data.object);
        if (!names.length) { noGenres++; results.push({ artist: a.artist_name, genres: [] }); continue; }
        if (apply) {
          const rows = [];
          for (const n of names) rows.push(await resolveGenre(n));
          await a.setGenres(rows);
        }
        tagged++;
        results.push({ artist: a.artist_name, genres: names });
      } catch (e: any) {
        failed++;
        results.push({ artist: a.artist_name, error: e.message });
      }
      await new Promise((r) => setTimeout(r, 250)); // stay under SoundCharts rate limits
    }

    return NextResponse.json({
      mode: apply ? "APPLIED" : "DRY_RUN",
      processed: artists.length, tagged, skipped, noGenres, failed, results,
    });
  } catch (error: any) {
    console.error("backfill-artist-genres error", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
