import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/models';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Health check failed:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}