import { Op } from "sequelize";
import Genres from "@/models/Genres";
import Artist from "@/models/Artist";

// Map a genre name to its canonical Genres row (case-insensitive), creating it only if
// none exists. Avoids duplicate rows like "hip hop" vs "Hip Hop".
export async function resolveGenre(name: string) {
  const existing = await Genres.findOne({ where: { name: { [Op.iLike]: name } } });
  if (existing) return existing;
  const [g] = await Genres.findOrCreate({ where: { name } });
  return g;
}

// Replace an artist's genres (artist_genres) with the given names. No-op when empty.
export async function saveArtistGenres(artist: InstanceType<typeof Artist>, names: unknown) {
  if (!Array.isArray(names)) return;
  const clean = [...new Set(names.map((n) => (typeof n === "string" ? n.trim() : "")).filter(Boolean))];
  if (clean.length === 0) return;
  const rows = [];
  for (const n of clean) rows.push(await resolveGenre(n));
  await (artist as any).setGenres(rows);
}
