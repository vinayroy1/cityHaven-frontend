import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const key = process.env.G_SECRET || process.env.NEXT_PUBLIC_G_SECRET;
  if (!key) {
    return NextResponse.json({ error: "Google API key missing (G_SECRET)" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");
  const sessionToken = searchParams.get("sessionToken");

  if (!input || input.trim().length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", input);
  url.searchParams.set("types", "geocode");
  url.searchParams.set("components", "country:in");
  if (sessionToken) url.searchParams.set("sessiontoken", sessionToken);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ predictions: data.predictions ?? [] });
}
