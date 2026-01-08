import * as cheerio from "cheerio";
export function cleanSoundchartsBio(bio: string) {
    const $ = cheerio.load(bio);
    return $.text();
}
