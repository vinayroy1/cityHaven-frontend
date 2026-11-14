import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
import {
  SITE_URL,
  SEO_SEARCH_INTENTS,
  ALL_59_CITIES,
} from "@/constants/seo";
import { toSearchSlug } from "@/components/search/searchQuery";
import { getAllAgentIds } from "@/data/agents";
import { ALL_PAIRS, pairSlug } from "@/components/area/units";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { DEFAULT_POSTS } from "@/constants/defaultBlogs";
import { SITEMAP_CLUSTERS, type SitemapCluster } from "@/constants/sitemapClusters";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";

const CITY_CANONICAL_MAP: Record<string, string> = {
  delhi: "new-delhi",
  bangalore: "bengaluru",
  gurgaon: "gurugram",
};

async function getInventoryData(): Promise<{
  properties: Array<{ id: number; slug?: string | null; updatedAt?: string | null }>;
  clusters: Array<SitemapCluster>;
}> {
  try {
    const endpoint = toInternalApiUrl(API_ENDPOINTS.propertyListing.sitemapInventory);
    const res = await fetch(endpoint, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.clusters && Array.isArray(json.data.clusters) && json.data.clusters.length > 0) {
        return {
          properties: json.data.properties || [],
          clusters: json.data.clusters,
        };
      }
    }
  } catch {
    // Graceful fallback to static verified clusters
  }

  return {
    properties: [],
    clusters: SITEMAP_CLUSTERS,
  };
}

async function getFallbackProperties(): Promise<Array<{ id: number; slug?: string | null; updatedAt?: string | null }>> {
  try {
    const endpoint = toInternalApiUrl(`${API_ENDPOINTS.propertyListing.search}?pageSize=200`);
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: {
        items?: Array<{
          id: number;
          slug?: string | null;
          updatedAt?: string | null;
        }>;
      };
    };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

type SlugRow = { slug?: string | null; updatedAt?: string | null; primaryCity?: string | null };

/** Walks a paginated list endpoint (page/pageSize) up to `maxPages`; never throws. */
async function fetchAllPages(path: string, pageSize: number, sizeParam: "pageSize" | "limit" = "pageSize", maxPages = 40): Promise<SlugRow[]> {
  const out: SlugRow[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const sep = path.includes("?") ? "&" : "?";
      const res = await fetch(toInternalApiUrl(`${path}${sep}page=${page}&${sizeParam}=${pageSize}`), {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const data = json?.data ?? json;
      const items: SlugRow[] = data?.items ?? [];
      out.push(...items);
      const total = Number(data?.total ?? data?.pagination?.total ?? 0);
      const more = data?.hasNextPage ?? data?.hasMore ?? (total ? out.length < total : items.length === pageSize);
      if (!more || items.length === 0) break;
    } catch {
      break;
    }
  }
  return out;
}

async function getPublishedBlogPosts(): Promise<Array<{ slug: string; updatedAt?: string | null }>> {
  try {
    const endpoint = toInternalApiUrl(`${API_ENDPOINTS.blog.list}?pageSize=50`);
    const res = await fetch(endpoint, { next: { revalidate: 1800 } });
    if (res.ok) {
      const json = (await res.json()) as { data?: { items?: Array<{ slug: string; updatedAt?: string | null }> } };
      if (json?.data?.items && json.data.items.length > 0) {
        return json.data.items;
      }
    }
  } catch {
    // fallback to curated default posts
  }
  return DEFAULT_POSTS.map((post) => ({
    slug: post.slug,
    updatedAt: post.updatedAt,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No real modification date for these pages: omit <lastmod> rather than stamping "now" on every
  // request (Google learns an always-fresh lastmod is meaningless and ignores it site-wide).
  const now: Date | undefined = undefined;

  // 1. Core High-Value Top-Level Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/agents`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/propertyListing`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/post-project`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/flatmates/post`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/new-projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/price-trends`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/home-loans`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/nearby`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/emi-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${SITE_URL}/area-converter`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...ALL_PAIRS.map(([a, b]) => ({
      url: `${SITE_URL}/area-converter/${pairSlug(a, b)}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/policies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // 2. Intent Landing Pages (e.g. /buy, /rent, /flatmate, /pg, /commercial, /plot)
  const intentLandingRoutes: MetadataRoute.Sitemap = SEO_SEARCH_INTENTS.map((intent) => ({
    url: `${SITE_URL}/${intent}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // 3. Dynamic Active Properties & Clusters from PostgreSQL Inventory
  const { properties: liveProps, clusters: liveClusters } = await getInventoryData();
  const properties = liveProps.length > 0 ? liveProps : await getFallbackProperties();
  const clusters = liveClusters.length > 0 ? liveClusters : SITEMAP_CLUSTERS;

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((prop) => ({
    url: `${SITE_URL}/properties/${prop.slug || prop.id}`,
    lastModified: prop.updatedAt ? new Date(prop.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 4. Populated City Landing Pages
  // A. All 59 Cities for Buy, Rent, Commercial, and Plot (Indexable & populated across India)
  const CORE_59_CITY_INTENTS = ["buy", "rent", "commercial", "plot"] as const;
  const citySearchRoutes: MetadataRoute.Sitemap = CORE_59_CITY_INTENTS.flatMap((intent) =>
    ALL_59_CITIES.map((city) => ({
      url: `${SITE_URL}/${intent}/${city}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }))
  );

  // B. Active PG Cities (only cities with confirmed PG inventory)
  const activePgCities = ["bengaluru", "gurugram", "dhanwar"];
  const pgCityRoutes: MetadataRoute.Sitemap = activePgCities.map((city) => ({
    url: `${SITE_URL}/pg/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // C. Active Flatmate cities (20 cities with confirmed active listings)
  const activeFlatmateCities = [
    "bengaluru", "mumbai", "pune", "new-delhi", "gurugram", "noida", "hyderabad",
    "chennai", "kolkata", "ahmedabad", "jaipur", "lucknow", "indore", "bhopal",
    "chandigarh", "patna", "kochi", "thane", "navi-mumbai", "vadodara",
  ];
  const flatmateCityRoutes: MetadataRoute.Sitemap = activeFlatmateCities.map((city) => ({
    url: `${SITE_URL}/flatmate/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // 5. Populated Locality Landing Pages (STRICT: ONLY pairs with active listings!)
  const localitySearchRoutes: MetadataRoute.Sitemap = [];
  const visitedLocalityUrls = new Set<string>();

  for (const cluster of clusters) {
    if (!cluster.city || !cluster.locality || cluster.count <= 0) continue;

    let citySlug = toSearchSlug(cluster.city);
    if (CITY_CANONICAL_MAP[citySlug]) {
      citySlug = CITY_CANONICAL_MAP[citySlug];
    }
    const locSlug = toSearchSlug(cluster.locality);

    if (citySlug && locSlug) {
      const url = `${SITE_URL}/${cluster.intent}/${citySlug}/${locSlug}`;
      if (!visitedLocalityUrls.has(url)) {
        visitedLocalityUrls.add(url);
        localitySearchRoutes.push({
          url,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        });
      }
    }
  }

  // 6. Verified Real Estate Advisor Profiles
  const agentIds = getAllAgentIds();
  const agentRoutes: MetadataRoute.Sitemap = agentIds.map((id) => ({
    url: `${SITE_URL}/agents/${id.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 7. Project detail pages live in the per-state sitemaps (/sitemaps/projects-<state>.xml).

  // Populated new project city landing pages for all 59 cities
  const newProjectsCityRoutes: MetadataRoute.Sitemap = ALL_59_CITIES.map((city) => ({
    url: `${SITE_URL}/new-projects/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // 8. Published Blog Posts
  const blogPosts = await getPublishedBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.78,
  }));

  // 8b. Hotels & stays, interior designer profiles and flatmate listings
  const [stays, interiors, flatmates] = await Promise.all([
    fetchAllPages("/v1/stays", 48),
    fetchAllPages(API_ENDPOINTS.interiors.search.replace(/^.*\/api/, ""), 50, "limit"),
    fetchAllPages("/v1/flatmates", 50),
  ]);
  const lastMod = (r: SlugRow) => (r.updatedAt ? new Date(r.updatedAt) : now);
  const stayRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/stays`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...stays.filter((r) => r.slug).map((r) => ({
      url: `${SITE_URL}/stays/${r.slug}`,
      lastModified: lastMod(r),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
  const interiorRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/interior-designers`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...interiors.filter((r) => r.slug && r.primaryCity).map((r) => ({
      url: `${SITE_URL}${interiorProfilePath(r)}`,
      lastModified: lastMod(r),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
  const flatmateDetailRoutes: MetadataRoute.Sitemap = flatmates.filter((r) => r.slug).map((r) => ({
    url: `${SITE_URL}/flatmates/${r.slug}`,
    lastModified: lastMod(r),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 9. Consolidate and Deduplicate all URLs
  const allRoutes = [
    ...staticRoutes,
    ...intentLandingRoutes,
    ...citySearchRoutes,
    ...pgCityRoutes,
    ...flatmateCityRoutes,
    ...localitySearchRoutes,
    ...agentRoutes,
    ...propertyRoutes,
    ...newProjectsCityRoutes,
    ...blogRoutes,
    ...stayRoutes,
    ...interiorRoutes,
    ...flatmateDetailRoutes,
  ];

  const uniqueUrls = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const route of allRoutes) {
    if (route?.url && !uniqueUrls.has(route.url)) {
      uniqueUrls.set(route.url, route);
    }
  }

  return Array.from(uniqueUrls.values());
}
