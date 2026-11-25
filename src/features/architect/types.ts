/** ARCHITECT = COA-registered (only they may be called "Architect"); ENGINEER = civil / structural; DESIGNER = naksha maker. */
export type ProviderType = "ARCHITECT" | "ENGINEER" | "DESIGNER";

export type ArchitectService =
  | "FLOOR_PLAN_2D"
  | "ELEVATION_3D"
  | "STRUCTURAL"
  | "WORKING_DRAWINGS"
  | "MEP"
  | "APPROVAL_DRAWINGS"
  | "VASTU_PLAN"
  | "INTERIOR_LAYOUT"
  | "LANDSCAPE"
  | "SITE_SUPERVISION"
  | "ESTIMATE_BOQ"
  | "RENOVATION_PLAN";

export type BuildingType =
  | "INDEPENDENT_HOUSE"
  | "DUPLEX_VILLA"
  | "BUILDER_FLOOR"
  | "APARTMENT_BUILDING"
  | "FARMHOUSE"
  | "COMMERCIAL_BUILDING"
  | "SHOP_SHOWROOM"
  | "HOSPITAL_SCHOOL"
  | "WAREHOUSE_FACTORY";

export type Facing = "EAST" | "WEST" | "NORTH" | "SOUTH" | "NORTH_EAST" | "NORTH_WEST" | "SOUTH_EAST" | "SOUTH_WEST";
export type Floors = "G" | "G+1" | "G+2" | "G+3" | "G+4+";
export type Bhk = "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK+";
export type StartWhen = "IMMEDIATE" | "1_3_MONTHS" | "3_6_MONTHS" | "EXPLORING";
export type ListingStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "PUBLISHED" | "PAUSED" | "REJECTED" | "ARCHIVED";
export type LeadStatus = "NEW" | "CONTACTED" | "QUOTED" | "WON" | "LOST";
export type PackageUnit = "PER_SQFT" | "FIXED";

export interface ArchitectPackage {
  name: string;
  unit: PackageUnit;
  price: number;
  includes: string[];
}

export interface ArchitectProject {
  id: number;
  title: string;
  city: string | null;
  locality: string | null;
  buildingType: BuildingType | null;
  plotWidthFt: number | null;
  plotDepthFt: number | null;
  plotSizeSqft: number | null;
  builtUpSqft: number | null;
  facing: Facing | null;
  floors: Floors | null;
  bhk: Bhk | null;
  vastu: boolean;
  completedOn: string | null;
  coverImage: string | null;
  images: string[];
  description: string | null;
  isFeatured: boolean;
}

export interface ArchitectProfile {
  id: number;
  slug: string;
  providerType: ProviderType;
  isFirm: boolean;
  businessName: string;
  ownerName: string | null;
  logo: string | null;
  coverImage: string | null;
  about: string | null;
  yearEstablished: number | null;
  experienceYears: number | null;
  teamSize: number | null;
  coaNumber: string | null;
  coaVerified: boolean;
  qualification: string | null;
  licenceAuthority: string | null;
  canSignApprovals: boolean;
  languages: string[];
  countryCode: string;
  state: string | null;
  city: string;
  locality: string | null;
  serviceCities: string[];
  worksOnline: boolean;
  services: ArchitectService[];
  buildingTypes: BuildingType[];
  turnaroundDays: number | null;
  revisionsIncluded: number | null;
  siteVisit: boolean;
  quoteOnly: boolean;
  startingPrice: number | null;
  startingUnit: PackageUnit | null;
  packages: ArchitectPackage[];
  workGallery: string[];
  isVerified: boolean;
  status: ListingStatus;
  publishedAt: string | null;
  projects: ArchitectProject[];
  projectCount: number;
  // owner-only
  licenceNumber?: string | null;
  address?: string | null;
  pincode?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  showPhone?: boolean;
  gstin?: string | null;
  reviewNotes?: string | null;
  statusReason?: string | null;
  submittedAt?: string | null;
  listingPaidUntil?: string | null;
  completenessPct?: number;
  viewCount?: number;
}

export interface ReadinessItem {
  id: string;
  label: string;
  step: string;
  required: boolean;
  done: boolean;
}

export interface MyArchitect {
  profile: ArchitectProfile | null;
  readiness: { canSubmit: boolean; pct: number; items: ReadinessItem[] };
  billing: { monthlyCredits: number; periodDays: number; paidUntil: string | null; isPaid: boolean; pausedForPayment: boolean } | null;
  /** Admin switch: false = submitting publishes straight away (always true for COA architects). */
  reviewRequired?: boolean;
}

export type ArchitectSave = Partial<
  Omit<
    ArchitectProfile,
    "id" | "slug" | "status" | "isVerified" | "coaVerified" | "projects" | "projectCount" | "experienceYears" | "startingPrice" | "startingUnit" | "publishedAt"
  >
>;

export interface ArchitectLead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  plotWidthFt: number | null;
  plotDepthFt: number | null;
  plotSizeSqft: number | null;
  facing: Facing | null;
  floors: Floors | null;
  bhk: Bhk | null;
  vastu: boolean | null;
  servicesWanted: ArchitectService[];
  budgetK: number | null;
  startWhen: StartWhen | null;
  message: string | null;
  status: LeadStatus;
  isUnlocked: boolean;
  ownerNote: string | null;
  createdAt: string;
}

export interface ArchitectInquiryInput {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  plotWidthFt?: number | null;
  plotDepthFt?: number | null;
  plotSizeSqft?: number | null;
  facing?: Facing | null;
  floors?: Floors | null;
  bhk?: Bhk | null;
  vastu?: boolean | null;
  servicesWanted?: ArchitectService[];
  budgetK?: number | null;
  startWhen?: StartWhen | null;
  message?: string;
}

export interface ArchitectSearchParams {
  countryCode?: string;
  city?: string;
  locality?: string;
  providerType?: ProviderType;
  service?: ArchitectService;
  buildingType?: BuildingType;
  facing?: Facing;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ArchitectSearchResponse {
  items: ArchitectProfile[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
