import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

// Cost guards: this endpoint is intentionally public (runs pre-login on the
// landing page + Android), so bound abuse by request size, not auth.
const MAX_TEXTS = 100;
const MAX_TOTAL_CHARS = 20000;

// ponytail: in-memory per-IP window — best-effort only; on serverless it's
// per-instance and resets on cold start. The input caps below are the real,
// instance-independent guard. Upgrade to Redis/DynamoDB if abuse persists.
const RATE_LIMIT = 30; // requests per window per IP
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const rec = hits.get(ip);
    if (!rec || now > rec.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    rec.count++;
    return rec.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
        if (rateLimited(ip)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await req.json();
        const { targetLang } = body;
        if (!targetLang) {
            return NextResponse.json({ error: "Missing targetLang" }, { status: 400 });
        }
        if (!process.env.GOOGLE_GEMINI_API) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // Batch mode: texts[]
        if (body.texts && Array.isArray(body.texts)) {
            const texts: string[] = body.texts.filter((t: any) => typeof t === "string" && t.trim());
            if (texts.length === 0) {
                return NextResponse.json({ translations: [] });
            }
            if (texts.length > MAX_TEXTS || texts.join("").length > MAX_TOTAL_CHARS) {
                return NextResponse.json({ error: "Payload too large" }, { status: 413 });
            }

            // Use <<<N>>> delimiters that won't appear in normal text
            const prompt = texts.map((t, i) => `<<<${i}>>>\n${t}`).join("\n");
            const result = await model.generateContent(
                `Translate each section below to ${targetLang}. Each section starts with <<<number>>>. Keep the <<<number>>> markers exactly as-is in your output. Translate everything between markers. No explanations.\n\n${prompt}`
            );

            const raw = result.response.text().trim();
            const translations: string[] = new Array(texts.length).fill("");

            // Parse by splitting on the markers
            const parts = raw.split(/<<<(\d+)>>>/);
            // parts = ["", "0", "translation0", "1", "translation1", ...]
            for (let i = 1; i < parts.length; i += 2) {
                const idx = parseInt(parts[i]);
                const content = parts[i + 1]?.trim();
                if (idx >= 0 && idx < texts.length && content) {
                    translations[idx] = content;
                }
            }
            return NextResponse.json({ translations });
        }

        // Single mode
        const { text } = body;
        if (!text) {
            return NextResponse.json({ error: "Missing text or texts" }, { status: 400 });
        }
        if (text.length > MAX_TOTAL_CHARS) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413 });
        }

        const result = await model.generateContent(
            `Translate the following text to ${targetLang}. Return ONLY the translated text, no explanation, no quotes.\n\n${text}`
        );

        return NextResponse.json({ translated: result.response.text().trim() });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
