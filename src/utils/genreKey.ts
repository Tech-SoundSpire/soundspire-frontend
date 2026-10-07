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

// Self-check: `npx tsx src/utils/genreKey.ts`
if (typeof require !== "undefined" && require.main === module) {
    const same = (a: string, b: string) => console.assert(genreKey(a) === genreKey(b), `expected same: ${a} / ${b}`);
    const diff = (a: string, b: string) => console.assert(genreKey(a) !== genreKey(b), `expected different: ${a} / ${b}`);
    same("Hip Hop", "hip-hop"); same("hiphop", "HIP HOP"); same("Lo-Fi", "lofi"); same("K-Pop", "kpop");
    same("R&B", "RnB"); same("R & B", "rhythm and blues"); same("R B Soul", "R&B Soul");
    same("Drum & Bass", "drum and bass"); same("DnB", "Drum n Bass"); same("Électronique", "electronique");
    same("  pop  ", "Pop"); same("singer/songwriter", "Singer-Songwriter");
    diff("Pop", "K-Pop"); diff("Rock", "Pop Rock"); diff("Hip Hop", "Hip Hop Rap"); diff("Soul", "R&B Soul");
    console.log("genreKey self-check done (no assertion output above = all passed)");
}
