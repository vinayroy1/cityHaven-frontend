type Prediction = { description: string; place_id: string };
type AutocompleteResponse = { predictions: Prediction[]; error?: string };

export const createPlacesSessionToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `sess_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
};

export const fetchAutocompleteSuggestions = async (input: string, sessionToken?: string): Promise<Prediction[]> => {
  if (!input || input.trim().length < 3) return [];
  const params = new URLSearchParams();
  params.set("input", input);
  if (sessionToken) params.set("sessionToken", sessionToken);

  const res = await fetch(`/api/google/autocomplete?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data: AutocompleteResponse = await res.json();
  return data.predictions ?? [];
};

export type PlaceDetails = {
  placeId: string;
  formattedAddress: string;
  location: { lat: number | null; lng: number | null };
  city: string;
  locality: string;
  subLocality: string;
  postalCode: string;
  nearby: (string | undefined)[];
};

export const fetchPlaceDetails = async (placeId: string, sessionToken?: string): Promise<PlaceDetails | null> => {
  if (!placeId) return null;
  const params = new URLSearchParams();
  params.set("placeId", placeId);
  if (sessionToken) params.set("sessionToken", sessionToken);

  const res = await fetch(`/api/google/details?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as PlaceDetails & { error?: string };
  if ("error" in data) return null;
  return data;
};

export const fetchReverseGeocode = async (lat: number, lng: number): Promise<PlaceDetails | null> => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const res = await fetch(`/api/google/reverse?lat=${lat}&lng=${lng}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as PlaceDetails & { error?: string };
  if ("error" in data) return null;
  return data;
};
