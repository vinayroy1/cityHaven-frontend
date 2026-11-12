export type InteriorProviderType = "INDIVIDUAL" | "COMPANY";

export type InteriorVerificationStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type InteriorConsultationType =
  | "FREE_ONLINE"
  | "FREE_SITE_VISIT"
  | "PAID_ONLINE"
  | "PAID_SITE_VISIT"
  | "PAID_DESIGN";

export type InteriorBranchType =
  | "HEAD_OFFICE"
  | "DESIGN_STUDIO"
  | "EXPERIENCE_CENTRE"
  | "SHOWROOM"
  | "REGIONAL_OFFICE"
  | "MANUFACTURING_UNIT"
  | "SALES_OFFICE"
  // v2 wizard branch types
  | "BRANCH"
  | "EXPERIENCE_CENTER"
  | "FACTORY"
  | "WAREHOUSE";

export type InteriorPricingUnit =
  | "PER_SQFT"
  | "PER_ROOM"
  | "PER_UNIT"
  | "FIXED_PRICE"
  | "PER_PROJECT"
  | "CUSTOM_QUOTATION";

export type InteriorInquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "MEETING_FIXED"
  | "QUOTATION_SENT"
  | "CONVERTED"
  | "LOST";

export interface InteriorBranch {
  id: number;
  interiorProfileId: number;
  branchName: string;
  branchType: InteriorBranchType;
  branchManagerName: string;
  contactNumber: string;
  branchEmail?: string | null;
  address: string;
  city: string;
  locality: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  workingHours: string;
  branchPhotos: string[];
  localitiesServed: string[];
  servesOutstation: boolean;
  isAcceptingProjects: boolean;
  overridesCompanyPricing: boolean;
  startingRateMin?: number | null;
  startingRateMax?: number | null;
  pricingUnit?: InteriorPricingUnit | null;
  consultationType?: InteriorConsultationType | null;
  consultationFee?: number | null;
  // ---- v2 additions ----
  isActive?: boolean;
  managerName?: string | null;
  phone?: string | null;
  state?: string | null;
  pricingOverride?: BranchPricingOverride | null;
}

export interface InteriorPackage {
  id: number;
  interiorProfileId: number;
  packageName: string;
  packageCategory: string;
  description?: string | null;
  coverImage?: string | null;
  priceMin: number;
  priceMax?: number | null;
  pricingUnit: InteriorPricingUnit;
  applicablePropertyTypes: string[];
  inclusions: string[];
  exclusions: string[];
  boardMaterialAndBrand?: string | null;
  finishAndBrand?: string | null;
  hardwareAndBrand?: string | null;
  countertopSpec?: string | null;
  flooringSpec?: string | null;
  lightingSpec?: string | null;
  woodworkWarrantyYears?: number | null;
  hardwareWarrantyYears?: number | null;
  civilWarrantyYears?: number | null;
  afterSalesSupportText?: string | null;
  isActive: boolean;
  orderIndex: number;
  packageBranches?: { branch: InteriorBranch }[];
  // ---- v2 additions ----
  pricingMode?: InteriorPackagePricingMode;
  applicableBhk?: string[];
  materialSpecs?: PackageMaterialSpec[];
  warranty?: PackageWarranty | null;
  conditions?: string[];
  branchIds?: number[];
}

export interface InteriorProject {
  id: number;
  interiorProfileId: number;
  title: string;
  slug: string;
  projectCategory: string;
  propertyConfig: string;
  cityName: string;
  locality?: string | null;
  associatedPropertyId?: number | null;
  associatedPropertyName?: string | null;
  carpetAreaSqft?: number | null;
  projectBudget?: number | null;
  completionDate: string;
  executionDurationDays?: number | null;
  designStyle: string;
  servicesPerformed: string[];
  description: string;
  coverImage: string;
  images: string[];
  beforeImages: string[];
  roomGalleries?: Record<string, string[]> | null;
  actualBoardSpec?: string | null;
  actualFinishSpec?: string | null;
  actualHardwareSpec?: string | null;
  actualCountertopSpec?: string | null;
  actualWarrantyGiven?: string | null;
  isApproved: boolean;
  // ---- v2 additions ----
  propertyType?: string | null;
  bhk?: string | null;
  areaSqft?: number | null;
  budgetRange?: string | null;
  durationDays?: number | null;
  branchId?: number | null;
  isFeatured?: boolean;
  roomGalleriesV2?: RoomGallery[];
  afterImages?: string[];
  materialsUsed?: MaterialSpecRow[];
}

export interface InteriorTeamMember {
  id: number;
  interiorProfileId: number;
  interiorBranchId?: number | null;
  name: string;
  designation: string;
  profilePhoto?: string | null;
  experienceYears?: number | null;
  qualification?: string | null;
  specialization?: string | null;
  introduction?: string | null;
  branch?: InteriorBranch | null;
  // ---- v2 additions ----
  branchId?: number | null;
  orgMemberId?: number | null;
  isPublic?: boolean;
}

export interface InteriorInquiry {
  id: number;
  interiorProfileId: number;
  clientUserId?: number | null;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  cityName: string;
  locality?: string | null;
  bhkType: string;
  carpetAreaSqft?: number | null;
  projectScope: string;
  finishTier?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  possessionStatus?: string | null;
  siteVisitRequested: boolean;
  notes?: string | null;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  status: InteriorInquiryStatus;
  createdAt: string;
  ownerNote?: string | null;
  followUpAt?: string | null;
  firstRespondedAt?: string | null;
  /** Listing the lead came from (scope=all responses). */
  profile?: { id: number; businessName?: string | null; displayName?: string | null } | null;
}

export interface InteriorProfile {
  id: number;
  userId: number;
  organizationId?: number | null;
  slug: string;
  providerType: InteriorProviderType;
  businessName: string;
  displayName: string;
  businessCategories: string[];
  specializations: string[];
  logo?: string | null;
  coverBanner?: string | null;
  /** Showcase photos on the profile itself (no project needed). */
  workGallery?: string[];
  tagline?: string | null;
  about: string;
  yearEstablished?: number | null;
  experienceYears: number;
  teamSize: number;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  youtube?: string | null;

  primaryAddress?: string | null;
  primaryCity: string;
  primaryLocality?: string | null;
  primaryPincode?: string | null;
  serviceCities: string[];
  serviceLocalities: string[];
  servesOutstation: boolean;
  workingHours?: string | null;

  servicesOffered: string[];
  commercialServices: string[];
  propertyTypesHandled: string[];
  designStyles: string[];
  executionCapabilities: string[];
  minProjectAreaSqft?: number | null;
  maxProjectAreaSqft?: number | null;

  boardMaterials: string[];
  boardBrands: string[];
  surfaceFinishes: string[];
  finishBrands: string[];
  hardwareFittings: string[];
  hardwareBrands: string[];
  countertops: string[];
  flooringAndWalls: string[];

  isCustomQuotationOnly: boolean;
  startingRateMin?: number | null;
  startingRateMax?: number | null;
  pricingUnit: InteriorPricingUnit;
  startingRateMaterialIncluded: boolean;
  startingRateLaborIncluded: boolean;
  startingRateDesignIncluded: boolean;
  startingRateGstIncluded: boolean;

  consultationType: InteriorConsultationType;
  consultationFee?: number | null;
  consultationDurationMins?: number | null;
  isConsultationFeeRefundable: boolean;
  requiresAppointment: boolean;

  woodworkWarrantyYears?: number | null;
  hardwareWarrantyYears?: number | null;
  civilWarrantyYears?: number | null;
  freeMaintenanceMonths?: number | null;
  warrantyClaimProcess?: string | null;

  contactPerson?: string | null;
  primaryPhone?: string | null;
  whatsappPhone?: string | null;
  businessEmail?: string | null;
  isPhonePublic: boolean;
  isEmailPublic: boolean;
  preferredContactMethod: string;
  isAcceptingProjects: boolean;
  expectedStartDateText?: string | null;
  typicalExecutionDurationText?: string | null;

  gstin?: string | null;
  panNumber?: string | null;
  cinNumber?: string | null;
  designQualifications?: string | null;
  registrationNumber?: string | null;
  verificationDocuments: string[];
  verificationStatus: InteriorVerificationStatus;
  verificationNotes?: string | null;
  isVerified: boolean;
  verifiedAt?: string | null;

  rating: number | string | null;
  reviewCount: number;
  isFeatured: boolean;
  featuredOrder: number;
  /** Paid boost currently running (public search/detail only). */
  isBoosted?: boolean;
  /** Owner / admin viewing a profile that is not live yet. */
  isPreview?: boolean;
  /** End of the active boost (owner endpoints). */
  boostedUntil?: string | null;
  /** Shown in a paid sponsored slot on this results page (must be labelled). */
  isSponsored?: boolean;
  isPublished: boolean;
  publishedAt?: string | null;

  branches?: InteriorBranch[];
  packages?: InteriorPackage[];
  projects?: InteriorProject[];
  teamMembers?: InteriorTeamMember[];
  inquiries?: InteriorInquiry[];
  _count?: {
    projects: number;
    branches: number;
    inquiries?: number;
  };

  // ---- v2 additions (see features/interiors/wizard/CONTRACT.md) ----
  status?: InteriorListingStatus;
  wizardStep?: number | null;
  updatedAt?: string | null;
  legalName?: string | null;
  fullName?: string | null;
  teamSizeRange?: string | null;
  primaryState?: string | null;
  countryCode?: string | null;
  primaryLat?: number | null;
  primaryLng?: number | null;
  siteVisitRadiusKm?: number | null;
  budgetSegments?: string[];
  areaCapacity?: AreaCapacity | null;
  materialSpecs?: MaterialSpecRow[];
  roomPricing?: RoomPricingRow[];
  consultationOptions?: ConsultationOption[];
  branchPricingOverrides?: BranchPricingOverride[];
  warranties?: WarrantyRow[];
  support?: SupportPolicy | null;
  credentials?: CredentialDocument[];
  contact?: ContactAvailability | null;
  qualification?: string | null;
  institute?: string | null;
  coaRegistrationNumber?: string | null;
  iiidMembershipNumber?: string | null;
  awards?: string[];
  certifications?: string[];
  pausedUntil?: string | null;
  statusReason?: string | null;
  lastSubmittedAt?: string | null;
  reviewNotes?: string | null;
  completenessPct?: number | null;
}

export interface InteriorSearchParams {
  city?: string;
  /** Portal country; the backend ignores it when a city is given. */
  countryCode?: string;
  locality?: string;
  providerType?: InteriorProviderType;
  service?: string;
  propertyType?: string;
  designStyle?: string;
  budgetBracket?: "BUDGET" | "MID_RANGE" | "LUXURY" | "ULTRA_LUXE";
  /** Matches the profile's `budgetSegments` (what the directory's Budget Tier filter means). */
  budgetSegment?: InteriorBudgetSegment;
  rateMin?: number;
  rateMax?: number;
  boardMaterial?: string;
  hardwareBrand?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sort?: "recommended" | "rating" | "experience" | "rate_asc" | "rate_desc";
}

export interface InteriorSearchResponse {
  items: InteriorProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}



// ===========================================================================
// v2 listing wizard contracts (plan §2). Additive only.
// ===========================================================================

export enum InteriorListingStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
  PUBLISHED = "PUBLISHED",
  PAUSED = "PAUSED",
  TEMP_UNAVAILABLE = "TEMP_UNAVAILABLE",
  ARCHIVED = "ARCHIVED",
  REJECTED = "REJECTED",
}

export type MaterialCategory =
  | "BOARD"
  | "SURFACE_FINISH"
  | "HARDWARE"
  | "COUNTERTOP"
  | "FLOORING"
  | "WALL_FINISH"
  | "LIGHTING"
  | "SANITARY"
  | "OTHER";

export interface MaterialSpecRow {
  id: string;
  category: MaterialCategory;
  material: string;
  brand?: string;
  grade?: string;
  thicknessMm?: number | null;
  finish?: string;
  isCustom?: boolean;
  notes?: string;
}

export type DesignStyle = string;

export interface AreaCapacity {
  minSqft?: number | null;
  maxSqft?: number | null;
  maxConcurrentProjects?: number | null;
}

export type RoomType =
  | "LIVING"
  | "KITCHEN"
  | "MASTER_BEDROOM"
  | "BEDROOM"
  | "KIDS_ROOM"
  | "BATHROOM"
  | "DINING"
  | "POOJA"
  | "STUDY"
  | "BALCONY"
  | "FOYER"
  | "OTHER";

export interface RoomPricingRow {
  id: string;
  room: RoomType | "";
  customLabel?: string;
  /** null while the row is being filled in the wizard. */
  priceMin: number | null;
  priceMax?: number | null;
  unit: InteriorPricingUnit | "";
  inclusions?: string[];
}

/** Consultation mode for v2 consultation options (legacy InteriorConsultationType is kept). */
export type ConsultationMode = "ONLINE" | "IN_PERSON" | "SITE_VISIT";

export interface ConsultationOption {
  id: string;
  type: ConsultationMode | "";
  fee: number | null;
  isFree: boolean;
  durationMins?: number | null;
  adjustableAgainstProject?: boolean;
}

export type InteriorPackagePricingMode = "FIXED" | "RANGE" | "PER_UNIT";

export interface PackageMaterialSpec {
  category: MaterialCategory;
  spec: string;
  brand?: string;
}

export interface PackageWarranty {
  woodworkYears?: number | null;
  hardwareYears?: number | null;
  civilYears?: number | null;
}

export interface BranchPricingOverride {
  branchId: number;
  startingRateMin?: number | null;
  startingRateMax?: number | null;
  pricingUnit?: InteriorPricingUnit;
  packageOverrides?: { packageId: number; priceMin: number; priceMax?: number | null }[];
}

export interface RoomGallery {
  room: RoomType;
  customLabel?: string;
  images: string[];
}

export type WarrantyCategory =
  | "WOODWORK"
  | "HARDWARE"
  | "CIVIL"
  | "ELECTRICAL"
  | "PLUMBING"
  | "PAINT"
  | "APPLIANCES"
  | "OTHER";

export interface WarrantyRow {
  id: string;
  category: WarrantyCategory;
  /** null = not filled yet (wizard pre-seeds empty WOODWORK/HARDWARE/CIVIL rows). */
  years: number | null;
  months?: number | null;
  coverage?: string;
  exclusions?: string;
}

export type SupportChannel = "PHONE" | "WHATSAPP" | "EMAIL" | "IN_APP" | "SITE_VISIT";

export interface SupportPolicy {
  freeMaintenanceMonths?: number | null;
  responseTimeHours?: number | null;
  channels: SupportChannel[];
  afterSalesNote?: string;
}

export type CredentialDocType =
  | "GST_CERT"
  | "PAN"
  | "COI"
  | "MSME"
  | "TRADE_LICENSE"
  | "COA_REG"
  | "IIID_MEMBERSHIP"
  | "DEGREE"
  | "ID_PROOF"
  | "OTHER";

/** Per-document review status (mirrors moderation outcomes). */
export type CredentialStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface CredentialDocument {
  id: string;
  type: CredentialDocType;
  /** Private object key (view via GET /me/documents/:id/url); legacy rows hold a public URL. */
  fileUrl: string;
  isPrivate?: boolean;
  number?: string;
  status: CredentialStatus;
  rejectionReason?: string;
  uploadedAt?: string;
}

export type LeadPreference = "CALL" | "WHATSAPP" | "EMAIL" | "ANY";

export interface ContactAvailability {
  contactName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  showPhonePublicly: boolean;
  workingDays: string[];
  workingHours: { open: string; close: string };
  acceptingNewProjects: boolean;
  nextAvailableFrom?: string | null;
  leadPreference: LeadPreference;
}

export type { ReadinessLevel, ReadinessItem, ReadinessReport } from "@/lib/listingEngine/types";

export type InteriorTeamSizeRange = "1-5" | "6-15" | "16-50" | "51-200" | "200+";
export type InteriorBudgetSegment = "ECONOMY" | "MID_RANGE" | "PREMIUM" | "LUXURY";
export type InteriorPriceMode = "STARTING_PRICE" | "QUOTE_ONLY";

// ---- Wizard form tree -------------------------------------------------------
// Repeater rows carry a client `id` (string uuid) and, once persisted, the
// server numeric id in `serverId`.

export interface InteriorBranchDraft {
  id: string;
  serverId?: number | null;
  branchName: string;
  branchType: InteriorBranchType | "";
  city: string;
  state: string;
  locality: string;
  address: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  managerName: string;
  workingHours: string;
  overridesCompanyPricing: boolean;
  isActive: boolean;
}

export interface InteriorPackageDraft {
  id: string;
  serverId?: number | null;
  packageName: string;
  packageCategory: string;
  description: string;
  pricingMode: InteriorPackagePricingMode | "";
  priceMin: number | null;
  priceMax: number | null;
  pricingUnit: InteriorPricingUnit | "";
  applicablePropertyTypes: string[];
  applicableBhk: string[];
  inclusions: string[];
  exclusions: string[];
  materialSpecs: PackageMaterialSpec[];
  warranty: PackageWarranty;
  conditions: string[];
  coverImage: string;
  branchIds: number[];
  isActive: boolean;
  orderIndex: number;
}

export interface InteriorProjectDraft {
  id: string;
  serverId?: number | null;
  title: string;
  propertyType: string;
  bhk: string;
  areaSqft: number | null;
  city: string;
  locality: string;
  branchId: number | null;
  budgetRange: string;
  durationDays: number | null;
  /** "YYYY-MM", user entered. */
  completionDate: string;
  designStyle: string;
  coverImage: string;
  roomGalleries: RoomGallery[];
  beforeImages: string[];
  afterImages: string[];
  materialsUsed: MaterialSpecRow[];
  servicesPerformed: string[];
  description: string;
  isFeatured: boolean;
}

export interface InteriorTeamMemberDraft {
  id: string;
  serverId?: number | null;
  name: string;
  designation: string;
  qualification: string;
  experienceYears: number | null;
  photo: string;
  branchId: number | null;
  orgMemberId: number | null;
  isPublic: boolean;
}

export interface InteriorWizardValues {
  /** 1-based index of the furthest step reached (server: profile.wizardStep). */
  wizardStep: number;
  identity: {
    providerType: InteriorProviderType | "";
    fullName: string;
    displayName: string;
    businessName: string;
    legalName: string;
    tagline: string;
    about: string;
    experienceYears: number | null;
    yearEstablished: number | null;
    teamSizeRange: InteriorTeamSizeRange | "";
    logo: string;
    coverBanner: string;
    slug: string;
    website: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
  };
  location: {
    primaryCity: string;
    countryCode: string;
    primaryState: string;
    primaryLocality: string;
    primaryAddress: string;
    primaryPincode: string;
    primaryLat: number | null;
    primaryLng: number | null;
    serviceCities: string[];
    serviceLocalities: string[];
    servesOutstation: boolean;
    siteVisitRadiusKm: number | null;
    branches: InteriorBranchDraft[];
  };
  services: {
    servicesOffered: string[];
    commercialServices: string[];
    propertyTypesHandled: string[];
    budgetSegments: InteriorBudgetSegment[];
    designStyles: string[];
    executionCapabilities: string[];
    areaCapacity: { minSqft: number | null; maxSqft: number | null; maxConcurrentProjects: number | null };
  };
  materials: {
    materialSpecs: MaterialSpecRow[];
  };
  pricing: {
    priceMode: InteriorPriceMode | "";
    startingRateMin: number | null;
    startingRateMax: number | null;
    pricingUnit: InteriorPricingUnit | "";
    startingRateMaterialIncluded: boolean;
    startingRateLaborIncluded: boolean;
    startingRateDesignIncluded: boolean;
    startingRateGstIncluded: boolean;
    packages: InteriorPackageDraft[];
    roomPricing: RoomPricingRow[];
    consultationOptions: ConsultationOption[];
    branchOverrides: BranchPricingOverride[];
  };
  portfolio: {
    projects: InteriorProjectDraft[];
    workGallery: string[];
  };
  team: {
    qualification: string;
    institute: string;
    coaRegistrationNumber: string;
    iiidMembershipNumber: string;
    awards: string[];
    certifications: string[];
    gstin: string;
    panNumber: string;
    cinNumber: string;
    members: InteriorTeamMemberDraft[];
    credentials: CredentialDocument[];
  };
  warranty: {
    warranties: WarrantyRow[];
    support: {
      freeMaintenanceMonths: number | null;
      responseTimeHours: number | null;
      channels: SupportChannel[];
      afterSalesNote: string;
    };
  };
  contact: {
    contactName: string;
    phone: string;
    whatsappSameAsPhone: boolean;
    whatsapp: string;
    email: string;
    showPhonePublicly: boolean;
    isEmailPublic: boolean;
    leadPreference: LeadPreference | "";
    workingDays: string[];
    workingHours: { open: string; close: string };
    /** null until the provider answers. */
    acceptingNewProjects: boolean | null;
    nextAvailableFrom: string;
  };
}

export type InteriorWizardSection =
  | "identity"
  | "location"
  | "services"
  | "materials"
  | "pricing"
  | "portfolio"
  | "team"
  | "warranty"
  | "contact";

/** GET /interiors/me/billing — monthly listing plan and boost options for the owner. */
export interface InteriorBoostOption {
  key: "INTERIOR_BOOST_7" | "INTERIOR_BOOST_15";
  label: string;
  credits: number;
  days: number;
}
export interface InteriorBilling {
  profileId: number;
  monthlyCredits: number;
  periodDays: number;
  paidUntil: string | null;
  isPaid: boolean;
  inGrace: boolean;
  graceEndsAt: string | null;
  pausedForPayment: boolean;
  boostedUntil: string | null;
  boostOptions: InteriorBoostOption[];
  balance: number;
}
