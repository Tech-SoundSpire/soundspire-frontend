// app/api/artists/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const response = await fetch(
       `https://customer.api.soundcharts.com/api/v2/artist/search/${encodeURIComponent(query)}?offset=0&limit=20`,
      {
        headers: {
          "x-app-id": process.env.SOUNDCHARTS_CLIENT_ID ?? "",
          "x-api-key": process.env.SOUNDCHARTS_TOKEN ?? "",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Soundcharts API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
