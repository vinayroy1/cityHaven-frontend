import { NextResponse, type NextRequest } from "next/server";

export interface NearbyLandmarkItem {
  key: string;
  category: "transit" | "healthcare" | "education" | "lifestyle";
  type: string;
  name: string;
  address: string;
  distanceMeters: number;
  distanceKm: number;
  duration?: string;
  lat: number;
  lng: number;
  directionsUri?: string;
}

export interface NearbyLandmarksResponse {
  success: boolean;
  coordinates?: { lat: number; lng: number };
  pincode?: string;
  formattedAddress?: string;
  transit: NearbyLandmarkItem[];
  healthcare: NearbyLandmarkItem[];
  education: NearbyLandmarkItem[];
  lifestyle: NearbyLandmarkItem[];
  all: NearbyLandmarkItem[];
}

interface PlaceResult {
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
}

interface RoutingSummary {
  legs?: Array<{
    duration?: string;
    distanceMeters?: number;
  }>;
  directionsUri?: string;
}

interface GoogleV1Response {
  places?: PlaceResult[];
  routingSummaries?: RoutingSummary[];
}

const SEARCH_CONFIGS: Array<{
  category: "transit" | "healthcare" | "education" | "lifestyle";
  key: string;
  types: string[];
  maxCount: number;
  radiusMeters: number;
}> = [
  // Transit (Metro, Railway, Bus)
  {
    category: "transit",
    key: "metro_station",
    types: ["subway_station"],
    maxCount: 2,
    radiusMeters: 10000,
  },
  {
    category: "transit",
    key: "railway_station",
    types: ["train_station"],
    maxCount: 2,
    radiusMeters: 20000,
  },
  {
    category: "transit",
    key: "bus_stand",
    types: ["bus_station"],
    maxCount: 2,
    radiusMeters: 5000,
  },
  // Healthcare (Hospital, Clinic)
  {
    category: "healthcare",
    key: "hospital",
    types: ["hospital"],
    maxCount: 3,
    radiusMeters: 8000,
  },
  // Education (Schools, Colleges)
  {
    category: "education",
    key: "school",
    types: ["school"],
    maxCount: 3,
    radiusMeters: 6000,
  },
  {
    category: "education",
    key: "college",
    types: ["university"],
    maxCount: 2,
    radiusMeters: 10000,
  },
  // Lifestyle (Mall, Market, Park)
  {
    category: "lifestyle",
    key: "mall",
    types: ["shopping_mall"],
    maxCount: 2,
    radiusMeters: 10000,
  },
  {
    category: "lifestyle",
    key: "market",
    types: ["supermarket", "grocery_store"],
    maxCount: 2,
    radiusMeters: 4000,
  },
  {
    category: "lifestyle",
    key: "park",
    types: ["park"],
    maxCount: 2,
    radiusMeters: 4000,
  },
];

async function fetchNearbyCategory(
  apiKey: string,
  lat: number,
  lng: number,
  config: (typeof SEARCH_CONFIGS)[0]
): Promise<NearbyLandmarkItem[]> {
  try {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const body = {
      includedTypes: config.types,
      maxResultCount: config.maxCount,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: config.radiusMeters,
        },
      },
      routingParameters: {
        origin: { latitude: lat, longitude: lng },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.location,places.primaryType,routingSummaries",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data: GoogleV1Response = await res.json();
    const places = data.places || [];
    const routings = data.routingSummaries || [];

    return places.map((place, idx) => {
      const routing = routings[idx];
      const leg = routing?.legs?.[0];
      const distanceMeters = leg?.distanceMeters ?? 0;
      const duration = leg?.duration ?? undefined;

      // Fallback straight-line distance if routing summary wasn't provided for that leg
      const pLat = place.location?.latitude ?? lat;
      const pLng = place.location?.longitude ?? lng;

      let effectiveDistMeters = distanceMeters;
      if (!effectiveDistMeters && (pLat !== lat || pLng !== lng)) {
        const R = 6371e3;
        const dLat = ((pLat - lat) * Math.PI) / 180;
        const dLng = ((pLng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((pLat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        effectiveDistMeters = Math.round(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R);
      }

      return {
        key: config.key,
        category: config.category,
        type: place.primaryType || config.types[0],
        name: place.displayName?.text || "",
        address: place.formattedAddress || "",
        distanceMeters: effectiveDistMeters,
        distanceKm: Math.round((effectiveDistMeters / 1000) * 10) / 10,
        duration,
        lat: pLat,
        lng: pLng,
        directionsUri: routing?.directionsUri,
      };
    }).filter((item) => item.name.length > 0);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.G_SECRET || process.env.NEXT_PUBLIC_G_SECRET;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "G_SECRET is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  let lat = parseFloat(searchParams.get("lat") || "");
  let lng = parseFloat(searchParams.get("lng") || "");
  const addressParam = (searchParams.get("address") || searchParams.get("q") || "").trim();

  let pincode: string | undefined = undefined;
  let formattedAddress: string | undefined = undefined;

  // If lat/lng missing or invalid, geocode from address string
  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && addressParam) {
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressParam)}&key=${apiKey}`;
      const geoRes = await fetch(geoUrl, { cache: "no-store" });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const firstResult = geoData.results?.[0];
        const loc = firstResult?.geometry?.location;
        if (loc?.lat && loc?.lng) {
          lat = Number(loc.lat);
          lng = Number(loc.lng);
        }
        if (firstResult?.formatted_address) {
          formattedAddress = firstResult.formatted_address;
        }
        const postalComp = firstResult?.address_components?.find((c: any) =>
          c.types?.includes("postal_code")
        );
        if (postalComp?.long_name) {
          pincode = String(postalComp.long_name).trim();
        }
      }
    } catch {
      // Continue to validation
    }
  }

  // If pincode is not resolved yet and we have valid lat/lng, attempt reverse-geocode for postal_code
  if (!pincode && Number.isFinite(lat) && Number.isFinite(lng)) {
    try {
      const revUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const revRes = await fetch(revUrl, { cache: "no-store" });
      if (revRes.ok) {
        const revData = await revRes.json();
        for (const res of revData.results || []) {
          const postalComp = res.address_components?.find((c: any) =>
            c.types?.includes("postal_code")
          );
          if (postalComp?.long_name) {
            pincode = String(postalComp.long_name).trim();
            if (!formattedAddress && res.formatted_address) {
              formattedAddress = res.formatted_address;
            }
            break;
          }
        }
      }
    } catch {
      // Continue without pincode
    }
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { success: false, error: "Valid lat and lng query parameters or a geocodable address are required" },
      { status: 400 }
    );
  }

  // Fetch all categories in parallel
  const results = await Promise.all(
    SEARCH_CONFIGS.map((cfg) => fetchNearbyCategory(apiKey, lat, lng, cfg))
  );

  const flatList = results.flat();

  // Deduplicate by place name
  const seenNames = new Set<string>();
  const uniqueItems: NearbyLandmarkItem[] = [];
  for (const item of flatList) {
    const norm = item.name.toLowerCase().trim();
    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      uniqueItems.push(item);
    }
  }

  const transit = uniqueItems
    .filter((i) => i.category === "transit")
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5);

  const healthcare = uniqueItems
    .filter((i) => i.category === "healthcare")
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5);

  const education = uniqueItems
    .filter((i) => i.category === "education")
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5);

  const lifestyle = uniqueItems
    .filter((i) => i.category === "lifestyle")
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5);

  const response: NearbyLandmarksResponse = {
    success: true,
    coordinates: { lat, lng },
    pincode,
    formattedAddress,
    transit,
    healthcare,
    education,
    lifestyle,
    all: [...transit, ...healthcare, ...education, ...lifestyle],
  };

  return NextResponse.json(response);
}
