import { cache } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { getAgentById } from "@/data/agents";
import type { Agent } from "@/data/agents";

/** First page of advisors for a directory page (no fallback to other cities). Never throws. */
export const fetchAdvisors = cache(
  async ({ city, locality, countryCode }: { city?: string; locality?: string; countryCode?: string }): Promise<Agent[]> => {
    const qs = new URLSearchParams({ limit: "12", strict: "1" });
    if (city) qs.set("city", city);
    if (city && locality) qs.set("locality", locality);
    if (!city && countryCode) qs.set("countryCode", countryCode);
    try {
      const res = await fetch(toInternalApiUrl(`${API_ENDPOINTS.advisors.list}?${qs}`), { next: { revalidate: 120 } });
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: Agent[] };
      return Array.isArray(json?.data) ? json.data : [];
    } catch {
      return [];
    }
  },
);

/**
 * A published advisor by slug or id. Built-in demo advisors keep their richer demo content, but the
 * country always comes from the database (it decides the URL), so a demo slug can't hide a move abroad.
 */
export const resolveAgent = cache(async (agentId: string): Promise<Agent | null> => {
  const local = getAgentById(agentId);
  const stored = await fetchStoredAgent(agentId);
  if (local) return stored ? { ...local, countryCode: stored.countryCode ?? local.countryCode } : local;
  return stored;
});

async function fetchStoredAgent(agentId: string): Promise<Agent | null> {
  try {
    const res = await fetch(toInternalApiUrl(API_ENDPOINTS.advisors.detail(encodeURIComponent(agentId))), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Partial<Agent> & Record<string, unknown> };
    const raw = json?.data;
    if (!raw) return null;
    const str = (v: unknown, fallback = "") => (typeof v === "string" && v ? v : fallback);
    return {
      ...(raw as Agent),
      id: String(raw.id),
      name: str(raw.name, "Advisor"),
      role: str(raw.role, "Real Estate Advisor"),
      agency: str(raw.agency, "Independent Advisor"),
      reraId: str(raw.reraId),
      city: str(raw.city),
      area: str(raw.area),
      focus: str(raw.focus),
      avatar: str(raw.avatar),
      phone: str(raw.phone),
      email: str(raw.email),
      experience: str(raw.experience),
      services: Array.isArray(raw.services) ? raw.services : [],
      languages: Array.isArray(raw.languages) ? raw.languages : [],
      tours: str(raw.tours, "0"),
      rating: String(raw.rating ?? "5.0"),
      bio: str(raw.bio),
      responseTime: str(raw.responseTime, str(raw.responseTimeText, "Within a few hours")),
      featuredListings: Array.isArray(raw.featuredListings) ? raw.featuredListings : [],
      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    } as Agent;
  } catch {
    return null;
  }
}

