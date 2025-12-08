import Artist from "@/models/Artist";
import { nanoid } from "nanoid";
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
    const slugFourCharacter = `${formattedName}-${nanoid(4)}`;
    existing = await Artist.findOne({ where: { slug: slugFourCharacter } });
    if (!existing) {
        return slugFourCharacter;
    }
    const slugSevenCharacter = `${formattedName}-${nanoid(7)}`;
    existing = await Artist.findOne({ where: { slug: slugSevenCharacter } });
    if (!existing) {
        return slugSevenCharacter;
    }
    return `${formattedName}-${nanoid(10)}`;
}
