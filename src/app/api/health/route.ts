import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      message: "Image streaming API is working correctly"
    },
    { status: 200 }
  );
}