import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== TEST ROUTE HIT ===');
  return NextResponse.json({ message: 'Test route working' });
} 