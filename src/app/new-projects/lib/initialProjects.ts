import { cache } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import type { ProjectListing } from "@/types/project.types";

/** First page of projects, fetched on the server so the grid (and its LCP image) is in the HTML. */
export const getInitialProjects = cache(async (city?: string, localities: string[] = []): Promise<{ items: ProjectListing[]; total: number }> => {
  try {
    const rawEndpoint = API_ENDPOINTS.projects.search;
    const endpoint = toInternalApiUrl(rawEndpoint);
    const url = new URL(endpoint);
    if (city && city !== "All") url.searchParams.set("city", city);
    if (localities.length) url.searchParams.set("locality", localities.join(","));
    url.searchParams.set("page", "1");
    url.searchParams.set("pageSize", "24");
    url.searchParams.set("sortBy", "featured");
    const response = await fetch(url, { next: { revalidate: 60 }, headers: { Accept: "application/json" } });
    if (!response.ok) return { items: [], total: 0 };
    const payload = await response.json();
    const items = payload?.data?.items ?? payload?.items ?? [];
    const total = Number(payload?.data?.total ?? payload?.total ?? items.length);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
});
