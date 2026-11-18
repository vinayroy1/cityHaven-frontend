import { cache } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { citySlug } from "@/features/pandit/options";
import type { PanditProfile, PanditSearchResponse } from "@/features/pandit/types";

export const PANDIT_REVALIDATE_SECONDS = 120;
export const PAGE_SIZE = 24;

/** `{ ok:false }` = API unreachable (pages throw so ISR keeps the last good copy instead of caching an error). */
async function getJson<T>(endpoint: string): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(toInternalApiUrl(endpoint), {
      next: { revalidate: PANDIT_REVALIDATE_SECONDS, tags: ["pandits"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { ok: res.status === 404, status: res.status, data: null };
    const body = (await res.json()) as { data?: T };
    return { ok: true, status: res.status, data: body?.data ?? null };
  } catch {
    // `next build` runs without the backend: render an empty shell and let ISR fill it on the first request.
    if (process.env.NEXT_PHASE === "phase-production-build") return { ok: true, status: 0, data: null };
    return { ok: false, status: 0, data: null };
  }
}

/** No city: `countryCode` limits to one country (the root page renders India's list). */
export const fetchPanditDirectory = cache((city: string, locality?: string | null, countryCode?: string) => {
  const qs = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (city) qs.set("city", city);
  if (city && locality) qs.set("locality", locality);
  if (!city && countryCode) qs.set("countryCode", countryCode);
  return getJson<PanditSearchResponse>(`${API_ENDPOINTS.pandits.search}?${qs}`);
});

export const fetchPanditCities = cache(() => getJson<{ city: string; count: number }[]>(API_ENDPOINTS.pandits.cities));

export const fetchPanditProfile = cache((slug: string) => getJson<PanditProfile>(API_ENDPOINTS.pandits.detail(slug)));

/** "varanasi" → "Varanasi" using cities that have listings; otherwise title-case the slug. */
export async function cityFromSlug(slug: string): Promise<string> {
  const { data } = await fetchPanditCities();
  const hit = (data ?? []).find((c) => citySlug(c.city) === slug);
  if (hit) return hit.city;
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
