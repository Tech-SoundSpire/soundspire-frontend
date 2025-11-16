// app/api/artists/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  console.log("Searching artist:", query);
  console.log("Using keys:", {
    appId: process.env.SOUNDCHARTS_CLIENT_ID ? "✅" : "❌ Missing",
    apiKey: process.env.SOUNDCHARTS_TOKEN ? "✅" : "❌ Missing",
  });

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
      const text = await response.text();
      console.error("Soundcharts API raw error:", text);
      throw new Error(`Soundcharts API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
