# Artist Preferences System Setup

## Overview

The system now uses the existing `artists` table to store favorite artist preferences. This approach:
- ✅ Uses proper UUIDs for artist references
- ✅ Maintains data integrity with foreign key relationships
- ✅ Provides real artist data instead of mock data
- ✅ Works with the existing database schema

## Setup Steps

### 1. Populate Artists Table

First, populate the artists table with mock data:

```bash
# Make a POST request to populate artists
POST /api/preferences/populate-artists
```

This will create 15 popular artists including:
- Ed Sheeran, Taylor Swift, Drake, Beyoncé
- The Weeknd, Ariana Grande, Post Malone
- Billie Eilish, Kendrick Lamar, Dua Lipa
- Bruno Mars, Lady Gaga, Justin Bieber
- Rihanna, Eminem

### 2. Test the System

After populating artists, test the preference selection:

1. Go to `/PreferenceSelectionPage`
2. Select languages, genres, and artists
3. Save preferences
4. Verify data is stored correctly in the database

## How It Works

### Data Flow

1. **User Selection**: User selects artist names from the UI
2. **API Conversion**: API converts artist names to artist IDs from the `artists` table
3. **Database Storage**: `favorite_artists` field stores UUID array of artist IDs
4. **Data Retrieval**: When loading preferences, system fetches artist details using stored IDs

### Database Schema

```sql
-- user_preferences table
favorite_artists uuid[] -- Array of artist IDs from artists table

-- artists table  
artist_id uuid PRIMARY KEY
artist_name varchar(255)
profile_picture_url text
bio text
verification_status varchar(50)
featured boolean
```

### API Endpoints

- `GET /api/preferences/available/artists` - Get all available artists
- `POST /api/preferences/populate-artists` - Populate artists table with mock data
- `POST /api/preferences/save` - Save user preferences (converts names to IDs)
- `GET /api/preferences/check` - Check if user has preferences

## Benefits

1. **Data Integrity**: Proper foreign key relationships
2. **Scalability**: Easy to add more artists
3. **Performance**: Efficient queries using UUIDs
4. **Flexibility**: Can add more artist metadata (bio, images, etc.)
5. **Consistency**: Same pattern as genres and languages

## Future Enhancements

1. **Artist Management**: Admin panel to add/edit artists
2. **Artist Images**: Upload real profile pictures
3. **Artist Verification**: Verify artist accounts
4. **Artist Analytics**: Track popularity and engagement
5. **Genre Mapping**: Link artists to specific genres

## Troubleshooting

### Common Issues

1. **No Artists Available**: Run the populate endpoint first
2. **Artist Not Found**: Check if artist name matches exactly
3. **Database Errors**: Verify database connection and schema

### Testing

Use the test endpoints to verify functionality:
- `GET /api/preferences/test-schema` - Check database schema
- `POST /api/preferences/test-save` - Test preference saving

## Notes

- The system automatically handles the conversion from artist names to IDs
- Artist names must match exactly (case-sensitive)
- The `artists` table serves dual purpose: user artists and public artists
- All artist data is currently mock data - replace with real data in production
