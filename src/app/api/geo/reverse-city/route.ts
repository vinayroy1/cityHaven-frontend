import { NextResponse, type NextRequest } from "next/server";

/**
 * Reverse geocode lat/lng to a city and locality using the backend suggestion engine.
 * This replaces Google Maps reverse geocoding — powered purely by our own data.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  try {
    // Delegate to backend geo endpoint if available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${backendUrl}/v1/geo/reverse?lat=${lat}&lng=${lng}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fall through to haversine-based lookup
  }

  // Fallback: approximate reverse geocode from our static city list
  const result = await approximateReverseGeocode(lat, lng);
  return NextResponse.json(result);
}

/**
 * Approximate reverse geocode using haversine distance against known Indian cities.
 * Uses the backend suggestions API to find the nearest city.
 */
async function approximateReverseGeocode(lat: number, lng: number) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Known major city coordinates as fallback
  const MAJOR_CITIES = [
    { city: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
    { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
    { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
    { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
    { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
    { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
    { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
    { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
    { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
    { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
    { city: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794 },
    { city: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
    { city: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
    { city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
    { city: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
    { city: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
    { city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
    { city: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
    { city: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
    { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
    { city: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
    { city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
    { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  ];

  let nearest = MAJOR_CITIES[0];
  let minDist = Infinity;

  for (const city of MAJOR_CITIES) {
    const dLat = (city.lat - lat) * (Math.PI / 180);
    const dLng = (city.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(city.lat * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
    const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371;
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return {
    city: nearest.city,
    locality: nearest.city,
    state: nearest.state,
    pincode: "",
    source: "approximate",
    distanceKm: Math.round(minDist),
  };
}
