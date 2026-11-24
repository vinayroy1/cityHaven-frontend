import { cache } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { citySlug } from "@/features/construction/options";
import type { ConstructionProfile, ConstructionSearchResponse } from "@/features/construction/types";

export const CONSTRUCTION_REVALIDATE_SECONDS = 120;
export const PAGE_SIZE = 12;

/** `{ ok:false }` = API unreachable (pages throw so ISR keeps the last good copy instead of caching an error). */
async function getJson<T>(endpoint: string): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(toInternalApiUrl(endpoint), {
      next: { revalidate: CONSTRUCTION_REVALIDATE_SECONDS, tags: ["construction"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { ok: res.status === 404, status: res.status, data: null };
    const body = (await res.json()) as { data?: T };
    return { ok: true, status: res.status, data: body?.data ?? null };
  } catch {
    // `next build` runs without the backend (Docker build has no network to it): render an empty shell
    // and let ISR fill it on the first request instead of failing the whole build.
    if (process.env.NEXT_PHASE === "phase-production-build") return { ok: true, status: 0, data: null };
    return { ok: false, status: 0, data: null };
  }
}

/** No city: `countryCode` limits to one country (the root page renders India's list). */
export const fetchConstructionDirectory = cache((city: string, locality?: string | null, countryCode?: string) => {
  const qs = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (city) qs.set("city", city);
  if (city && locality) qs.set("locality", locality);
  if (!city && countryCode) qs.set("countryCode", countryCode);
  return getJson<ConstructionSearchResponse>(`${API_ENDPOINTS.construction.search}?${qs}`);
});

export const fetchConstructionCities = cache(() => getJson<{ city: string; count: number }[]>(API_ENDPOINTS.construction.cities));

export const fetchConstructionProfile = cache((slug: string) => getJson<ConstructionProfile>(API_ENDPOINTS.construction.detail(slug)));

/** "patna" → "Patna" using cities that have listings; otherwise title-case the slug. */
export async function cityFromSlug(slug: string): Promise<string> {
  const { data } = await fetchConstructionCities();
  const hit = (data ?? []).find((c) => citySlug(c.city) === slug);
  if (hit) return hit.city;
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
