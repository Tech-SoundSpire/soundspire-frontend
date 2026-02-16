export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import Artist from '@/models/Artist';
import '@/models/index';

export async function GET() {
  try {
    const reviews = await Review.findAll({
      include: [{
        model: Artist,
        as: "artist",
        attributes: ["artist_id", "artist_name", "slug"],
        required: false,
      }],
      order: [["created_at", "DESC"]],
    });
    return NextResponse.json({reviews});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews', details: error }, { status: 500 });
  }
}
