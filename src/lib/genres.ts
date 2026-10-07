import { QueryTypes } from "sequelize";
import sequelize from "@/lib/sequelize";
import { genreKey } from "@/utils/genreKey";

export type PopularGenre = { genre_id: string; name: string; artist_count: number };

// All genres, most artists first, one entry per genre: spelling variants (same genreKey) are
// collapsed into the variant with the most artists.
export async function genresByPopularity(): Promise<PopularGenre[]> {
    const rows = await sequelize.query<PopularGenre>(
        `SELECT g.genre_id, g.name, COUNT(ag.artist_id)::int AS artist_count
           FROM genres g LEFT JOIN artist_genres ag ON ag.genre_id = g.genre_id
          GROUP BY g.genre_id, g.name`,
        { type: QueryTypes.SELECT }
    );
    const best = new Map<string, PopularGenre>();
    for (const r of rows) {
        const k = genreKey(r.name);
        if (!k) continue;
        const cur = best.get(k);
        if (!cur || r.artist_count > cur.artist_count) best.set(k, r);
    }
    return [...best.values()].sort((a, b) => b.artist_count - a.artist_count || a.name.localeCompare(b.name));
}
