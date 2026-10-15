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

/**
 * Returns the currently preferred/stored city for the user synchronously from
 * localStorage ("awasio.home.city" or "awasio_user_geo").
 * If no stored city is available, returns fallbackCity (which defaults to undefined).
 */
export function getUserPreferredCity(fallbackCity?: string): string | undefined {
  if (typeof window === "undefined") return fallbackCity;
  try {
    const savedHomeCity = localStorage.getItem("awasio.home.city");
    if (savedHomeCity?.trim()) return savedHomeCity.trim();

    const cachedGeo = getCachedLocation();
    if (cachedGeo?.city?.trim()) return cachedGeo.city.trim();
  } catch {
    // ignore localStorage errors
  }
  return fallbackCity;
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
    // 1. First try GPS if permission was already granted
    if (typeof window !== "undefined" && "permissions" in navigator && "geolocation" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (permission.state === "granted") {
          const gps = await requestGpsLocation();
          if (gps?.city) return gps;
        }
      } catch {
        // proceed to IP detection
      }
    }

    // 2. Fetch IP-based location from backend endpoint
    try {
      const res = await fetch("/api/geo/detect", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.city) {
          const profile: UserLocationProfile = {
            city: data.city,
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
      }
    } catch {
      // Fall through
    }

    // 3. Fallback when completely offline or undetected
    const fallback: UserLocationProfile = {
      city: "",
      region: undefined,
      country: DEFAULT_COUNTRY,
      source: "default",
      timestamp: Date.now(),
    };
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
          if (result?.city) {
            const profile: UserLocationProfile = {
              city: result.city,
              region: result.locality || undefined,
              country: DEFAULT_COUNTRY,
              latitude,
              longitude,
              source: "gps",
              timestamp: Date.now(),
            };
            saveLocation(profile);
            resolve(profile);
            return;
          }
          resolve(null);
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
