# Profile Photo Upload Implementation

## Overview

This document outlines the complete implementation of user profile photo upload functionality in the SoundSpire application. The system allows users to upload profile pictures that are stored in AWS S3 and served through a custom API endpoint.

## Architecture

### Components

1. **Frontend**: React components for profile management
2. **API Routes**: Next.js API routes for upload and profile management
3. **Storage**: AWS S3 for image storage
4. **Database**: PostgreSQL for user profile data
5. **Image Serving**: Custom API endpoint for serving images from S3

### File Structure

```
soundspire-frontend/
├── src/
│   ├── app/
│   │   ├── (protected)/
│   │   │   └── profile/
│   │   │       └── page.tsx                 # Profile page component
│   │   └── api/
│   │       ├── upload/
│   │       │   └── route.ts                 # Presigned URL generation
│   │       ├── images/
│   │       │   └── [...path]/
│   │       │       └── route.ts             # Image serving from S3
│   │       └── users/
│   │           ├── update-profile/
│   │           │   └── route.ts             # Profile update API
│   │           └── profile/
│   │               └── route.ts             # Profile fetch API
│   └── utils/
│       └── userProfileImageUtils.ts         # Image URL utilities
```

## Implementation Details

### 1. Image Upload Flow

#### Step 1: File Selection
- User clicks on profile image in edit mode
- File input triggers `handleImageChange` function
- File is validated and processed

#### Step 2: Presigned URL Generation
```typescript
// /api/upload/route.ts
const command = new PutObjectCommand({
  Bucket: 'soundspirewebsiteassets',
  Key: `images/users/${fileName}`,
  ContentType: fileType,
});

const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

#### Step 3: S3 Upload
- File is uploaded directly to S3 using the presigned URL
- Unique filename format: `{userName}-{userId}.{extension}`

#### Step 4: Database Update
```typescript
const s3Path = `s3://soundspirewebsiteassets/images/users/${fileName}`;
const dbResponse = await fetch('/api/users/update-profile', {
  method: 'POST',
  body: JSON.stringify({
    googleId: user.id,
    profileData: {
      profilePictureUrl: s3Path,
      // ... other profile data
    },
  }),
});
```

### 2. Image Serving

#### API Route Structure
- **Route**: `/api/images/[...path]` (catch-all route)
- **Purpose**: Serve images from S3 through Next.js API

#### URL Conversion
```typescript
// userProfileImageUtils.ts
export const getImageUrl = (s3Path: string): string => {
  if (s3Path.startsWith('s3://')) {
    const pathMatch = s3Path.match(/^s3:\/\/[^\/]+\/(.+)$/);
    if (pathMatch) {
      const path = pathMatch[1];
      const cleanPath = path.replace(/^images\//, '');
      return `/api/images/${cleanPath}`;
    }
  }
  return s3Path;
};
```

#### S3 Fetch Process
1. Extract path from URL parameters
2. Construct S3 key: `images/${path}`
3. Check if object exists using HeadObject
4. Fetch object using GetObject
5. Convert stream to buffer
6. Return image with appropriate headers

### 3. Profile Management

#### Profile Loading
```typescript
// Load from database first, fallback to localStorage
const response = await fetch(`/api/users/profile?googleId=${user.id}`);
if (response.ok) {
  const dbProfile = await response.json();
  const profileImageUrl = dbProfile.profile_picture_url ? 
    getImageUrl(dbProfile.profile_picture_url) : 
    getDefaultProfileImageUrl();
  // Update profile state
}
```

#### Profile Saving
```typescript
// Convert API URLs back to S3 paths for database storage
const profilePictureUrl = editableProfile.profileImage ? 
  (editableProfile.profileImage.startsWith('/api/images/') ? 
    `s3://soundspirewebsiteassets/images/${editableProfile.profileImage.replace('/api/images/', '')}` :
    editableProfile.profileImage
  ) : null;
```

## Key Features

### 1. Secure Upload
- Presigned URLs for direct S3 upload
- No server-side file handling
- Secure file type validation

### 2. Persistent Storage
- Images stored in S3 with organized structure
- Database stores S3 paths, not file data
- Profile data persists across sessions

### 3. Efficient Serving
- Custom API endpoint for image serving
- Proper caching headers
- Error handling for missing images

### 4. User Experience
- Immediate visual feedback
- Loading states during upload
- Fallback to default image
- Responsive design

## Cache Busting and LocalStorage Hydration

### Why?
When a user updates their profile photo, we want the new image to appear instantly and persist across reloads, without showing the old image for a split second. This is achieved by:
- **Cache busting**: Forcing the browser to fetch the latest image from S3 by appending a unique query string (e.g., `?v=timestamp`) to the image URL after each upload or update.
- **LocalStorage hydration**: Storing the latest profile data (including the cache-busted image URL) in localStorage and using it as the initial state on page load, so the user always sees the most recent image instantly.

### How It Works

1. **After Upload/Save**
   - When a user uploads a new profile photo, the app generates a new image URL with a cache-busting query string (e.g., `/api/images/users/filename.jpg?v=1680000000000`).
   - The new image URL and profile data are immediately saved to both React state and localStorage.

2. **On Page Load**
   - The profile page first checks localStorage for profile data and uses it for the initial render, ensuring the latest image is shown instantly.
   - In the background, the app fetches the latest profile data from the backend/database. If the backend has a newer image, the state is updated; otherwise, the localStorage image remains.

3. **Cache Busting**
   - Every time a new image is uploaded or the profile is saved, a new cache-busting query string is appended to the image URL.
   - This ensures the browser always fetches the latest image from S3, bypassing any cached versions.
   - When saving to the database, the cache-busting string is stripped off to keep the S3 path clean.

### Code Example
```typescript
// After successful upload or save
const imageUrl = getImageUrl(s3Path) + '?v=' + Date.now();
setProfile({ ...profile, profileImage: imageUrl });
localStorage.setItem('userProfile', JSON.stringify({ ...profile, profileImage: imageUrl }));

// On page load
const savedProfile = localStorage.getItem('userProfile');
if (savedProfile) {
  setProfile(JSON.parse(savedProfile)); // Instant display
}
// Then fetch from backend and update if needed
```

### Benefits
- **No image flash**: The user always sees the most recent image, even after a reload.
- **Instant feedback**: Profile changes are reflected immediately in the UI.
- **Fresh images**: Cache busting ensures the browser never shows a stale image.
- **Resilient UX**: If the backend is slow or unavailable, the user still sees their latest profile image from localStorage.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  profile_picture_url TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  -- ... other fields
);
```

## Environment Variables

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soundspire
DB_USER=postgres
DB_PASSWORD=password
```

## Error Handling

### Upload Errors
- File type validation
- S3 upload failures
- Database update failures
- Network connectivity issues

### Serving Errors
- Missing images (404)
- S3 access denied (403)
- Invalid file paths
- Network timeouts

### User Feedback
- Loading indicators
- Error messages
- Success confirmations
- Graceful fallbacks

## Security Considerations

### File Upload Security
- File type validation
- File size limits
- Unique filename generation
- Presigned URL expiration

### Access Control
- User authentication required
- Google ID-based user identification
- S3 bucket access restrictions
- API route protection

### Data Protection
- Secure database connections
- Environment variable protection
- HTTPS enforcement
- Input sanitization

## Performance Optimizations

### Image Optimization
- Appropriate content types
- Efficient buffer handling
- Streaming responses
- Cache headers

### Database Optimization
- Indexed queries
- Connection pooling
- Efficient updates
- Minimal data transfer

### Frontend Optimization
- Lazy loading
- Image compression
- Responsive images
- Efficient state management

## Testing

### Manual Testing
1. Upload different image formats (JPG, PNG, etc.)
2. Test with various file sizes
3. Verify persistence across sessions
4. Test error scenarios

### Automated Testing
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for upload flow
- Performance testing

## Troubleshooting

### Common Issues

1. **Images not displaying**
   - Check S3 bucket permissions
   - Verify API route configuration
   - Check URL conversion logic

2. **Upload failures**
   - Verify AWS credentials
   - Check presigned URL generation
   - Validate file types

3. **Database sync issues**
   - Check database connection
   - Verify Google ID matching
   - Check SQL query syntax

### Debug Logging
- S3 operation logs
- API request/response logs
- Database query logs
- Frontend state logs

## Future Enhancements

### Planned Features
- Image cropping and editing
- Multiple image formats support
- Image compression
- CDN integration
- Bulk upload support

### Scalability Considerations
- Image processing queue
- Multiple S3 regions
- Database sharding
- Load balancing
- Caching strategies

## Conclusion

The profile photo upload implementation provides a robust, secure, and user-friendly solution for managing user profile images. The system leverages AWS S3 for scalable storage, custom API routes for efficient serving, and a well-structured database for data persistence.

The implementation follows best practices for security, performance, and user experience, making it a solid foundation for future enhancements and scaling. 