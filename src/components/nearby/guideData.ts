/** Server-side fetchers for the locality guide SEO scope (top 100 cities + indexable localities). */
import { toInternalApiUrl } from "@/lib/api/internalApi";

/**
 * Server-only header that identifies our Next.js server to the backend, which then returns full
 * locality lists (public callers get a capped list). INTERNAL_API_KEY must never be NEXT_PUBLIC_.
 */
export function internalHeaders(): Record<string, string> {
  const key = process.env.INTERNAL_API_KEY;
  return key ? { "x-internal-key": key } : {};
}

export type GuideCity = { id: number; name: string; slug: string | null; state: string | null; key?: string };
export type GuideLocality = { id: number; name: string; slug: string; landmarks: number; key: string };

/** URL key for a city: the backend's key, else the slugified name (same rule as the backend). */
export const guideCityKey = (c: GuideCity) =>
  c.key ||
  c.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function getGuideCities(): Promise<GuideCity[]> {
  try {
    const res = await fetch(toInternalApiUrl("/v1/locations/locality-guide/cities"), { next: { revalidate: 86400 }, headers: internalHeaders() });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export async function getGuideLocalities(cityKey: string): Promise<{ city: GuideCity; localities: GuideLocality[] } | null> {
  try {
    const res = await fetch(toInternalApiUrl(`/v1/locations/locality-guide/cities/${encodeURIComponent(cityKey)}`), {
      next: { revalidate: 86400 },
      headers: internalHeaders(),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return { city: d.city, localities: d.data ?? [] };
  } catch {
    return null;
  }
}

export type GuideCityPage = { city: GuideCity & { key: string }; indexable: boolean; localities: GuideLocality[] };

/** Any city by URL key (top-100 → indexable; others → noindex but still browsable). */
export async function getGuideCityPage(cityKey: string): Promise<GuideCityPage | null> {
  try {
    const res = await fetch(toInternalApiUrl(`/v1/locations/locality-guide/city/${encodeURIComponent(cityKey)}`), {
      next: { revalidate: 86400 },
      headers: internalHeaders(),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return { city: d.city, indexable: Boolean(d.indexable), localities: d.localities ?? [] };
  } catch {
    return null;
  }
}
