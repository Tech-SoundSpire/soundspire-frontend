export const getS3Url = (s3Path: string): string => {
  // If it's already a URL, return it
  if (s3Path.startsWith('http')) {
    return s3Path;
  }

  // Convert s3://bucket-name/path to /api/images/path
  const match = s3Path.match(/^s3:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    console.log('Invalid S3 path format:', s3Path);
    return s3Path; // Return original if not an s3:// URL
  }
  
  const [, , path] = match;
  // Remove 'images/' from the path since it's already in the API route
  const cleanPath = path.replace(/^images\//, '');
  const finalUrl = `/api/images/${cleanPath}`;
  console.log('S3 URL conversion:', {
    original: s3Path,
    path,
    cleanPath,
    finalUrl
  });
  return finalUrl;
};

export const DEFAULT_PROFILE_IMAGE = 's3://soundspirewebsiteassets/images/placeholder.jpg'; 