export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import Review from '@/models/Review';

export async function GET() {
  try {
    const reviews = await Review.findAll();
    return NextResponse.json({reviews});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews', details: error }, { status: 500 });
  }
} 