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
  isBoosted?: boolean;
  posterBadge?: string;
  images?: string[];
  compact?: boolean;
  priority?: boolean;
  deferImage?: boolean;
};

import { CDN_ASSETS } from "@/config/cdn";

export type ContactStep = "plans" | "contact";

export const FALLBACK_IMAGE = CDN_ASSETS.placeholderWebp;

export const CONTACT_PLANS = [
  { id: "credit_pack_100", name: "100 Credits Starter", contacts: "20 verified contacts (100 credits)", description: "Universal credits for owner contacts, boosts, and listings.", price: "₹99" },
  { id: "credit_pack_300", name: "300 Credits Value Pack", contacts: "60 verified contacts (300 credits)", description: "Best value for active house hunters comparing localities.", price: "₹249", popular: true },
  { id: "credit_pack_650", name: "650 Credits Growth Pack", contacts: "130 verified contacts (650 credits)", description: "Maximum flexibility with zero expiry across all searches.", price: "₹499" },
  { id: "credit_pack_1500", name: "1500 Credits Mega Pack", contacts: "300 verified contacts (1500 credits)", description: "Lowest per-credit rate with priority verified phone reveals.", price: "₹999" },
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
