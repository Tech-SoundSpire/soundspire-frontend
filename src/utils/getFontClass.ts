import {
    Fira_Code,
    Inter,
    Montserrat,
    Playfair_Display,
} from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const firaCode = Fira_Code({
    subsets: ["latin"],
    variable: "--font-fira-code",
});
const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
});
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});
export const fonts = {
    inter,
    montserrat,
    firaCode,
    playfair,
    arial: { className: "font-arial" },
} as const;
export type fontKey = keyof typeof fonts;
export function getFontClass(fontName: fontKey) {
    return fonts[fontName ?? "arial"].className;
}
