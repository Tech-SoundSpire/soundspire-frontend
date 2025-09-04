# Review Submission Feature

## Overview

This feature allows users with `@soundspire.online` email domain to submit music reviews that get stored in the database with associated images uploaded to S3.

## Features

- **Domain Restriction**: Only users with `@soundspire.online` email can submit reviews
- **Review Fields**: Title, Content, Date, Type (album/single), Artist, Author, and Image
- **Image Upload**: Images are uploaded to S3 bucket `soundspirewebsiteassets` in the `images/reviews/` folder
- **Form Validation**: Client and server-side validation for all fields
- **Real-time Preview**: Image preview before submission

## Database Schema

The `reviews` table has been extended with new fields:

```sql
-- New fields added to reviews table
author VARCHAR(255)           -- Author name (optional)
review_date TIMESTAMP         -- Review date (optional)
review_type VARCHAR(20)       -- 'album' or 'single' (optional)
```

## API Endpoints

### 1. Submit Review
- **Endpoint**: `POST /api/reviews/submit`
- **Authentication**: Required (JWT token)
- **Domain Restriction**: Only `@soundspire.online` emails
- **Body**:
  ```json
  {
    "title": "Review Title",
    "content": "Review content...",
    "date": "2024-01-15",
    "type": "album",
    "artist": "Artist Name",
    "author": "Author Name",
    "imageUrl": "s3://bucket/path/to/image.jpg"
  }
  ```

### 2. Upload Review Image
- **Endpoint**: `POST /api/reviews/upload`
- **Authentication**: Required (JWT token)
- **Domain Restriction**: Only `@soundspire.online` emails
- **Body**:
  ```json
  {
    "fileName": "image.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1024000
  }
  ```
- **Response**:
  ```json
  {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "s3Path": "s3://soundspirewebsiteassets/images/reviews/image.jpg"
  }
  ```

## Frontend Pages

### 1. Review Submission Form
- **Path**: `/reviews/submit`
- **Features**:
  - Form with all required fields
  - Image upload with preview
  - Domain validation
  - Real-time validation feedback

### 2. Reviews List (Updated)
- **Path**: `/reviews`
- **New Feature**: "Submit Review" button for authorized users

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── reviews/
│   │       ├── submit/route.ts      # Review submission endpoint
│   │       └── upload/route.ts      # Image upload endpoint
│   └── (protected)/
│       └── reviews/
│           ├── submit/page.tsx      # Review submission form
│           └── page.tsx             # Reviews list (updated)
├── models/
│   └── Review.ts                    # Updated with new fields
└── scripts/
    ├── migrate-reviews.ts           # Database migration script
    └── test-review-submission.ts    # Test script
```

## Setup Instructions

### 1. Database Migration

Run the migration script to add new columns to the reviews table:

```bash
# Using Node.js
node -r ts-node/register src/scripts/migrate-reviews.ts

# Or using ts-node directly
npx ts-node src/scripts/migrate-reviews.ts
```

### 2. Environment Variables

Ensure these environment variables are set:

```env
# AWS S3 Configuration
BUCKET_AWS_ACCESS_KEY_ID=your_access_key
BUCKET_AWS_SECRET_ACCESS_KEY=your_secret_key

# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

### 3. S3 Bucket Setup

Ensure the S3 bucket `soundspirewebsiteassets` has:
- Proper permissions for the AWS credentials
- CORS configuration for web uploads
- Folder structure: `images/reviews/`

## Testing

### 1. Run Test Script

```bash
npx ts-node src/scripts/test-review-submission.ts
```

### 2. Manual Testing

1. **Create a test user** with `@soundspire.online` email
2. **Login** with the test user
3. **Navigate** to `/reviews/submit`
4. **Fill out** the review form
5. **Upload** an image
6. **Submit** the review
7. **Verify** the review appears in `/reviews`

## Security Features

- **Domain Validation**: Server-side validation of email domain
- **Authentication**: JWT token required for all operations
- **File Validation**: Image type and size validation
- **Input Sanitization**: All inputs are validated and sanitized

## Error Handling

- **Client-side**: Form validation with user-friendly error messages
- **Server-side**: Comprehensive error handling with appropriate HTTP status codes
- **File Upload**: Graceful handling of upload failures
- **Database**: Transaction rollback on errors

## Future Enhancements

- [ ] Rating system (1-5 stars)
- [ ] Review categories/tags
- [ ] Review approval workflow
- [ ] Rich text editor for content
- [ ] Multiple image uploads
- [ ] Review analytics and insights
