import { NextResponse, type NextRequest } from "next/server";

export interface GeoDetectionResult {
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  source: "headers" | "ip_lookup" | "default";
}

const DEFAULT_FALLBACK: GeoDetectionResult = {
  city: "Delhi",
  region: "Delhi",
  country: "IN",
  latitude: 28.6139,
  longitude: 77.209,
  source: "default",
};

export async function GET(req: NextRequest) {
  try {
    const headers = req.headers;

    // 1. Cloudflare Edge Geo Headers
    const cfCity = headers.get("cf-ipcity");
    const cfCountry = headers.get("cf-ipcountry");
    const cfLat = Number(headers.get("cf-iplatitude"));
    const cfLng = Number(headers.get("cf-iplongitude"));

    if (cfCity && cfCountry) {
      return NextResponse.json({
        city: cfCity,
        region: headers.get("cf-region") || undefined,
        country: cfCountry,
        latitude: Number.isFinite(cfLat) ? cfLat : undefined,
        longitude: Number.isFinite(cfLng) ? cfLng : undefined,
        source: "headers",
      } satisfies GeoDetectionResult);
    }

    // 2. Vercel / Edge Provider Headers
    const vercelCity = headers.get("x-vercel-ip-city");
    const vercelCountry = headers.get("x-vercel-ip-country");
    const vercelLat = Number(headers.get("x-vercel-ip-latitude"));
    const vercelLng = Number(headers.get("x-vercel-ip-longitude"));

    if (vercelCity && vercelCountry) {
      return NextResponse.json({
        city: decodeURIComponent(vercelCity),
        region: headers.get("x-vercel-ip-country-region") || undefined,
        country: vercelCountry,
        latitude: Number.isFinite(vercelLat) ? vercelLat : undefined,
        longitude: Number.isFinite(vercelLng) ? vercelLng : undefined,
        source: "headers",
      } satisfies GeoDetectionResult);
    }

    // 3. Inspect Client IP for local development or non-edge proxy
    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "";

    const isLocalhost =
      !clientIp ||
      clientIp === "127.0.0.1" ||
      clientIp === "::1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.");

    if (!isLocalhost) {
      // Fast IP Lookup with strict 1s abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      try {
        const ipRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
          signal: controller.signal,
          headers: { "User-Agent": "cityhaven-geo-lookup" },
          cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (ipRes.ok) {
          const data = await ipRes.json();
          if (data && data.city && data.country_code) {
            return NextResponse.json({
              city: data.city,
              region: data.region,
              country: data.country_code,
              latitude: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : undefined,
              longitude: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : undefined,
              source: "ip_lookup",
            } satisfies GeoDetectionResult);
          }
        }
      } catch {
        // Fall through to default fallback
      }
    }

    // 4. Default regional fallback
    return NextResponse.json(DEFAULT_FALLBACK);
  } catch {
    return NextResponse.json(DEFAULT_FALLBACK);
  }
}
