export type ConstructionService =
  | "TURNKEY"
  | "CIVIL_ONLY"
  | "LABOUR_ONLY"
  | "RENOVATION"
  | "ARCHITECTURE"
  | "COMMERCIAL"
  | "INTERIOR_FINISHING"
  | "WATERPROOFING";

export type BuildingType =
  | "INDEPENDENT_HOUSE"
  | "DUPLEX_VILLA"
  | "BUILDER_FLOOR"
  | "APARTMENT_BUILDING"
  | "FARMHOUSE"
  | "COMMERCIAL_BUILDING"
  | "WAREHOUSE_FACTORY";

export type InHouse =
  | "ARCHITECT"
  | "STRUCTURAL_ENGINEER"
  | "SITE_SUPERVISOR"
  | "OWN_LABOUR"
  | "OWN_MACHINERY"
  | "3D_ELEVATION"
  | "SOIL_TESTING"
  | "APPROVALS_SUPPORT";

export type ConstructionSegment = "RESIDENTIAL" | "INFRA";
export type InfraSector =
  | "ROADS_HIGHWAYS"
  | "BRIDGES_FLYOVERS"
  | "HOSPITALS_HEALTHCARE"
  | "SCHOOLS_INSTITUTIONAL"
  | "GOVT_BUILDINGS"
  | "WATER_SEWAGE"
  | "IRRIGATION_DAMS"
  | "RAILWAYS_METRO"
  | "AIRPORTS_PORTS"
  | "POWER_ELECTRICAL"
  | "INDUSTRIAL_EPC"
  | "URBAN_INFRA"
  | "HOUSING_SCHEMES";
export type TurnoverBand = "UNDER_5CR" | "5_25CR" | "25_100CR" | "100_500CR" | "ABOVE_500CR";
export type Certification = "ISO_9001" | "ISO_14001" | "ISO_45001" | "CIDC" | "MSME" | "STARTUP_INDIA";
export type ProjectStatus = "COMPLETED" | "ONGOING";
export type EnquiryType = "PROJECT" | "SUBCONTRACT" | "MATERIAL_SUPPLY" | "JOINT_VENTURE" | "EQUIPMENT_HIRE" | "JOB" | "OTHER";

export interface ContractorRegistration {
  authority: string;
  contractorClass?: string | null;
  number?: string | null;
}

export type Floors = "G" | "G+1" | "G+2" | "G+3" | "G+4+";
export type StartWhen = "IMMEDIATE" | "1_3_MONTHS" | "3_6_MONTHS" | "EXPLORING";
export type ListingStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "PUBLISHED" | "PAUSED" | "REJECTED" | "ARCHIVED";
export type LeadStatus = "NEW" | "CONTACTED" | "SITE_VISIT" | "QUOTED" | "WON" | "LOST";

export interface ConstructionPackage {
  name: string;
  ratePerSqft: number;
  includes: string[];
}

export interface ConstructionMaterials {
  cement?: string[];
  steel?: string[];
  bricks?: string[];
  electrical?: string[];
  plumbing?: string[];
  paint?: string[];
}

export interface ConstructionProject {
  id: number;
  title: string;
  city: string | null;
  locality: string | null;
  buildingType: BuildingType | null;
  plotSizeSqft: number | null;
  builtUpSqft: number | null;
  floors: Floors | null;
  packageName: string | null;
  costLakhs: number | null;
  durationMonths: number | null;
  completedOn: string | null;
  coverImage: string | null;
  images: string[];
  description: string | null;
  sector: InfraSector | null;
  clientAuthority: string | null;
  contractValueCr: number | null;
  projectStatus: ProjectStatus | null;
  isFeatured: boolean;
}

export interface ConstructionProfile {
  id: number;
  slug: string;
  providerType: "INDIVIDUAL" | "COMPANY";
  segment: ConstructionSegment;
  sectors: InfraSector[];
  registrations: ContractorRegistration[];
  turnoverBand: TurnoverBand | null;
  maxContractCr: number | null;
  certifications: Certification[];
  majorClients: string[];
  equipment: string[];
  businessName: string;
  ownerName: string | null;
  logo: string | null;
  coverImage: string | null;
  about: string | null;
  yearEstablished: number | null;
  experienceYears: number | null;
  teamSize: number | null;
  countryCode: string;
  state: string | null;
  city: string;
  locality: string | null;
  serviceCities: string[];
  services: ConstructionService[];
  buildingTypes: BuildingType[];
  inHouse: InHouse[];
  minProjectSqft: number | null;
  maxConcurrentProjects: number | null;
  typicalDurationMonths: number | null;
  quoteOnly: boolean;
  startingRate: number | null;
  packages: ConstructionPackage[];
  materials: ConstructionMaterials;
  structuralWarrantyYears: number | null;
  waterproofingWarrantyYears: number | null;
  workGallery: string[];
  isVerified: boolean;
  status: ListingStatus;
  publishedAt: string | null;
  projects: ConstructionProject[];
  projectCount: number;
  // owner-only
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

export interface MyConstruction {
  profile: ConstructionProfile | null;
  readiness: { canSubmit: boolean; pct: number; items: ReadinessItem[] };
  billing: { monthlyCredits: number; periodDays: number; paidUntil: string | null; isPaid: boolean; pausedForPayment: boolean } | null;
}

export type ConstructionSave = Partial<
  Omit<ConstructionProfile, "id" | "slug" | "status" | "isVerified" | "projects" | "projectCount" | "experienceYears" | "startingRate" | "publishedAt">
>;

export interface ConstructionLead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  plotSizeSqft: number | null;
  floors: Floors | null;
  buildingType: BuildingType | null;
  budgetLakhs: number | null;
  startWhen: StartWhen | null;
  enquiryType: EnquiryType | null;
  organization: string | null;
  message: string | null;
  status: LeadStatus;
  isUnlocked: boolean;
  ownerNote: string | null;
  createdAt: string;
}

export interface ConstructionInquiryInput {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  plotSizeSqft?: number | null;
  floors?: Floors | null;
  buildingType?: BuildingType | null;
  budgetLakhs?: number | null;
  startWhen?: StartWhen | null;
  enquiryType?: EnquiryType | null;
  organization?: string;
  message?: string;
}

export interface ConstructionSearchParams {
  city?: string;
  locality?: string;
  segment?: ConstructionSegment;
  sector?: InfraSector;
  service?: ConstructionService;
  buildingType?: BuildingType;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ConstructionSearchResponse {
  items: ConstructionProfile[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
