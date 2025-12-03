type LocationPermissionOnceOptions = {
  storageKey?: string;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
};

type LocationPermissionResult = {
  position: GeolocationPosition | null;
  error?: string;
  asked: boolean;
};

/**
 * Requests geolocation permission once per storage key.
 * Returns a result object instead of throwing to keep caller code simple.
 */
export const requestLocationPermissionOnce = async (
  opts: LocationPermissionOnceOptions = {},
): Promise<LocationPermissionResult> => {
  if (typeof window === "undefined") {
    return { position: null, error: "Window not available", asked: false };
  }
  if (!navigator.geolocation) {
    return { position: null, error: "Geolocation is not supported in this browser.", asked: false };
  }

  const storageKey = opts.storageKey ?? "locationPermissionAsked";
  const alreadyAsked = window.localStorage.getItem(storageKey);
  if (alreadyAsked) {
    return { position: null, asked: false };
  }
  window.localStorage.setItem(storageKey, "true");

  return new Promise<LocationPermissionResult>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ position: pos, asked: true }),
      (err) => {
        if (err.code === 1) {
          resolve({
            position: null,
            error: "Location permission denied. Please allow access to use current location.",
            asked: true,
          });
        } else if (err.code === 2) {
          resolve({ position: null, error: "Could not determine your location. Try again.", asked: true });
        } else {
          resolve({ position: null, error: "Fetching location timed out. Try again.", asked: true });
        }
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy ?? true,
        timeout: opts.timeout ?? 8000,
        maximumAge: opts.maximumAge ?? 0,
      },
    );
  });
};
