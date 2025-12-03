import { NextResponse, type NextRequest } from "next/server";

type AddressComponent = { long_name: string; short_name: string; types: string[] };
const pickComponent = (components: AddressComponent[], types: string[]) =>
  components.find((c) => types.every((t) => c.types.includes(t)));

type GoogleDetailsResponse = {
  result?: {
    place_id?: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
    address_components?: AddressComponent[];
    plus_code?: { compound_code?: string };
  };
};

type NearbySearchResponse = { results?: { name?: string }[] };

const fetchNearbyNames = async (key: string, lat: number, lng: number, type: string, keyword?: string, take: number = 1) => {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("key", key);
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("rankby", "distance");
  url.searchParams.set("type", type);
  if (keyword) url.searchParams.set("keyword", keyword);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data: NearbySearchResponse = await res.json();
  return (data.results ?? []).slice(0, take).map((r) => r.name).filter(Boolean) as string[];
};

const firstNonNull = async (tasks: (() => Promise<string | null>)[]) => {
  for (const task of tasks) {
    const result = await task();
    if (result) return result;
  }
  return null;
};

export async function GET(req: NextRequest) {
  const key = process.env.G_SECRET || process.env.NEXT_PUBLIC_G_SECRET;
  if (!key) {
    return NextResponse.json({ error: "Google API key missing (G_SECRET)" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "place_id,formatted_address,address_component,geometry,plus_code");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: res.status });
  }

  const data: GoogleDetailsResponse = await res.json();
  const result = data.result;
  const components = result?.address_components ?? [];
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
  const neighborhood = pickComponent(components, ["neighborhood"]) ?? pickComponent(components, ["route"]);
  const compoundCode = result?.plus_code?.compound_code;
  const nearbyHints = [
    locality?.long_name,
    subLocality?.long_name,
    neighborhood?.long_name,
    compoundCode ? compoundCode.split(" ").slice(1).join(" ") : undefined,
  ].filter(Boolean);

  const location = result?.geometry?.location;
  if (location?.lat && location?.lng) {
    const nearestMetroNames = await firstNonNull([
      async () => {
        const names = await fetchNearbyNames(key, location.lat, location.lng, "subway_station", "metro", 2);
        return names.length ? names[0] : null;
      },
      async () => {
        const names = await fetchNearbyNames(key, location.lat, location.lng, "train_station", "metro", 2);
        return names.length ? names[0] : null;
      },
      async () => {
        const names = await fetchNearbyNames(key, location.lat, location.lng, "transit_station", "metro station", 2);
        return names.length ? names[0] : null;
      },
      async () => {
        const names = await fetchNearbyNames(key, location.lat, location.lng, "point_of_interest", "metro station", 2);
        return names.length ? names[0] : null;
      },
    ]);
    const schoolNames = await fetchNearbyNames(key, location.lat, location.lng, "school", "school", 2);
    const hospitalNames = await fetchNearbyNames(key, location.lat, location.lng, "hospital", "hospital", 2);
    const metroNames = nearestMetroNames ? [nearestMetroNames] : [];

    const seen = new Set(nearbyHints.map((n) => n?.toLowerCase().trim()).filter(Boolean));
    [...metroNames, ...schoolNames, ...hospitalNames].forEach((name) => {
      const keyName = name?.toLowerCase().trim();
      if (name && keyName && !seen.has(keyName)) {
        seen.add(keyName);
        nearbyHints.push(name);
      }
    });
  }

  return NextResponse.json({
    placeId: result?.place_id ?? placeId,
    formattedAddress: result?.formatted_address ?? "",
    location: { lat: location?.lat ?? null, lng: location?.lng ?? null },
    city: city?.long_name ?? "",
    locality: locality?.long_name ?? "",
    subLocality: subLocality?.long_name ?? "",
    postalCode: postalCode?.long_name ?? "",
    nearby: nearbyHints,
  });
}
