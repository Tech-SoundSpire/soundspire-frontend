const fontSizes = {
    "very small": "var(--very-small-text)",
    "big heading": "var(--big-heading)",
    "sub heading": "var(--sub-heading)",
    large: "var(--large-text)",
    heading: "var(--heading)",
    normal: "var(--normal-text)",
    small: "var(--small-text)",
};
export type fontSizeKeys = keyof typeof fontSizes;
export function getFontSize(size: fontSizeKeys) {
    return fontSizes[size];
}
