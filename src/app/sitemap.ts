import type { MetadataRoute } from "next";
import {
  SITE_URL,
  SEO_SEARCH_INTENTS,
  SEO_CITIES,
  SEO_TOP_LOCALITIES,
  type SeoSearchIntent,
} from "@/constants/seo";
import { getAllAgentIds } from "@/data/agents";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

async function getActiveProperties(): Promise<Array<{ id: number; slug?: string | null; updatedAt?: string | null }>> {
  try {
    const res = await fetch(`${API_ENDPOINTS.propertyListing.search}?pageSize=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: Array<{ id: number; slug?: string | null; updatedAt?: string | null }> } };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

async function getActiveProjects(): Promise<Array<{ slug: string; updatedAt?: string | null }>> {
  try {
    const res = await fetch(`${API_ENDPOINTS.projects.search}?pageSize=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: Array<{ slug: string; updatedAt?: string | null }> } };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

async function getPublishedBlogPosts(): Promise<Array<{ slug: string; updatedAt?: string | null }>> {
  try {
    const res = await fetch(`${API_ENDPOINTS.blog.list}?pageSize=50`, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: Array<{ slug: string; updatedAt?: string | null }> } };
    return json?.data?.items ?? [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Core Top-Level Routes
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

  // 3. City-Specific Landing Pages (e.g. /rent/bengaluru, /flatmate/bengaluru)
  const citySearchRoutes: MetadataRoute.Sitemap = SEO_SEARCH_INTENTS.flatMap((intent) =>
    SEO_CITIES.map((city) => ({
      url: `${SITE_URL}/${intent}/${city}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.88,
    }))
  );

  // 4. Locality-Specific Landing Pages (e.g. /rent/bengaluru/koramangala, /flatmate/bengaluru/hsr-layout)
  const highIntentLocalityCategories: SeoSearchIntent[] = ["rent", "flatmate", "pg", "buy"];
  const localitySearchRoutes: MetadataRoute.Sitemap = highIntentLocalityCategories.flatMap((intent) =>
    Object.entries(SEO_TOP_LOCALITIES).flatMap(([city, localities]) =>
      localities.map((locality) => ({
        url: `${SITE_URL}/${intent}/${city}/${locality}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.82,
      }))
    )
  );

  // 5. Verified Real Estate Advisor Profiles
  const agentIds = getAllAgentIds();
  const agentRoutes: MetadataRoute.Sitemap = agentIds.map((id) => ({
    url: `${SITE_URL}/agents/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 6. Dynamic Active Properties with SEO Slugs
  const properties = await getActiveProperties();
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((prop) => ({
    url: `${SITE_URL}/properties/${prop.slug || prop.id}`,
    lastModified: prop.updatedAt ? new Date(prop.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 7. New Projects Canonical City & Locality Landing Pages
  const newProjectsCityRoutes: MetadataRoute.Sitemap = SEO_CITIES.map((city) => ({
    url: `${SITE_URL}/new-projects/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.88,
  }));

  const newProjectsLocalityRoutes: MetadataRoute.Sitemap = Object.entries(SEO_TOP_LOCALITIES).flatMap(
    ([city, localities]) =>
      localities.map((locality) => ({
        url: `${SITE_URL}/new-projects/${city}/${locality}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.84,
      }))
  );

  // 8. Dynamic Active Projects with SEO Slugs
  const projects = await getActiveProjects();
  const projectDetailRoutes: MetadataRoute.Sitemap = projects.map((proj) => ({
    url: `${SITE_URL}/new-projects/${proj.slug}`,
    lastModified: proj.updatedAt ? new Date(proj.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

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
    ...newProjectsLocalityRoutes,
    ...projectDetailRoutes,
    ...blogRoutes,
  ];
}
