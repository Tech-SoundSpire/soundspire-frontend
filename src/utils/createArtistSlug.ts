import Artist from "@/models/Artist";
import { customAlphabet } from "nanoid";
const generateNumericId = customAlphabet("0123456789", 10);
export async function createArtistSlug(name: string): Promise<string> {
    const formattedName = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    let existing = await Artist.findOne({ where: { slug: formattedName } });
    if (!existing) {
        return formattedName;
    }
    const slugFourCharacter = `${formattedName}-${generateNumericId(4)}`;
    existing = await Artist.findOne({ where: { slug: slugFourCharacter } });
    if (!existing) {
        return slugFourCharacter;
    }
    const slugSevenCharacter = `${formattedName}-${generateNumericId(7)}`;
    existing = await Artist.findOne({ where: { slug: slugSevenCharacter } });
    if (!existing) {
        return slugSevenCharacter;
    }
    return `${formattedName}-${generateNumericId(10)}`;
}
