// File size constants
export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

// Allowed image file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// Format file size in human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file size is within limit
export const isFileSizeValid = (fileSize: number): boolean => {
  return fileSize <= MAX_FILE_SIZE;
};

// Check if file type is allowed
export const isFileTypeAllowed = (fileType: string): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(fileType);
};

// Validate file before upload
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!isFileTypeAllowed(file.type)) {
    return { 
      isValid: false, 
      error: `File type not allowed. Supported types: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
    };
  }

  if (!isFileSizeValid(file.size)) {
    return { 
      isValid: false, 
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Current size: ${formatFileSize(file.size)}` 
    };
  }

  return { isValid: true };
};

