import { NextRequest, NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import sequelize from "@/lib/sequelize";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import Genres from "@/models/Genres";
import UserPreferences from "@/models/UserPreferences";
import { genreKey } from "@/utils/genreKey";
import "@/models/index";

// GET /api/admin/dedupe-genres          -> dry run: lists duplicate groups, changes nothing
// GET /api/admin/dedupe-genres?apply=1  -> merges each group into one canonical genre
//
// Duplicates = same genreKey ("Hip Hop" / "hip-hop" / "HipHop"). The canonical row is the
// one linked to the most artists (ties: the best-looking name). Merging moves artist links
// (artist_genres) and saved preferences (user_preferences.genres) onto the canonical row,
// then deletes the duplicates. All in one transaction.
export async function GET(request: NextRequest) {
    try {
        await connectionTestingAndHelper();
        const admin = await requireAdmin(request);
        if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
        const apply = new URL(request.url).searchParams.get("apply") === "1";

        const rows = await sequelize.query<{ genre_id: string; name: string; artists: number }>(
            `SELECT g.genre_id, g.name, COUNT(ag.artist_id)::int AS artists
               FROM genres g LEFT JOIN artist_genres ag ON ag.genre_id = g.genre_id
              GROUP BY g.genre_id, g.name`,
            { type: QueryTypes.SELECT }
        );

        // Prefer more artists, then a "display" name (has capitals/spaces), then shorter, then A-Z.
        const looks = (n: string) => (/[A-Z]/.test(n) ? 2 : 0) + (/\s/.test(n) ? 1 : 0);
        const groups = new Map<string, typeof rows>();
        for (const r of rows) {
            const k = genreKey(r.name);
            if (!k) continue;
            groups.set(k, [...(groups.get(k) || []), r]);
        }
        const merges = [...groups.values()]
            .filter((g) => g.length > 1)
            .map((g) => {
                const sorted = [...g].sort((a, b) =>
                    b.artists - a.artists || looks(b.name) - looks(a.name) || a.name.length - b.name.length || a.name.localeCompare(b.name));
                return { keep: sorted[0], remove: sorted.slice(1) };
            });

        const summary = {
            totalGenres: rows.length,
            duplicateGroups: merges.length,
            genresToRemove: merges.reduce((n, m) => n + m.remove.length, 0),
            groups: merges.map((m) => ({
                keep: `${m.keep.name} (${m.keep.artists} artists)`,
                merge: m.remove.map((r) => `${r.name} (${r.artists} artists)`),
            })),
        };
        if (!apply || merges.length === 0) return NextResponse.json({ dryRun: !apply, ...summary });

        let prefsUpdated = 0;
        await sequelize.transaction(async (transaction) => {
            for (const { keep, remove } of merges) {
                const dupIds = remove.map((r) => r.genre_id);
                // Move artist links to the canonical genre (skip artists that already have it).
                // ::uuid is required: with DISTINCT, Postgres types a bare literal as text.
                await sequelize.query(
                    `INSERT INTO artist_genres (artist_id, genre_id)
                     SELECT DISTINCT ag.artist_id, :keep::uuid FROM artist_genres ag
                      WHERE ag.genre_id IN (:dups)
                        AND NOT EXISTS (SELECT 1 FROM artist_genres x WHERE x.artist_id = ag.artist_id AND x.genre_id = :keep)`,
                    { replacements: { keep: keep.genre_id, dups: dupIds }, transaction }
                );
                await sequelize.query(`DELETE FROM artist_genres WHERE genre_id IN (:dups)`, { replacements: { dups: dupIds }, transaction });

                // Saved preferences: swap duplicate ids for the canonical id (no repeats).
                const prefs = await sequelize.query<{ preference_id: string; genres: string[] }>(
                    `SELECT preference_id, genres FROM user_preferences WHERE genres && ARRAY[:dups]::uuid[]`,
                    { replacements: { dups: dupIds }, type: QueryTypes.SELECT, transaction }
                );
                for (const p of prefs) {
                    const next = [...new Set(p.genres.map((id) => (dupIds.includes(id) ? keep.genre_id : id)))];
                    await UserPreferences.update({ genres: next }, { where: { preference_id: p.preference_id }, transaction });
                    prefsUpdated++;
                }
                await Genres.destroy({ where: { genre_id: dupIds }, transaction });
            }
        });

        return NextResponse.json({ dryRun: false, applied: true, preferencesUpdated: prefsUpdated, ...summary });
    } catch (error) {
        console.error("Error de-duplicating genres:", error);
        // Admin-only route: include the database reason so failures can be fixed. Nothing was
        // changed (the merge runs in one transaction).
        const e = error as { message?: string; parent?: { message?: string; detail?: string } };
        return NextResponse.json({
            error: "Failed to de-duplicate genres (no changes were made)",
            reason: e?.parent?.message || e?.message || String(error),
            detail: e?.parent?.detail,
        }, { status: 500 });
    }
}
