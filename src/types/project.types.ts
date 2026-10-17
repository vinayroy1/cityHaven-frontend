export type ProjectStatus = "NEW_LAUNCH" | "UNDER_CONSTRUCTION" | "READY_TO_MOVE";

export interface ProjectConfiguration {
  id: string;
  bhkType: string; // "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK" | "Penthouse" | "Villa"
  carpetArea: number; // in sq.ft
  superBuiltUpArea?: number; // in sq.ft
  bathrooms: number;
  balconies?: number;
  priceMin: number; // in INR
  priceMax?: number; // in INR
  floorPlanUrl?: string;
  isAvailable?: boolean;
}

export interface ProjectListing {
  id: string;
  slug: string;
  name: string;
  developerName: string;
  reraId: string;
  status: ProjectStatus;
  launchDate?: string;
  possessionDate: string; // e.g. "Dec 2026"
  priceMin: number; // Starting price in INR
  priceMax: number; // Max price in INR
  pricePerSqFt?: number;
  city: string;
  locality: string;
  siteAddress: string;
  landmark?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  totalLandArea?: string; // e.g. "11 Acres"
  totalTowers?: number;
  totalUnits?: number;
  configurations: ProjectConfiguration[];
  amenities: string[];
  highlights: string[];
  paymentPlans?: string[];
  masterLayoutUrl?: string;
  brochureUrl?: string;
  images: string[];
  videoTourUrl?: string;
  salesPhone: string;
  salesEmail: string;
  siteVisitTimings?: string;
  createdAt: string;
}

export type ProjectSort = "featured" | "price_asc" | "price_desc" | "possession_soon" | "newest";

export interface ProjectSearchParams {
  q?: string;
  city?: string;
  locality?: string;
  status?: ProjectStatus;
  bhk?: string;
  budgetMin?: number;
  budgetMax?: number;
  verifiedOnly?: boolean;
  sortBy?: ProjectSort;
  page?: number;
  pageSize?: number;
}

export interface ProjectSearchResponse {
  items: ProjectListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CreateProjectInput = Omit<ProjectListing, "id" | "slug" | "createdAt">;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ProjectInquiryInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  configurationId?: string;
  source?: "DETAIL_PAGE" | "SEARCH_CARD" | "HOMEPAGE";
}

export interface ProjectFilterState {
  city: string;
  status: string;
  bhk: string;
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
  sortBy: "featured" | "price_low" | "price_high" | "possession_soon";
}
