# SoundSpire Preference Selection System

## Overview

The preference selection system ensures that users set up their music preferences before accessing the main application. This system handles both new user signups and existing user logins, directing them to the appropriate page based on their preference status.

## Flow Logic

### 1. New User Signup (Manual or Google OAuth)
- User completes signup form
- User is created in database
- User is redirected to `/PreferenceSelectionPage`
- After selecting preferences, user is redirected to `/explore`

### 2. Existing User Login (Manual or Google OAuth)
- User logs in successfully
- System checks if user has preferences in database
- If preferences exist: redirect to `/explore`
- If no preferences: redirect to `/PreferenceSelectionPage`

### 3. Protected Routes
- All routes under `/(protected)` check user preferences
- If no preferences: automatically redirect to preference selection
- If preferences exist: allow access to protected content

## API Endpoints

### `/api/preferences/check`
- **Method**: GET
- **Purpose**: Check if user has existing preferences
- **Query Params**: `userId`
- **Response**: 
  ```json
  {
    "hasPreferences": boolean,
    "preferences": object | null
  }
  ```

### `/api/preferences/save`
- **Method**: POST
- **Purpose**: Save user preferences to database
- **Body**:
  ```json
  {
    "userId": "string",
    "genres": ["string"],
    "languages": ["string"],
    "favoriteArtists": ["string"]
  }
  ```

### `/api/preferences/available/languages`
- **Method**: GET
- **Purpose**: Get all available languages from database
- **Response**: List of language objects with IDs and names

### `/api/preferences/available/genres`
- **Method**: GET
- **Purpose**: Get all available genres from database
- **Response**: List of genre objects with IDs and names

## Database Models

### UserPreferences
- `preference_id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users table)
- `genres`: UUID[] (Array of genre IDs)
- `languages`: UUID[] (Array of language IDs)
- `favorite_artists`: UUID[] (Array of artist IDs)
- `spotify_id`: String (Optional)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Genres
- `genre_id`: UUID (Primary Key)
- `name`: String (Unique)

### Languages
- `language_id`: UUID (Primary Key)
- `name`: String (Unique)

## Components

### PreferenceSelectionPage
- **Location**: `/src/app/PreferenceSelectionPage/page.tsx`
- **Features**:
  - 3-step preference selection (Languages, Genres, Artists)
  - Search functionality for each category
  - Form validation
  - Integration with backend APIs
  - Responsive design with Tailwind CSS

### Hooks

#### useCheckPreferences
- **Purpose**: Check user preferences and redirect to explore if they exist
- **Use Case**: Used on preference selection page

#### useCheckPreferencesOnRoute
- **Purpose**: Check preferences on protected routes and redirect if needed
- **Use Case**: Used in protected layout

## Integration Points

### Signup Flow
- `src/app/api/users/signup/route.ts` - Creates user and redirects to preferences
- `src/app/page.tsx` - Handles signup response and redirect

### Login Flow
- `src/app/api/users/login/route.ts` - Checks preferences and sets redirect path
- `src/app/login/page.tsx` - Handles login response and redirect

### Google OAuth Flow
- `src/app/api/auth/google/callback/route.ts` - Checks preferences for OAuth users

### Protected Routes
- `src/app/(protected)/layout.tsx` - Ensures users have preferences before access

## Environment Variables Required

```env
# Database
DB_NAME=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base URL
NEXT_PUBLIC_BASE_URL=https://localhost:3000
DOMAIN=https://localhost:3000
```

## Usage Examples

### 1. Check if user has preferences
```typescript
import useCheckPreferences from '@/hooks/useCheckPreferences';

const { hasPreferences, isLoading } = useCheckPreferences();
```

### 2. Save user preferences
```typescript
const response = await axios.post('/api/preferences/save', {
  userId: user.id,
  genres: ['Rock', 'Pop'],
  languages: ['English', 'Spanish'],
  favoriteArtists: ['Artist 1', 'Artist 2']
});
```

### 3. Check preferences on protected route
```typescript
import useCheckPreferencesOnRoute from '@/hooks/useCheckPreferencesOnRoute';

const { hasPreferences, isLoading } = useCheckPreferencesOnRoute();
```

## Error Handling

- Database connection errors are logged and return appropriate HTTP status codes
- Missing user IDs return 400 Bad Request
- Server errors return 500 Internal Server Error
- Frontend shows toast notifications for user feedback

## Security Features

- JWT-based authentication
- HTTP-only cookies for OAuth
- Input validation on all API endpoints
- User ID verification before preference operations

## Future Enhancements

1. **Preference Analytics**: Track user preference changes over time
2. **Recommendation Engine**: Use preferences for music recommendations
3. **Social Features**: Share preferences with friends
4. **Import from Spotify**: Auto-populate preferences from connected accounts
5. **Preference Templates**: Pre-defined preference sets for different music tastes
