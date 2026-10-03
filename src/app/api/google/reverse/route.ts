import { NextResponse, type NextRequest } from "next/server";

type AddressComponent = { long_name: string; short_name: string; types: string[] };
const pickComponent = (components: AddressComponent[], types: string[]) =>
  components.find((c) => types.every((t) => c.types.includes(t)));

type GeocodeResult = {
  place_id?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  address_components?: AddressComponent[];
};

type GeocodeResponse = { results?: GeocodeResult[]; status?: string; error_message?: string };

export async function GET(req: NextRequest) {
  const key = process.env.G_SECRET || process.env.NEXT_PUBLIC_G_SECRET;
  if (!key) {
    return NextResponse.json({ error: "Google API key missing (G_SECRET)" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch reverse geocode" }, { status: res.status });
  }

  const data: GeocodeResponse = await res.json();
  const primary = data.results?.[0];
  if (!primary) {
    return NextResponse.json({ error: "No results" }, { status: 404 });
  }

  const components = primary.address_components ?? [];
  const city = pickComponent(components, ["locality"]) ?? pickComponent(components, ["administrative_area_level_2"]);
  const subLocality =
    pickComponent(components, ["sublocality_level_1"]) ??
    pickComponent(components, ["sublocality"]) ??
    pickComponent(components, ["administrative_area_level_3"]);
  const locality =
    pickComponent(components, ["sublocality_level_2"]) ??
    pickComponent(components, ["sublocality_level_3"]) ??
    pickComponent(components, ["neighborhood"]) ??
    subLocality;
  const postalCode = pickComponent(components, ["postal_code"]);
  const location = primary.geometry?.location;

  return NextResponse.json({
    placeId: primary.place_id ?? "",
    formattedAddress: primary.formatted_address ?? "",
    location: { lat: location?.lat ?? null, lng: location?.lng ?? null },
    city: city?.long_name ?? "",
    locality: locality?.long_name ?? "",
    subLocality: subLocality?.long_name ?? "",
    postalCode: postalCode?.long_name ?? "",
    nearby: [],
  });
}
