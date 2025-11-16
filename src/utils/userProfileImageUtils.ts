// Convert S3 path to API URL
export const getImageUrl = (s3Path: string): string => {
  // If it's already a URL, return it
  if (s3Path.startsWith('http')) {
    return s3Path;
  }

  // If it's already an API path — return as-is
  if (s3Path.startsWith("/api/")) {
    return s3Path;
  }

  // If it's an S3 path, normalize it
  if (s3Path.startsWith("s3://")) {
    const match = s3Path.match(/^s3:\/\/[^\/]+\/(.+)$/);
    if (match) {
      let path = match[1]; // e.g. "assets/ss_logo.png" or "images/placeholder.jpg"

      // Always ensure path is under /api/images/...
      // Even if it's "assets/", backend will look under "images/assets/..."
      if (!path.startsWith("images/")) {
        path = `images/${path}`;
      }

      return `/api/${path}`;
    }
  }

  // Handle relative paths
  if (
    s3Path.startsWith("assets/") ||
    s3Path.startsWith("reviews/") ||
    s3Path.startsWith("images/")
  ) {
    // Prefix with /api/images/ to match backend
    return `/api/images/${s3Path}`;
  }

  // Default fallback
  return `/api/images/${s3Path}`;
};

  // Default profile image path
  export const DEFAULT_PROFILE_IMAGE = 's3://soundspirewebsiteassets/images/placeholder.jpg';
  
  // Helper to get the default profile image URL
  export const getDefaultProfileImageUrl = () => getImageUrl(DEFAULT_PROFILE_IMAGE); 