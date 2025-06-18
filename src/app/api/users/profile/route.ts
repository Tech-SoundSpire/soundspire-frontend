import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'soundspire',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const googleId = searchParams.get('googleId');

    if (!googleId) {
      return NextResponse.json(
        { error: 'googleId is required' },
        { status: 400 }
      );
    }

    // Query to get user profile
    const query = `
      SELECT 
        full_name,
        profile_picture_url,
        city,
        country
      FROM users 
      WHERE google_id = $1
    `;

    const result = await pool.query(query, [googleId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userProfile = result.rows[0];

    return NextResponse.json({
      full_name: userProfile.full_name,
      profile_picture_url: userProfile.profile_picture_url,
      city: userProfile.city,
      country: userProfile.country,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 