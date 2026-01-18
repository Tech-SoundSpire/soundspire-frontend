// utils/userProfileImageUtils.ts

// Default profile image path on S3
export const DEFAULT_PROFILE_IMAGE =
    "s3://soundspirewebsiteassets/images/placeholder.jpg";

// SoundSpire logo path on S3
export const SOUNDSPIRE_LOGO =
    "s3://soundspirewebsiteassets/assets/ss_logo.png";

// Convert S3 path or relative path to API URL
export const getImageUrl = (s3Path?: string | null): string => {
    // If no path provided, fallback to default profile image
    if (!s3Path) return getDefaultProfileImageUrl();

    // If it's already a full URL, return as-is
    if (s3Path.startsWith("http")) return s3Path;

    // If it's already an API path, return as-is
    if (s3Path.startsWith("/api/")) return s3Path;

    // If it's an S3 path, normalize it
    if (s3Path.startsWith("s3://")) {
        const match = s3Path.match(/^s3:\/\/[^\/]+\/(.+)$/);
        if (match) {
            let path = match[1]; // e.g. "assets/ss_logo.png" or "images/placeholder.jpg"

            // Ensure path is under "images/"
            if (!path.startsWith("images/")) path = `images/${path}`;

            return `/api/${path}`;
        }
    }

    // Handle relative paths
    if (
        s3Path.startsWith("assets/") ||
        s3Path.startsWith("reviews/") ||
        s3Path.startsWith("images/")
    ) {
        return `/api/images/${s3Path}`;
    }

    // Default fallback for any other string
    return `/api/images/${s3Path}`;
};

// Helper to get the default profile image URL
export const getDefaultProfileImageUrl = (): string =>
    `/api/images/images/placeholder.jpg`; // or use getImageUrl(DEFAULT_PROFILE_IMAGE)

// Helper to get the logo URL
export const getLogoUrl = (): string => getImageUrl(SOUNDSPIRE_LOGO);
