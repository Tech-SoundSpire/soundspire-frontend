// Convert S3 path to API URL
export const getImageUrl = (s3Path: string): string => {
    // If it's already a URL, return it
    if (s3Path.startsWith('http')) {
      return s3Path;
    }
  
    // If it's an S3 path, convert it
    if (s3Path.startsWith('s3://')) {
      // Extract the path after the bucket name
      const pathMatch = s3Path.match(/^s3:\/\/[^\/]+\/(.+)$/);
      if (pathMatch) {
        const path = pathMatch[1];
        return `/api/images/${path}`;
      }
    }
  
    // If it's already an API path, return it
    if (s3Path.startsWith('/api/images/')) {
      return s3Path;
    }
  
    // If none of the above, assume it's a relative path and add the API prefix
    return `/api/images/${s3Path}`;
  };
  
  // Default profile image path
  export const DEFAULT_PROFILE_IMAGE = 's3://soundspirewebsiteassets/images/placeholder.jpg';
  
  // Helper to get the default profile image URL
  export const getDefaultProfileImageUrl = () => getImageUrl(DEFAULT_PROFILE_IMAGE); 