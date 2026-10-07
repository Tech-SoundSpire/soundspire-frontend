import Genres from "@/models/Genres";
import Artist from "@/models/Artist";
import { genreKey } from "@/utils/genreKey";

// Map a genre name to its canonical Genres row by genreKey ("Hip Hop" = "hip-hop" = "HipHop"),
// creating it only if no equivalent exists. This is the single place genres get created, so
// it is what keeps duplicates out of the table.
export async function resolveGenre(name: string) {
  const key = genreKey(name);
  const all = await Genres.findAll({ attributes: ["genre_id", "name"] });
  const existing = all.find((g) => genreKey(g.name) === key);
  if (existing) return existing;
  const [g] = await Genres.findOrCreate({ where: { name: name.trim() } });
  return g;
}

// Replace an artist's genres (artist_genres) with the given names. No-op when empty.
export async function saveArtistGenres(artist: InstanceType<typeof Artist>, names: unknown) {
  if (!Array.isArray(names)) return;
  const clean = [...new Set(names.map((n) => (typeof n === "string" ? n.trim() : "")).filter(Boolean))];
  if (clean.length === 0) return;
  const rows = [];
  for (const n of clean) rows.push(await resolveGenre(n));
  // Two spellings of one genre resolve to the same row; link it once.
  await (artist as any).setGenres([...new Map(rows.map((r) => [r.genre_id, r])).values()]);
}
