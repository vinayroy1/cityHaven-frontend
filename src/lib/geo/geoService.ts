import { resolveMetroCluster, type MetroCluster, DEFAULT_COUNTRY } from "@/config/regionalClusters";

export interface UserLocationProfile {
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  source: "gps" | "ip" | "default";
  timestamp: number;
}

const STORAGE_KEY = "awasio_user_geo";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let inMemoryProfile: UserLocationProfile | null = null;
let activeCluster: MetroCluster | null = null;
let detectionPromise: Promise<UserLocationProfile> | null = null;

export function getCachedLocation(): UserLocationProfile | null {
  if (inMemoryProfile) return inMemoryProfile;
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: UserLocationProfile = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      inMemoryProfile = parsed;
      activeCluster = resolveMetroCluster(parsed.city, parsed.country);
      return parsed;
    }
  } catch {
    // ignore parse error
  }
  return null;
}

function saveLocation(profile: UserLocationProfile): void {
  inMemoryProfile = profile;
  activeCluster = resolveMetroCluster(profile.city, profile.country);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent("awasio-geo-change", { detail: profile }));
    } catch {
      // ignore storage quota error
    }
  }
}

/**
 * Detects location automatically using cached profile or backend IP detection endpoint.
 */
export async function detectUserLocation(): Promise<UserLocationProfile> {
  const cached = getCachedLocation();
  if (cached) return cached;

  if (detectionPromise) return detectionPromise;

  detectionPromise = (async () => {
    try {
      const res = await fetch("/api/geo/detect", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const profile: UserLocationProfile = {
          city: data.city || "Delhi",
          region: data.region,
          country: data.country || DEFAULT_COUNTRY,
          latitude: data.latitude,
          longitude: data.longitude,
          source: data.source === "default" ? "default" : "ip",
          timestamp: Date.now(),
        };
        saveLocation(profile);
        return profile;
      }
    } catch {
      // Fall through to default
    }

    const fallback: UserLocationProfile = {
      city: "Delhi",
      region: "Delhi",
      country: DEFAULT_COUNTRY,
      latitude: 28.6139,
      longitude: 77.209,
      source: "default",
      timestamp: Date.now(),
    };
    saveLocation(fallback);
    return fallback;
  })().finally(() => {
    detectionPromise = null;
  });

  return detectionPromise;
}

/**
 * Explicitly requests device GPS coordinates with user consent via HTML5 Geolocation API.
 */
export async function requestGpsLocation(): Promise<UserLocationProfile | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { reverseGeocodeAwasio } = await import("@/lib/awasioSuggestions");
          const result = await reverseGeocodeAwasio(latitude, longitude);
          const detectedCity = result?.city || "Delhi";
          const profile: UserLocationProfile = {
            city: detectedCity,
            region: result?.locality || undefined,
            country: DEFAULT_COUNTRY,
            latitude,
            longitude,
            source: "gps",
            timestamp: Date.now(),
          };
          saveLocation(profile);
          resolve(profile);
        } catch {
          resolve(null);
        }
      },
      () => {
        // User denied or error
        resolve(null);
      },
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: true }
    );
  });
}

/**
 * Returns the currently active MetroCluster based on detected location.
 */
export function getCurrentCluster(): MetroCluster {
  if (activeCluster) return activeCluster;
  const cached = getCachedLocation();
  if (cached) {
    activeCluster = resolveMetroCluster(cached.city, cached.country);
    return activeCluster;
  }
  activeCluster = resolveMetroCluster("Delhi", DEFAULT_COUNTRY);
  return activeCluster;
}
