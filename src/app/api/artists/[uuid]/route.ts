import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;

    console.log("=== SoundCharts Artist Details Request ===");
    console.log("Artist UUID:", uuid);

    const appId = process.env.SOUNDCHARTS_CLIENT_ID;
    const apiKey = process.env.SOUNDCHARTS_TOKEN;

    console.log("Credentials check:", {
        appId: appId ? `✅ Present (length: ${appId.length})` : "❌ Missing",
        apiKey: apiKey ? `✅ Present (length: ${apiKey.length})` : "❌ Missing",
    });

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

    const apiUrl = `https://customer.api.soundcharts.com/api/v2.9/artist/${encodeURIComponent(uuid)}`;
    console.log("API URL:", apiUrl);
    console.log("Request headers:", {
        "x-app-id": appId.substring(0, 4) + "..." + appId.substring(appId.length - 4),
        "x-api-key": apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4),
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

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ SoundCharts API error response:");
            console.error("Status:", response.status);
            console.error("Status text:", response.statusText);
            console.error("Response body:", text);
            console.error("Response headers:", Object.fromEntries(response.headers.entries()));
            
            let errorMessage = `Soundcharts artist fetch failed: ${response.status}`;
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
        console.log("✅ Successfully fetched artist data, name:", data?.name || "N/A");
        return NextResponse.json(data);
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error("❌ SoundCharts API error after", duration, "ms");
        console.error("Error type:", error?.constructor?.name || typeof error);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        
        // Check for specific error types
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error("Network error detected - check internet connection or API endpoint");
        }
        if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
            console.error("DNS/Connection error - API endpoint may be unreachable");
        }
        if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
            console.error("Request timeout - API may be slow or unresponsive");
        }
        
        return NextResponse.json(
            {
                error: error.message || "Failed to fetch artist from SoundCharts",
                details: error.message,
                type: error?.constructor?.name || typeof error,
            },
            { status: 500 }
        );
    }
}
