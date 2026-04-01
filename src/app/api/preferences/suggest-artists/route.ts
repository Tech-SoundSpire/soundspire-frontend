import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

//config of gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

//helper fn to fetch directly from soundCharts API
async function getSoundchartsArtist(artistName: string) {
  try {
    const appId = process.env.SOUNDCHARTS_CLIENT_ID || "";
    const apiKey = process.env.SOUNDCHARTS_TOKEN || "";
    
    if (!appId || !apiKey) {
      console.error("SoundCharts credentials missing!");
      return null;
    }

    //calling the soundcharts api with each artis name as a search paramerer
    const apiUrl = `https://customer.api.soundcharts.com/api/v2/artist/search/${encodeURIComponent(artistName)}?limit=1`;
    const res = await fetch(apiUrl, {
      headers: {
        "x-app-id": appId,
        "x-api-key": apiKey,
      },
    });

    if (res.ok) {
      const data = await res.json();
      //validating returned structure returned by soundcharts
      const items = data.items || data.page?.items || (data.data && data.data.items) || (data.items ? data.items : data);
      
      const artistList = Array.isArray(items) ? items : (items && Array.isArray(items.items)) ? items.items : Array.isArray(data) ? data : [];
      let foundArtist = Array.isArray(items) && items.length > 0 ? items[0] : null;
      
      // Let's rely on standard response, usually data.items
      if (data.items && data.items.length > 0) {
        const a = data.items[0]
        return {
          artist_id: a.uuid,
          name: a.name,
          img: a.imageUrl || "",
          soundcharts_uuid: a.uuid
        }
      }
    }else {
      console.error(`SoundCharts request failed for ${artistName} with status: ${res.status}`);
    }
  }catch (error) {
    console.error(`Error fetching SoundCharts data for ${artistName}:`, error)
  }
  return null
}

//Endpoint for suggesting artists
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const genres = Array.isArray(body.genres) ? body.genres : []
    const languages = Array.isArray(body.languages) ? body.languages : []
    const prompt =`
      Given genres: ${genres.join(", ")} and languages: ${languages.join(", ")},
      return EXACTLY a JSON array of 5 artist names.

      Rules:
      - Output ONLY valid JSON
      - 2026 top 5 artists name.
      - No explanation, no text before/after
      - Format: ["Artist1","Artist2","Artist3","Artist4","Artist5"]
    `
    if (!process.env.GOOGLE_GEMINI_API) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 500 }
      )
    }

    if (genres.length === 0 && languages.length === 0) {
      return NextResponse.json({ artists: [] })
    }

    const result = await model.generateContent(prompt)
    let text = result.response.text()

    //cleaning the response
    text = text.trim()
    text = text.replace(/```json|```/g, "")
    text = text.replace(/'/g, '"')
    let artists: string[] = []

    try {
      artists = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: "Invalid AI JSON", raw: text },
        { status: 500 }
      )
    }
    
    //map AI response(artists) to SoundCharts objects
    const mappedArtists = await Promise.all(
      artists.map(async (name) => {
        return await getSoundchartsArtist(name)
      })
    )


    // mappeedArtosts = {
    //   {
    // uuid , img , name ....
    //   },
    //   {

    //   },
    //   {
          
    //   },
    // }

    //filters nulls if no match artist founded
    const validArtists = mappedArtists.filter(Boolean)

    return NextResponse.json({ artists: validArtists })

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}