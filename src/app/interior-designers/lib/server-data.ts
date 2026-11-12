import { cache } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import type { InteriorProfile, InteriorSearchResponse } from "@/types/interior.types";

/** Revalidate public interior pages every minute (ISR). */
export const INTERIOR_REVALIDATE_SECONDS = 60;

async function getJson<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(toInternalApiUrl(endpoint), {
      next: { revalidate: INTERIOR_REVALIDATE_SECONDS, tags: ["interiors"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return body?.data ?? null;
  } catch {
    return null;
  }
}

/** Public profile detail, deduped between generateMetadata and the page render. */
export const fetchInteriorProfile = cache((slug: string) =>
  getJson<InteriorProfile>(API_ENDPOINTS.interiors.detail(encodeURIComponent(slug))),
);

/** First page of the directory for a city, or all of India when city is "" (the default view). */
export const fetchInteriorDirectory = cache((city: string) =>
  getJson<InteriorSearchResponse>(
    city
      ? `${API_ENDPOINTS.interiors.search}?city=${encodeURIComponent(city)}&limit=30`
      : `${API_ENDPOINTS.interiors.search}?countryCode=IN&limit=30`,
  ),
);
