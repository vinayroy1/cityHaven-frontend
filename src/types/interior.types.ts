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
  | "SALES_OFFICE";

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

  rating: number | string;
  reviewCount: number;
  isFeatured: boolean;
  featuredOrder: number;
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
}

export interface InteriorSearchParams {
  city?: string;
  locality?: string;
  providerType?: InteriorProviderType;
  service?: string;
  propertyType?: string;
  designStyle?: string;
  budgetBracket?: "BUDGET" | "MID_RANGE" | "LUXURY" | "ULTRA_LUXE";
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

