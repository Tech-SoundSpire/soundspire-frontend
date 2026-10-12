// Self-check for genreKey. Kept OUT of src/utils/genreKey.ts on purpose: that file is bundled
// into browser pages, where `module` does not exist (a `require.main === module` guard there
// crashed /PreferenceSelectionPage). Run: npx tsx scripts/genreKey.check.ts
import assert from "node:assert";
import { genreKey } from "../src/utils/genreKey";

const same = (a: string, b: string) => assert.strictEqual(genreKey(a), genreKey(b), `expected same: ${a} / ${b}`);
const diff = (a: string, b: string) => assert.notStrictEqual(genreKey(a), genreKey(b), `expected different: ${a} / ${b}`);

same("Hip Hop", "hip-hop"); same("hiphop", "HIP HOP"); same("Lo-Fi", "lofi"); same("K-Pop", "kpop");
same("R&B", "RnB"); same("R & B", "rhythm and blues"); same("R B Soul", "R&B Soul");
same("Drum & Bass", "drum and bass"); same("DnB", "Drum n Bass"); same("Électronique", "electronique");
same("  pop  ", "Pop"); same("singer/songwriter", "Singer-Songwriter");
diff("Pop", "K-Pop"); diff("Rock", "Pop Rock"); diff("Hip Hop", "Hip Hop Rap"); diff("Soul", "R&B Soul");
console.log("genreKey: all checks passed");
