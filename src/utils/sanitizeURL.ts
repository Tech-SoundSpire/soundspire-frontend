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
            return url;
        }
        if (parsedURL.protocol === "blob:") {
            const blobPattern = /^blob:(https?:\/\/[^/]+)\/[a-fA-F0-9\-]+$/;
            if (blobPattern.test(url)) {
                return url;
            }
            return undefined;
        }
        if (parsedURL.protocol === "data:") {
            if (
                url.startsWith("data:image/png") ||
                url.startsWith("data:image/jpeg") ||
                url.startsWith("data:image/jpg") ||
                url.startsWith("data:image/gif") ||
                url.startsWith("data:image/webp")
            ) {
                return url;
            }
        }
    } catch (e) {
        return undefined;
    }
    return undefined;
}
