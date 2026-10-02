import { ALL_AGENTS, type Agent, type AgentSubscriptionTier } from "@/data/agents";

export interface AgentProfileData {
  id: string;
  name: string;
  role: string;
  agency: string;
  reraId: string;
  reraState: string;
  reraDocumentName?: string;
  avatar: string;
  coverImage?: string;
  city: string;
  area: string;
  experienceYears: number;
  phone: string;
  email: string;
  badge: "Top Rated" | "Premier Agent" | "Top Producer" | "Super Agent" | "Fast Responder";
  services: string[];
  languages: string[];
  bio: string;
  responseTime: string;
  status: "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  activeListingsCount?: number;
  toursCount?: string;
  subscriptionTier: AgentSubscriptionTier;
  isHomepageFeatured: boolean;
  featuredUntil?: string;
}

const STORAGE_KEY = "awasio:agent_profiles";
const CURRENT_AGENT_ID_KEY = "awasio:current_agent_id";

// Default initial agent profile (pre-filled with Aarav Kapoor for rich out-of-the-box experience)
const DEFAULT_PROFILE: AgentProfileData = {
  id: "aarav-kapoor",
  name: "Aarav Kapoor",
  role: "Senior Property Advisor",
  agency: "Urban Nest Realty",
  reraId: "DLRERA2021A0042",
  reraState: "Delhi",
  reraDocumentName: "DLRERA_Certificate_2021A0042.pdf",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  city: "Delhi",
  area: "South Delhi & Chhatarpur",
  experienceYears: 9,
  phone: "+91 98101 24590",
  email: "aarav.kapoor@urbannest.in",
  badge: "Top Rated",
  services: [
    "Private site walkthroughs",
    "Price negotiation",
    "Title & document check",
    "Home loan assistance",
  ],
  languages: ["English", "Hindi", "Punjabi"],
  bio: "With over 9 years of dedicated on-ground experience in South Delhi's premium residential pockets, Aarav specializes in luxury builder floors, boutique bungalows, and South Delhi redevelopment properties. He coordinates seamless site walkthroughs and transparent seller discussions.",
  responseTime: "< 15 mins",
  status: "VERIFIED",
  verifiedAt: "2024-01-15T10:00:00.000Z",
  activeListingsCount: 42,
  toursCount: "140+ visits",
  subscriptionTier: "PRO_ADVISOR",
  isHomepageFeatured: true,
  featuredUntil: "2025-12-31T23:59:59.000Z",
};

function getStorageMap(): Record<string, AgentProfileData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse agent profiles from localStorage:", err);
    return {};
  }
}

function saveStorageMap(map: Record<string, AgentProfileData>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("awasio:agent-profile-updated"));
  } catch (err) {
    console.error("Failed to save agent profiles to localStorage:", err);
  }
}

export function getCurrentAgentId(): string {
  if (typeof window === "undefined") return DEFAULT_PROFILE.id;
  return localStorage.getItem(CURRENT_AGENT_ID_KEY) || DEFAULT_PROFILE.id;
}

export function setCurrentAgentId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_AGENT_ID_KEY, id);
  window.dispatchEvent(new CustomEvent("awasio:agent-profile-updated"));
}

export function getAgentProfile(agentId?: string): AgentProfileData {
  const targetId = agentId || getCurrentAgentId();
  const map = getStorageMap();
  if (map[targetId]) {
    return map[targetId];
  }

  // Check if matches one of the static agents
  const staticAgent = ALL_AGENTS.find((a) => a.id === targetId);
  if (staticAgent) {
    const expNum = parseInt(staticAgent.experience) || 5;
    return {
      id: staticAgent.id,
      name: staticAgent.name,
      role: staticAgent.role,
      agency: staticAgent.agency,
      reraId: staticAgent.reraId,
      reraState: staticAgent.city,
      reraDocumentName: `${staticAgent.reraId}_Certificate.pdf`,
      avatar: staticAgent.avatar,
      coverImage: staticAgent.coverImage,
      city: staticAgent.city,
      area: staticAgent.area,
      experienceYears: expNum,
      phone: staticAgent.phone,
      email: staticAgent.email,
      badge: staticAgent.badge,
      services: staticAgent.services,
      languages: staticAgent.languages,
      bio: staticAgent.bio,
      responseTime: staticAgent.responseTime,
      status: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      activeListingsCount: staticAgent.listingsCount,
      toursCount: staticAgent.tours,
      subscriptionTier: staticAgent.subscriptionTier,
      isHomepageFeatured: staticAgent.isHomepageFeatured,
    };
  }

  return { ...DEFAULT_PROFILE, id: targetId };
}

export function saveAgentProfile(data: Partial<AgentProfileData> & { id: string }): AgentProfileData {
  const map = getStorageMap();
  const current = getAgentProfile(data.id);
  const updated: AgentProfileData = {
    ...current,
    ...data,
  };
  map[data.id] = updated;
  saveStorageMap(map);
  return updated;
}

export function submitAgentForVerification(id: string): AgentProfileData {
  const current = getAgentProfile(id);
  const updated: AgentProfileData = {
    ...current,
    status: "PENDING_VERIFICATION",
    submittedAt: new Date().toISOString(),
    rejectionReason: undefined,
  };
  const map = getStorageMap();
  map[id] = updated;
  saveStorageMap(map);
  return updated;
}

export function setAgentVerificationStatus(
  id: string,
  status: "VERIFIED" | "REJECTED" | "DRAFT" | "PENDING_VERIFICATION",
  notes?: string
): AgentProfileData {
  const current = getAgentProfile(id);
  const isHomepageFeatured =
    status === "VERIFIED" && current.subscriptionTier !== "FREE_VERIFIED";

  const updated: AgentProfileData = {
    ...current,
    status,
    isHomepageFeatured,
    verifiedAt: status === "VERIFIED" ? new Date().toISOString() : current.verifiedAt,
    rejectionReason: status === "REJECTED" ? notes || "Document clarity or registration number mismatch." : undefined,
  };
  const map = getStorageMap();
  map[id] = updated;
  saveStorageMap(map);
  return updated;
}

export function updateAgentSubscription(
  id: string,
  tier: AgentSubscriptionTier
): AgentProfileData {
  const current = getAgentProfile(id);
  const isHomepageFeatured = tier !== "FREE_VERIFIED" && current.status === "VERIFIED";
  const updated: AgentProfileData = {
    ...current,
    subscriptionTier: tier,
    isHomepageFeatured,
    featuredUntil:
      tier !== "FREE_VERIFIED"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
  };
  const map = getStorageMap();
  map[id] = updated;
  saveStorageMap(map);
  return updated;
}

/**
 * Returns merged agent list with dynamic overrides from local storage
 */
export function getMergedAgentsList(): Agent[] {
  if (typeof window === "undefined") return ALL_AGENTS;
  const map = getStorageMap();

  return ALL_AGENTS.map((staticAgent) => {
    const override = map[staticAgent.id];
    if (!override) return staticAgent;

    return {
      ...staticAgent,
      name: override.name || staticAgent.name,
      role: override.role || staticAgent.role,
      agency: override.agency || staticAgent.agency,
      reraId: override.reraId || staticAgent.reraId,
      avatar: override.avatar || staticAgent.avatar,
      city: override.city || staticAgent.city,
      area: override.area || staticAgent.area,
      experience: `${override.experienceYears}+ yrs`,
      phone: override.phone || staticAgent.phone,
      email: override.email || staticAgent.email,
      services: override.services.length ? override.services : staticAgent.services,
      languages: override.languages.length ? override.languages : staticAgent.languages,
      bio: override.bio || staticAgent.bio,
      subscriptionTier: override.subscriptionTier ?? staticAgent.subscriptionTier,
      isHomepageFeatured: override.isHomepageFeatured ?? staticAgent.isHomepageFeatured,
    };
  });
}

/**
 * Returns agents featured in the homepage carousel (active Spotlight or Pro tier + Verified)
 */
export function getMergedHomepageFeaturedAgents(city?: string): Agent[] {
  const all = getMergedAgentsList();
  const featured = all.filter((a) => a.isHomepageFeatured);
  if (!city) return featured;
  const inCity = featured.filter((a) => a.city.toLowerCase() === city.toLowerCase());
  return inCity.length ? inCity : featured;
}
