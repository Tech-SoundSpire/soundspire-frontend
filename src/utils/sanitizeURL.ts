export function sanitizeURL(
    url: string | null | undefined
): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
        return url;
    }

    try {
        const parsedURL = new URL(url);
        const allowedProtocols = ["http:", "https:", "blob:"];
        if (allowedProtocols.includes(parsedURL.protocol)) {
            return url;
        }
        if (parsedURL.protocol === "data:") {
            if (
                url.startsWith("data:image/png") ||
                url.startsWith("data:image/jpeg") ||
                url.startsWith("data:image/jpg") ||
                url.startsWith("data:image/gif") ||
                url.startsWith("data:image/webp") ||
                url.startsWith("data:image/svg+xml")
            ) {
                return url;
            }
        }
    } catch (e) {
        return undefined;
    }
    return undefined;
}
