export type FlatmateListingMode = "HAVE_ROOM" | "NEED_ROOM" | "BUDDY_UP";

export type FlatmateListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "MATCHED"
  | "EXPIRED"
  | "ARCHIVED";

export type FlatmateInterestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";

export interface FlatmateProfile {
  id?: number;
  userId?: number;
  displayName?: string | null;
  profilePhoto?: string | null;
  birthYear?: number | null;
  gender?: string | null;
  occupation?: string | null;
  companyOrCollege?: string | null;
  bio?: string | null;
  languages?: string[];
  diet?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  sleepSchedule?: string | null;
  workMode?: string | null;
  cleanlinessLevel?: number | null;
  socialPreference?: string | null;
  hasPets?: boolean | null;
  isIdentityVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlatmateListing {
  id: number;
  slug: string;
  profileId: number;
  mode: FlatmateListingMode;
  status: FlatmateListingStatus;
  title: string;
  description?: string | null;
  countryCode: string;
  stateName?: string | null;
  cityId?: number | null;
  cityName: string;
  localityId?: number | null;
  locality?: string | null;
  preferredLocalities: string[];
  latitude?: number | null;
  longitude?: number | null;
  propertyId?: number | null;
  propertyType?: string | null;
  bhk?: number | null;
  roomType?: string | null;
  furnishing?: string | null;
  rent?: number | null;
  deposit?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  maintenance?: number | null;
  availableFrom?: string | null;
  minimumStayMonths?: number | null;
  currentOccupants?: number | null;
  maximumOccupants?: number | null;
  spotsAvailable: number;
  amenities: string[];
  photos: string[];
  preferredGenders: string[];
  preferredOccupations: string[];
  preferredDiet?: string | null;
  smokingAllowed?: boolean | null;
  drinkingAllowed?: boolean | null;
  petsAllowed?: boolean | null;
  ageMin?: number | null;
  ageMax?: number | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  profile?: FlatmateProfile;
  _count?: {
    interests?: number;
  };
  compatibilityScore?: number | null;
  compatibilityReasons?: string[];
  isBoosted?: boolean;
  boostEndsAt?: string | null;
  contact?: {
    name?: string | null;
    mobileNumber?: string;
    email?: string | null;
  };
}

export interface FlatmateSearchParams {
  mode?: FlatmateListingMode;
  city?: string;
  locality?: string;
  budgetMin?: number;
  budgetMax?: number;
  gender?: string;
  occupation?: string;
  roomType?: string;
  furnishing?: string;
  bhk?: number;
  smokingAllowed?: boolean;
  drinkingAllowed?: boolean;
  petsAllowed?: boolean;
  preferredDiet?: string;
  availableBy?: string;
  page?: number;
  pageSize?: number;
}

export interface FlatmateSearchResponse {
  items: FlatmateListing[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FlatmateInterest {
  id: number;
  listingId: number;
  senderId: number;
  message?: string | null;
  status: FlatmateInterestStatus;
  createdAt: string;
  updatedAt: string;
  listing?: FlatmateListing;
  sender?: {
    id: number;
    name?: string | null;
    profileImage?: string | null;
    mobileNumber?: string;
    email?: string | null;
  };
}

export interface FlatmateListingInput {
  mode: FlatmateListingMode;
  status?: FlatmateListingStatus;
  title: string;
  description?: string | null;
  stateName?: string | null;
  cityId?: number | null;
  cityName: string;
  localityId?: number | null;
  locality?: string | null;
  preferredLocalities?: string[];
  latitude?: number | null;
  longitude?: number | null;
  propertyId?: number | null;
  propertyType?: string | null;
  bhk?: number | null;
  roomType?: string | null;
  furnishing?: string | null;
  rent?: number | null;
  deposit?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  maintenance?: number | null;
  availableFrom?: string | null;
  minimumStayMonths?: number | null;
  currentOccupants?: number | null;
  maximumOccupants?: number | null;
  spotsAvailable?: number;
  amenities?: string[];
  photos?: string[];
  preferredGenders?: string[];
  preferredOccupations?: string[];
  preferredDiet?: string | null;
  smokingAllowed?: boolean | null;
  drinkingAllowed?: boolean | null;
  petsAllowed?: boolean | null;
  ageMin?: number | null;
  ageMax?: number | null;
  phone?: string;
  mobileNumber?: string;
  email?: string;
  contact?: {
    name?: string;
    mobileNumber?: string;
    email?: string;
  };
  profile?: FlatmateProfile | null;
}
