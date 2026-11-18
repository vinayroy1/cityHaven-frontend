export type PanditSegment = "PANDIT" | "VASTU";
export type PanditProviderType = "INDIVIDUAL" | "TEAM";
export type ConsultMode = "IN_PERSON" | "ONLINE" | "PLAN_REVIEW";
export type ListingStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "PUBLISHED" | "PAUSED" | "REJECTED" | "ARCHIVED";
export type PanditLeadStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "LOST";

/** Service, language and tradition keys match backend pandit.constants.ts. */
export type ServiceKey = string;
export type LanguageKey = string;
export type TraditionKey = string;

export interface RateCardItem {
  service: ServiceKey;
  priceFrom: number;
  priceTo?: number | null;
  durationHours?: number | null;
  samagriIncluded?: boolean;
}

export interface PanditReview {
  id: number;
  rating: number;
  service: ServiceKey | null;
  comment: string | null;
  reply: string | null;
  createdAt: string;
  author: string;
  isHidden?: boolean;
}

export interface PanditProfile {
  id: number;
  slug: string;
  segment: PanditSegment;
  providerType: PanditProviderType;
  displayName: string;
  honorific: string | null;
  photo: string | null;
  coverImage: string | null;
  about: string | null;
  experienceYears: number | null;
  teamSize: number | null;
  qualification: string | null;
  gurukul: string | null;
  countryCode: string;
  state: string | null;
  city: string;
  locality: string | null;
  serviceCities: string[];
  services: ServiceKey[];
  rateCard: RateCardItem[];
  startingPrice: number | null;
  languages: LanguageKey[];
  traditions: TraditionKey[];
  consultModes: ConsultMode[];
  specializations: string[];
  travelsOutstation: boolean;
  samagriArranged: boolean;
  noticeDays: number | null;
  gallery: string[];
  videos: string[];
  ratingAvg: number;
  ratingCount: number;
  isVerified: boolean;
  status: ListingStatus;
  publishedAt: string | null;
  // detail only
  reviews?: PanditReview[];
  ratingBreakdown?: Record<string, number>;
  // owner only
  address?: string | null;
  pincode?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  showPhone?: boolean;
  reviewNotes?: string | null;
  statusReason?: string | null;
  submittedAt?: string | null;
  listingPaidUntil?: string | null;
  completenessPct?: number;
  viewCount?: number;
  inquiryCount?: number;
}

export interface ReadinessItem {
  id: string;
  label: string;
  step: string;
  required: boolean;
  done: boolean;
}

export interface Readiness {
  canSubmit: boolean;
  pct: number;
  items: ReadinessItem[];
}

export interface MyPandit {
  profile: PanditProfile | null;
  readiness: Readiness;
  billing: { monthlyCredits: number; periodDays: number; paidUntil: string | null; isPaid: boolean; pausedForPayment: boolean } | null;
}

export type PanditSave = Partial<
  Omit<PanditProfile, "id" | "slug" | "status" | "isVerified" | "startingPrice" | "publishedAt" | "ratingAvg" | "ratingCount" | "reviews" | "ratingBreakdown">
>;

export interface PanditLead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  locality: string | null;
  service: ServiceKey | null;
  eventDate: string | null;
  mode: "IN_PERSON" | "ONLINE" | null;
  language: LanguageKey | null;
  attendees: number | null;
  message: string | null;
  status: PanditLeadStatus;
  isUnlocked: boolean;
  ownerNote: string | null;
  createdAt: string;
}

export interface PanditInquiryInput {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  locality?: string;
  service?: ServiceKey | null;
  eventDate?: string;
  mode?: "IN_PERSON" | "ONLINE" | null;
  language?: LanguageKey | null;
  attendees?: number | null;
  message?: string;
}

export type PanditSort = "relevance" | "rating" | "price" | "experience";

export interface PanditSearchParams {
  countryCode?: string;
  city?: string;
  locality?: string;
  segment?: PanditSegment;
  service?: ServiceKey;
  language?: LanguageKey;
  tradition?: TraditionKey;
  mode?: ConsultMode;
  maxPrice?: number;
  verified?: "1";
  sort?: PanditSort;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PanditSearchResponse {
  items: PanditProfile[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
