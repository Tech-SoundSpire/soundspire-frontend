import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'soundspire',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function POST(request: NextRequest) {
  try {
    const { googleId, profileData } = await request.json();

    if (!googleId || !profileData) {
      return NextResponse.json(
        { error: 'googleId and profileData are required' },
        { status: 400 }
      );
    }

    const { fullName, profilePictureUrl, city, country } = profileData;

    const query = `
      UPDATE users 
      SET 
        full_name = $1,
        profile_picture_url = $2,
        city = $3,
        country = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE google_id = $5
      RETURNING *;
    `;

    const values = [fullName, profilePictureUrl, city, country, googleId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 