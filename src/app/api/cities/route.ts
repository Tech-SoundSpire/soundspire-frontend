import { NextRequest, NextResponse } from "next/server";
import { City, Country } from "country-state-city";
import { getPhoneLength } from "@/lib/countryPhoneLength";

// City search for the mobile app — reuses the same country-state-city dataset the website
// uses, so the app's city→country auto-fill matches the web exactly. Returns the city plus
// its derived country name, dial code, and local phone length.
//
// GET /api/cities?q=mum&limit=10
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "10", 10) || 10, 25);

  if (q.length < 2) {
    return NextResponse.json({ cities: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  // Match cities whose name starts with the query first, then contains it.
  const all = City.getAllCities();
  const starts: typeof all = [];
  const contains: typeof all = [];
  for (const c of all) {
    const name = c.name.toLowerCase();
    if (name.startsWith(q)) starts.push(c);
    else if (name.includes(q)) contains.push(c);
    if (starts.length >= limit) break;
  }
  const matched = [...starts, ...contains].slice(0, limit);

  const countryCache = new Map<string, ReturnType<typeof Country.getCountryByCode>>();
  const cities = matched.map((c) => {
    let country = countryCache.get(c.countryCode);
    if (country === undefined) {
      country = Country.getCountryByCode(c.countryCode);
      countryCache.set(c.countryCode, country);
    }
    const len = getPhoneLength(c.countryCode);
    return {
      city: c.name,
      stateCode: c.stateCode,
      countryCode: c.countryCode,
      country: country?.name || c.countryCode,
      dialCode: country?.phonecode ? `+${country.phonecode.replace(/^\+/, "")}` : "",
      phoneLen: len.max, // app validates against a single length; use the max (most permissive)
    };
  });

  return NextResponse.json({ cities }, { headers: { "Cache-Control": "public, max-age=86400" } });
}
