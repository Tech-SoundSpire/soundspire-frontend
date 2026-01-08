import Artist from "@/models/Artist";
import { customAlphabet } from "nanoid";
const generateNumericId = customAlphabet("0123456789", 20);
type strategy = { tries: number; length: number };
const checkSlugAvailability = async (slug: string) => {
    const count = await Artist.count({ where: { slug } });
    return count === 0;
};
function createBaseSlug(name: string) {
    const lower = name.toLowerCase().trim();
    let result = "";
    let lastCharWasDash = false;

    for (let i = 0; i < lower.length; i++) {
        const char = lower[i];
        const code = char.charCodeAt(0);
        const isAlphaNumeric =
            (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
        if (isAlphaNumeric) {
            result += char;
            lastCharWasDash = false;
        } else {
            if (!lastCharWasDash && result.length > 0) {
                result += "-";
                lastCharWasDash = true;
            }
        }
    }
    if (result.endsWith("-")) {
        result = result.slice(0, -1);
    }
    return result;
}
export async function createArtistSlug(name: string): Promise<string> {
    let formattedName = createBaseSlug(name);

    // If name is only special characters
    if (!formattedName) {
        formattedName = "artist";
    }
    // Checks if name is unique
    if (await checkSlugAvailability(formattedName)) {
        return formattedName;
    }

    const strategies: strategy[] = [
        { length: 4, tries: 3 },
        { length: 7, tries: 3 },
    ];
    // Trying different strategies, 3 tries to minimize bad luck
    for (const strat of strategies) {
        for (let i = 0; i < strat.tries; i++) {
            const slug = `${formattedName}-${generateNumericId(strat.length)}`;
            if (await checkSlugAvailability(slug)) {
                return slug;
            }
        }
    }
    // Final try, recursive retry if failed, very very unlikely
    const finalCandidate = `${formattedName}-${generateNumericId(10)}`;
    if (await checkSlugAvailability(finalCandidate)) {
        return finalCandidate;
    } else {
        return createArtistSlug(name);
    }
}
