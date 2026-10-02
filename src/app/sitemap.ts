import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";
import { getAllAgentIds } from "@/data/agents";

const CITIES = ["Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Core Top-Level Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/propertySearch`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
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

  // 2. City-Specific Property Search Landing Pages
  const citySearchRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${SITE_URL}/propertySearch?city=${encodeURIComponent(city)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 3. Verified Real Estate Advisor Profiles
  const agentIds = getAllAgentIds();
  const agentRoutes: MetadataRoute.Sitemap = agentIds.map((id) => ({
    url: `${SITE_URL}/agents/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Sample active property URLs
  const samplePropertyIds = [5, 7, 9, 12, 14, 15];
  const propertyRoutes: MetadataRoute.Sitemap = samplePropertyIds.map((id) => ({
    url: `${SITE_URL}/properties/${id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  return [...staticRoutes, ...citySearchRoutes, ...agentRoutes, ...propertyRoutes];
}
