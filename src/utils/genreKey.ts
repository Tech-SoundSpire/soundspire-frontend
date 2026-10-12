// Identity key for a genre name: two names with the same key are the same genre.
// Ignores case, accents, spaces, hyphens, slashes and other punctuation, and treats "&" as
// "and", so "Hip Hop", "hip-hop" and "HipHop" all map to "hiphop". A few common spellings
// are aliased (R&B / RnB, Drum & Bass / DnB). Used for de-duplicating the genres table and
// for matching new names to existing rows.
const ALIASES: Record<string, string> = {
    rnb: "randb",
    rb: "randb",
    rhythmandblues: "randb",
    rbsoul: "randbsoul", // music-genres "R_B_Soul"
    rnbsoul: "randbsoul",
    dnb: "drumandbass",
    drumnbass: "drumandbass",
};

export function genreKey(name: string): string {
    const k = name
        .normalize("NFKD").replace(/[̀-ͯ]/g, "") // strip accents
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "");
    return ALIASES[k] ?? k;
}
