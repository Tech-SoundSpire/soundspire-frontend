// app/api/artists/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const appId = process.env.SOUNDCHARTS_CLIENT_ID;
  const apiKey = process.env.SOUNDCHARTS_TOKEN;

  console.log("=== SoundCharts Artist Search Request ===");
  console.log("Query:", query);
  console.log("Credentials check:", {
    appId: appId ? `✅ Present (length: ${appId.length})` : "❌ Missing",
    apiKey: apiKey ? `✅ Present (length: ${apiKey.length})` : "❌ Missing",
  });

  // Check if credentials are missing
  if (!appId || !apiKey) {
    console.error("❌ SoundCharts credentials missing - returning 500");
    console.error("Environment check:", {
      SOUNDCHARTS_CLIENT_ID: process.env.SOUNDCHARTS_CLIENT_ID ? "set" : "not set",
      SOUNDCHARTS_TOKEN: process.env.SOUNDCHARTS_TOKEN ? "set" : "not set",
    });
    return NextResponse.json(
      { 
        error: "SoundCharts API credentials not configured",
        details: "Please check SOUNDCHARTS_CLIENT_ID and SOUNDCHARTS_TOKEN environment variables"
      },
      { status: 500 }
    );
  }

  const apiUrl = `https://customer.api.soundcharts.com/api/v2/artist/search/${encodeURIComponent(query)}?offset=0&limit=20`;
  console.log("API URL:", apiUrl);
  console.log("Request headers:", {
    "x-app-id": appId.substring(0, 4) + "..." + appId.substring(appId.length - 4),
    "x-api-key": apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4),
    "Content-Type": "application/json",
  });

  const startTime = Date.now();

  try {
    console.log("Making fetch request to SoundCharts API...");
    const response = await fetch(apiUrl, {
      headers: {
        "x-app-id": appId,
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    const duration = Date.now() - startTime;
    console.log(`Response received in ${duration}ms`);
    console.log("Response status:", response.status, response.statusText);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ SoundCharts API error response:");
      console.error("Status:", response.status);
      console.error("Status text:", response.statusText);
      console.error("Response body:", text);
      console.error("Response headers:", Object.fromEntries(response.headers.entries()));
      
      let errorMessage = `Soundcharts API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(text);
        errorMessage += ` - ${JSON.stringify(errorJson)}`;
        console.error("Parsed error JSON:", errorJson);
      } catch {
        errorMessage += ` - ${text}`;
      }
      
      throw new Error(errorMessage);
    }

    console.log("✅ Response OK, parsing JSON...");
    const data = await response.json();
    console.log("✅ Successfully fetched data, items count:", data?.items?.length || 0);
    return NextResponse.json(data);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error("❌ SoundCharts API error after", duration, "ms");
    console.error("Error type:", err?.constructor?.name || typeof err);
    console.error("Error message:", err?.message);
    console.error("Error stack:", err?.stack);
    
    // Check for specific error types
    if (err instanceof TypeError && err.message.includes('fetch')) {
      console.error("Network error detected - check internet connection or API endpoint");
    }
    if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED') {
      console.error("DNS/Connection error - API endpoint may be unreachable");
    }
    if (err?.name === 'AbortError' || err?.message?.includes('timeout')) {
      console.error("Request timeout - API may be slow or unresponsive");
    }
    
    return NextResponse.json(
      { 
        error: err.message || "Failed to fetch from SoundCharts API",
        details: err.message,
        type: err?.constructor?.name || typeof err,
      },
      { status: 500 }
    );
  }
}
