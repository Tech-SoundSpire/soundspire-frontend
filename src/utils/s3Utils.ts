export const getS3Url = (s3Path: string): string => {
  // Convert s3://bucket-name/path to /api/images/path
  const match = s3Path.match(/^s3:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    return s3Path; // Return original if not an s3:// URL
  }
  
  const [, , path] = match;
  // Remove 'images/' from the path since it's already in the API route
  const cleanPath = path.replace('images/', '');
  return `/api/images/${cleanPath}`;
};

export const DEFAULT_PROFILE_IMAGE = 's3://soundspirewebsiteassets/images/placeholder.jpg'; 