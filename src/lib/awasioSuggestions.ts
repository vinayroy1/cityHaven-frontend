/**
 * Awasio Suggestions Client
 * Replaces Google Places with the Awasio Master Suggestion Engine.
 */

import { APP_CONFIG } from "@/constants/app-config";
import { getSelectedCountry } from "@/lib/country/countryStore";
const BASE = `${APP_CONFIG.API.BASE_URL}/v1`;

export type AwasioSuggestionType = "CITY" | "LOCALITY" | "PROJECT" | "DEVELOPER";

export interface AwasioSuggestionMetrics {
  avgPriceSqft?: number;
  formattedPriceSqft?: string;
  priceRange?: string;
  rentalYield?: number;
  livabilityScore?: number;
  infraScore?: number;
  investmentScore?: number;
  metroDistanceKm?: number;
  metroAvailable?: boolean;
  projectStatus?: string;
  bhkConfig?: string;
  propertyType?: string;
  developer?: string;
  tier?: string;
  rating?: number;
  popularFor?: string;
}

export interface AwasioSuggestionLocation {
  city: string;
  state: string;
  countryCode?: string;
  locality?: string;
  pincode?: number;
  zone?: string;
  lat?: number;
  lng?: number;
}

export interface AwasioSuggestion {
  id: string;
  type: AwasioSuggestionType;
  title: string;
  subtitle: string;
  displayText: string;
  badge: string;
  badgeColor: string;
  location: AwasioSuggestionLocation;
  metrics?: AwasioSuggestionMetrics;
  filterPayload: {
    cityName?: string;
    localityName?: string;
    projectName?: string;
    developerName?: string;
    stateName?: string;
    type?: AwasioSuggestionType;
  };
  score: number;
}

export interface AwasioSuggestionGrouped {
  cities: AwasioSuggestion[];
  localities: AwasioSuggestion[];
  projects: AwasioSuggestion[];
  developers: AwasioSuggestion[];
}

export interface AwasioSuggestionResponse {
  success: boolean;
  query: string;
  total: number;
  tookMs: number;
  grouped: AwasioSuggestionGrouped;
  data: AwasioSuggestion[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function fetchAwasioSuggestions(
  query: string,
  options?: {
    city?: string;
    state?: string;
    /** ISO country filter (IN, NP, BD, LK). Omit for the legacy unfiltered search. */
    country?: string;
    types?: AwasioSuggestionType[];
    limit?: number;
    maxPerGroup?: number;
    page?: number;
    pageSize?: number;
  }
): Promise<AwasioSuggestionResponse> {
  const cleanQuery = query?.trim() || "";
  if (!cleanQuery || cleanQuery.length < 2) {
    if (!options?.city) {
      return {
        success: true, query, total: 0, tookMs: 0,
        grouped: { cities: [], localities: [], projects: [], developers: [] },
        data: [],
        pagination: { page: 1, pageSize: options?.pageSize || options?.limit || 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      };
    }
  }
  const effectiveQuery = cleanQuery.length >= 2 ? cleanQuery : (options?.city || "");
  const params = new URLSearchParams({ q: effectiveQuery });
  if (options?.city) params.set("city", options.city);
  if (options?.state) params.set("state", options.state);
  // Explicit country wins (listing form); otherwise the portal country the visitor selected.
  const country = options?.country ?? (typeof document !== "undefined" ? getSelectedCountry() : undefined);
  if (country) params.set("country", country);
  if (options?.types?.length) params.set("types", options.types.join(","));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.maxPerGroup) params.set("maxPerGroup", String(options.maxPerGroup));
  if (options?.page) params.set("page", String(options.page));
  if (options?.pageSize) params.set("pageSize", String(options.pageSize));
  const res = await fetch(`${BASE}/search/suggestions?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Suggestion engine error: ${res.status}`);
  return res.json() as Promise<AwasioSuggestionResponse>;
}

export async function fetchAllSuggestions(
  query: string, limit = 12, city?: string
): Promise<AwasioSuggestionResponse> {
  return fetchAwasioSuggestions(query, { limit, city, maxPerGroup: 5 });
}

export async function reverseGeocodeAwasio(
  lat: number, lng: number
): Promise<{ city: string; locality: string; state: string; pincode?: string; countryCode?: string } | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  try {
    const res = await fetch(`/api/geo/reverse-city?lat=${lat}&lng=${lng}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { city?: string; locality?: string; state?: string; pincode?: string; countryCode?: string };
    return { city: data.city || "", locality: data.locality || "", state: data.state || "", pincode: data.pincode, countryCode: data.countryCode };
  } catch { return null; }
}
