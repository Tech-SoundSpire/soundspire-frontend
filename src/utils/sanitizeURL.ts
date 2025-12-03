export function sanitizeURL(
    url: string | null | undefined
): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
        return url;
    }

    try {
        const parsedURL = new URL(url);
        const allowedProtocols = ["http:", "https:", "data:", "blob:"];
        if (allowedProtocols.includes(parsedURL.protocol)) {
            return url;
        }
    } catch (e) {
        return undefined;
    }
    return undefined;
}
