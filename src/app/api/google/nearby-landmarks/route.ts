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

/**
 * Free Nominatim Geocoder (OpenStreetMap)
 * Replaces paid Google Geocoding API with 100% free open-source geocoder.
 */
async function geocodeAddressFree(address: string): Promise<{ lat?: number; lng?: number; pincode?: string; formattedAddress?: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&addressdetails=1&countrycodes=in&limit=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Awasio-Platform/1.0 (contact@awasio.com)",
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cache 24h
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    const first = items[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    const pincode = first.address?.postcode || undefined;
    const formattedAddress = first.display_name || undefined;

    return {
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      pincode,
      formattedAddress,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let lat = parseFloat(searchParams.get("lat") || "");
  let lng = parseFloat(searchParams.get("lng") || "");
  const addressParam = (searchParams.get("address") || searchParams.get("q") || "").trim();

  let pincode: string | undefined = undefined;
  let formattedAddress: string | undefined = undefined;

  // Free Geocoding: If lat/lng missing, geocode from address using OpenStreetMap (Free, 0 cost)
  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && addressParam) {
    const geo = await geocodeAddressFree(addressParam);
    if (geo) {
      if (geo.lat && geo.lng) {
        lat = geo.lat;
        lng = geo.lng;
      }
      pincode = geo.pincode;
      formattedAddress = geo.formattedAddress;
    }
  }

  // Safe fallback coordinates for default view if geocoding yields nothing
  const coordinates = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  // Google Places API (New) has been disabled to eliminate high recurring API costs.
  // Returns zero-cost empty landmark lists, keeping the frontend form 100% stable.
  const response: NearbyLandmarksResponse = {
    success: true,
    coordinates,
    pincode,
    formattedAddress,
    transit: [],
    healthcare: [],
    education: [],
    lifestyle: [],
    all: [],
  };

  return NextResponse.json(response);
}
