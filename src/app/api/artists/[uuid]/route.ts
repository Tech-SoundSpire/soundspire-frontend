import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;

    try {
        const response = await fetch(
            `https://customer.api.soundcharts.com/api/v2.9/artist/${encodeURIComponent(uuid)}`,
            {
                headers: {
                    "x-app-id": process.env.SOUNDCHARTS_CLIENT_ID ?? "",
                    "x-api-key": process.env.SOUNDCHARTS_TOKEN ?? "",
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Soundcharts artist fetch failed: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Soundcharts artist fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
