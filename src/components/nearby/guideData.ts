/** Server-side fetchers for the locality guide SEO scope (top 100 cities + indexable localities). */
import { toInternalApiUrl } from "@/lib/api/internalApi";

export type GuideCity = { id: number; name: string; slug: string | null; state: string | null };
export type GuideLocality = { id: number; name: string; slug: string; landmarks: number };

export const guideCityKey = (c: GuideCity) => c.slug || String(c.id);

export async function getGuideCities(): Promise<GuideCity[]> {
  try {
    const res = await fetch(toInternalApiUrl("/v1/locations/locality-guide/cities"), { next: { revalidate: 86400 } });
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
    });
    if (!res.ok) return null;
    const d = await res.json();
    return { city: d.city, localities: d.data ?? [] };
  } catch {
    return null;
  }
}
