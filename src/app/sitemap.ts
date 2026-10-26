import type { MetadataRoute } from "next";
import {
  SITE_URL,
  SEO_SEARCH_INTENTS,
  ALL_59_CITIES,
} from "@/constants/seo";
import { toSearchSlug } from "@/components/search/searchQuery";
import { getAllAgentIds } from "@/data/agents";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { DEFAULT_POSTS } from "@/constants/defaultBlogs";

async function getActiveProperties(): Promise<Array<{
  id: number;
  slug?: string | null;
  cityName?: string | null;
  locality?: string | null;
  listingType?: string | null;
  updatedAt?: string | null;
}>> {
  try {
    const endpoint = toInternalApiUrl(`${API_ENDPOINTS.propertyListing.search}?pageSize=200`);
    const res = await fetch(endpoint, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: {
        items?: Array<{
          id: number;
          slug?: string | null;
          cityName?: string | null;
          locality?: string | null;
          listingType?: string | null;
          updatedAt?: string | null;
        }>;
      };
    };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

async function getActiveProjects(): Promise<Array<{ slug: string; city?: string | null; updatedAt?: string | null }>> {
  try {
    const endpoint = toInternalApiUrl(`${API_ENDPOINTS.projects.search}?pageSize=500`);
    const res = await fetch(endpoint, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: Array<{ slug: string; city?: string | null; updatedAt?: string | null }> } };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

async function getPublishedBlogPosts(): Promise<Array<{ slug: string; updatedAt?: string | null }>> {
  try {
    const endpoint = toInternalApiUrl(`${API_ENDPOINTS.blog.list}?pageSize=100`);
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
  const now = new Date();

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
      url: `${SITE_URL}/emi-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
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

  // 3. Dynamic Active Properties with SEO Slugs
  const properties = await getActiveProperties();
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((prop) => ({
    url: `${SITE_URL}/properties/${prop.slug || prop.id}`,
    lastModified: prop.updatedAt ? new Date(prop.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 4. Populated City & Locality Landing Pages (ONLY for cities/localities with active inventory!)
  const activeCitiesSet = new Set<string>();
  const activeLocalityPairs: Array<{ city: string; locality: string }> = [];

  for (const prop of properties) {
    if (prop.cityName) {
      const citySlug = toSearchSlug(prop.cityName);
      if (citySlug) {
        activeCitiesSet.add(citySlug);
        if (prop.locality) {
          const locSlug = toSearchSlug(prop.locality);
          if (locSlug && !activeLocalityPairs.some((p) => p.city === citySlug && p.locality === locSlug)) {
            activeLocalityPairs.push({ city: citySlug, locality: locSlug });
          }
        }
      }
    }
  }

  const searchIntents = ["rent", "buy", "pg", "flatmate", "commercial", "plot"] as const;
  const citySearchRoutes: MetadataRoute.Sitemap = searchIntents.flatMap((intent) =>
    ALL_59_CITIES.map((city) => ({
      url: `${SITE_URL}/${intent}/${city}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }))
  );

  const localitySearchRoutes: MetadataRoute.Sitemap = ["rent", "buy", "pg"].flatMap((intent) =>
    activeLocalityPairs.map(({ city, locality }) => ({
      url: `${SITE_URL}/${intent}/${city}/${locality}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  );

  // 5. Verified Real Estate Advisor Profiles
  const agentIds = getAllAgentIds();
  const agentRoutes: MetadataRoute.Sitemap = agentIds.map((id) => ({
    url: `${SITE_URL}/agents/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 6. Dynamic Active Projects with SEO Slugs (all 359 projects)
  const projects = await getActiveProjects();
  const projectDetailRoutes: MetadataRoute.Sitemap = projects.map((proj) => ({
    url: `${SITE_URL}/new-projects/${proj.slug}`,
    lastModified: proj.updatedAt ? new Date(proj.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Populated new project city landing pages for all 59 cities
  const newProjectsCityRoutes: MetadataRoute.Sitemap = ALL_59_CITIES.map((city) => ({
    url: `${SITE_URL}/new-projects/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // 7. Published Blog Posts
  const blogPosts = await getPublishedBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.78,
  }));

  return [
    ...staticRoutes,
    ...intentLandingRoutes,
    ...citySearchRoutes,
    ...localitySearchRoutes,
    ...agentRoutes,
    ...propertyRoutes,
    ...newProjectsCityRoutes,
    ...projectDetailRoutes,
    ...blogRoutes,
  ];
}
