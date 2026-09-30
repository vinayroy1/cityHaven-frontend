export type ResultCardProps = {
  id: number;
  title?: string;
  subtitle?: string;
  price?: string;
  area?: string;
  postedAt?: string;
  owner?: string;
  ownerId?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
  listingType?: string | null;
  resCom?: string | null;
  isNew?: boolean;
  isVerified?: boolean;
  posterBadge?: string;
  images?: string[];
};

export type ContactStep = "details" | "profile" | "plans" | "contact";

export const FALLBACK_IMAGE = "/property-placeholder.svg";

export const CONTACT_PLANS = [
  { id: "trial", name: "Trial", contacts: "1 owner contact", description: "Unlock this listing only.", price: "₹49" },
  { id: "starter", name: "Starter", contacts: "5 owner contacts", description: "Good for a few shortlisted homes.", price: "₹199" },
  { id: "basic", name: "Basic", contacts: "10 owner contacts", description: "For one locality search.", price: "₹349" },
  { id: "power", name: "Power", contacts: "20 owner contacts", description: "Best value for active searchers.", price: "₹499", popular: true },
  { id: "premium", name: "Premium", contacts: "40 owner contacts", description: "For comparing multiple localities.", price: "₹899" },
  { id: "assisted", name: "Assisted", contacts: "60 contacts + callback", description: "Priority details and assisted callbacks.", price: "₹1,499" },
  { id: "concierge", name: "Concierge", contacts: "100 contacts + RM", description: "Dedicated help for serious buyers.", price: "₹2,499" },
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
