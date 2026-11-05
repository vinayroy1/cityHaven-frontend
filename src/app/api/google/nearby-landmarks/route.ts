import { NextResponse, type NextRequest } from "next/server";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { internalHeaders } from "@/components/nearby/guideData";

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
async function geocodeAddressFree(address: string, country = "in"): Promise<{ lat?: number; lng?: number; pincode?: string; formattedAddress?: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&addressdetails=1&countrycodes=${country}&limit=1`;

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

/** Precomputed landmarks for a locality from our backend (OSM/Overture data, no per-request cost). */
async function fetchDbLandmarks(params: URLSearchParams): Promise<Partial<NearbyLandmarksResponse> & { localityId?: number | null } | null> {
  try {
    const url = toInternalApiUrl(`/v1/locations/nearby-landmarks?${params.toString()}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 }, headers: internalHeaders() });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let lat = parseFloat(searchParams.get("lat") || "");
  let lng = parseFloat(searchParams.get("lng") || "");
  const addressParam = (searchParams.get("address") || searchParams.get("q") || "").trim();
  const locality = (searchParams.get("locality") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  // Two-letter country (in/np/bd/lk) for the geocoder; anything else falls back to India.
  const countryParam = (searchParams.get("country") || "in").trim().toLowerCase();
  const country = /^(in|np|bd|lk)$/.test(countryParam) ? countryParam : "in";

  let pincode: string | undefined = undefined;
  let formattedAddress: string | undefined = undefined;

  // 1. Our DB: locality name (+city) or nearest locality to lat/lng.
  const dbParams = new URLSearchParams();
  if (locality) dbParams.set("locality", locality);
  if (city) dbParams.set("city", city);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    dbParams.set("lat", String(lat));
    dbParams.set("lng", String(lng));
  }
  const db = dbParams.toString() ? await fetchDbLandmarks(dbParams) : null;
  if (db?.localityId && (!Number.isFinite(lat) || !Number.isFinite(lng)) && db.coordinates) {
    lat = db.coordinates.lat;
    lng = db.coordinates.lng;
    pincode = db.pincode;
  }

  // 2. Free geocoding (OpenStreetMap) only when we still have no coordinates.
  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && addressParam) {
    const geo = await geocodeAddressFree(addressParam, country);
    if (geo) {
      if (geo.lat && geo.lng) {
        lat = geo.lat;
        lng = geo.lng;
      }
      pincode = geo.pincode;
      formattedAddress = geo.formattedAddress;
    }
  }

  const coordinates = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  // Google Places stays disabled (cost); landmarks come from our DB.
  const response: NearbyLandmarksResponse = {
    success: true,
    coordinates,
    pincode,
    formattedAddress,
    transit: db?.transit ?? [],
    healthcare: db?.healthcare ?? [],
    education: db?.education ?? [],
    lifestyle: db?.lifestyle ?? [],
    all: db?.all ?? [],
  };

  return NextResponse.json(response);
}
