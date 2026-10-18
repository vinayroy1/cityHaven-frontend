export type ResultCardProps = {
  id: number;
  slug?: string | null;
  title?: string;
  subtitle?: string;
  price?: string;
  area?: string;
  owner?: string;
  ownerId?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
  listingType?: string | null;
  resCom?: string | null;
  decisionDetails?: string[];
  isNew?: boolean;
  isVerified?: boolean;
  posterBadge?: string;
  images?: string[];
  compact?: boolean;
};

import { CDN_ASSETS } from "@/config/cdn";

export type ContactStep = "plans" | "contact";

export const FALLBACK_IMAGE = CDN_ASSETS.placeholderWebp;

export const CONTACT_PLANS = [
  { id: "buyer_single_29", name: "Instant Single", contacts: "1 verified owner", description: "Instant contact reveal with lifetime dashboard access.", price: "₹29" },
  { id: "buyer_starter_99", name: "Local Hunter", contacts: "5 verified owners", description: "Ideal for shortlisting homes in 1 locality.", price: "₹99" },
  { id: "buyer_super_199", name: "Super Hunter", contacts: "15 verified owners", description: "Best value for active house hunters comparing localities.", price: "₹199", popular: true },
  { id: "buyer_explorer_399", name: "City Explorer", contacts: "40 verified owners", description: "Maximum flexibility with zero expiry.", price: "₹399" },
] as const;

export type ContactPlan = {
  dbId?: number;
  id: string;
  name: string;
  contacts: string;
  credits: number;
  description: string;
  price: string;
  popular?: boolean;
};
