export function sanitizeURL(
    url: string | null | undefined
): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
        return url;
    }

    try {
        const parsedURL = new URL(url);
        if (parsedURL.protocol === "http:" || parsedURL.protocol === "https:") {
            return parsedURL.href;
        }
        if (parsedURL.protocol === "blob:") {
            const blobPattern = /^blob:(https?:\/\/[^/]+)\/[a-fA-F0-9\-]+$/;
            const match = url.match(blobPattern);
            if (match) {
                return match[0];
            }
            return undefined;
        }
        if (parsedURL.protocol === "data:") {
            const safeMimeTypes = [
                "data:image/png",
                "data:image/jpeg",
                "data:image/jpg",
                "data:image/gif",
                "data:image/webp",
            ];

            if (safeMimeTypes.some((type) => parsedURL.href.startsWith(type))) {
                return parsedURL.href;
            }
        }
    } catch (e) {
        return undefined;
    }
    return undefined;
}
