import Artist from "@/models/Artist";
import { customAlphabet } from "nanoid";
const generateNumericId = customAlphabet("0123456789", 20);
type strategy = { tries: number; length: number };
const checkSlugAvailability = async (slug: string) => {
    const count = await Artist.count({ where: { slug } });
    return count === 0;
};
export async function createArtistSlug(name: string): Promise<string> {
    let formattedName = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
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
