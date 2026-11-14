import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";

/**
 * Project pages are split into one sitemap per state (/sitemaps/projects-<state>.xml) so each file stays
 * small and Search Console reports coverage per state. Projects in states without their own file go to
 * /sitemaps/projects-other.xml.
 */
export const PROJECT_SITEMAP_STATES: Record<string, string> = {
  haryana: "Haryana",
  jharkhand: "Jharkhand",
  bihar: "Bihar",
  "uttar-pradesh": "Uttar Pradesh",
  "west-bengal": "West Bengal",
  assam: "Assam",
  gujarat: "Gujarat",
  karnataka: "Karnataka",
  "madhya-pradesh": "Madhya Pradesh",
  chhattisgarh: "Chhattisgarh",
  uttarakhand: "Uttarakhand",
};

export const PROJECT_SITEMAP_FILES = [...Object.keys(PROJECT_SITEMAP_STATES), "other"].map((k) => `projects-${k}.xml`);

export type SitemapProject = { slug: string; cityName?: string | null; stateName?: string | null; updatedAt?: string | null };

const PAGE_SIZE = 100; // the search API's maximum
const MAX_PAGES = 200;

/** Every live project (slug, city, state, updatedAt). Cached for a day; never throws. */
export async function getAllProjectsForSitemap(): Promise<SitemapProject[]> {
  const out: SitemapProject[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(toInternalApiUrl(`${API_ENDPOINTS.projects.search}?sortBy=newest&page=${page}&pageSize=${PAGE_SIZE}`), {
        next: { revalidate: 86400 },
      });
      if (!res.ok) break;
      const data = (await res.json())?.data;
      const items: SitemapProject[] = data?.items ?? [];
      for (const p of items) if (p?.slug) out.push({ slug: p.slug, cityName: p.cityName, stateName: p.stateName, updatedAt: p.updatedAt });
      if (items.length < PAGE_SIZE || out.length >= Number(data?.total ?? 0)) break;
    } catch {
      break;
    }
  }
  return out;
}

/** "projects-bihar" → the projects that belong in that file. */
export function projectsForSitemap(key: string, all: SitemapProject[]): SitemapProject[] | null {
  if (key === "other") {
    const split = new Set(Object.values(PROJECT_SITEMAP_STATES).map((s) => s.toLowerCase()));
    return all.filter((p) => !split.has((p.stateName ?? "").toLowerCase()));
  }
  const state = PROJECT_SITEMAP_STATES[key];
  if (!state) return null;
  return all.filter((p) => (p.stateName ?? "").toLowerCase() === state.toLowerCase());
}
