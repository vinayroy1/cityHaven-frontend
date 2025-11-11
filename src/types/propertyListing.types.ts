export interface PropertyListingData {
  // Step 1: Basic Details
  listingType?: 'sell' | 'rent' | 'pg';
  propertyCategory?: 'residential' | 'commercial';
  propertyType?: string;

  // Step 2: Location Details
  city?: string;
  locality?: string;
  subLocality?: string;
  societyName?: string;
  houseNumber?: string;

  // Step 3: Property Profile
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  furnishingLevel?: 'furnished' | 'semi-furnished' | 'unfurnished';
  furnishingDetails?: Record<string, number>;
  coveredParking?: number;
  openParking?: number;
  totalFloors?: number;
  propertyFloor?: number;
  propertyAge?: string;
  otherRooms?: string[];

  // Step 4: Photos & Videos
  photos?: string[];
  video?: string | null;

  // Step 5: Pricing Details
  ownershipType?: 'freehold' | 'leasehold' | 'co-op' | 'power-of-attorney';
  expectedPrice?: number | string; // allow string during input
  areaBasis?: 'carpet' | 'builtup' | 'superbuiltup';
  pricePerSqft?: number;
  allInclusive?: boolean;
  taxExcluded?: boolean;
  negotiable?: boolean;
  maintenance?: number | string; // allow string during input
  maintenanceFrequency?: 'monthly' | 'quarterly' | 'yearly';
  bookingAmount?: number | string;
  annualDues?: number | string;
  membershipCharges?: number | string;
  description?: string;

  // Step 6: Amenities & Features
  amenities?: string[];
  propertyFeatures?: string[];
  societyFeatures?: string[];
  locationAdvantages?: string[];

  // Step 7: Review/Publish
  publishOption?: 'immediate' | 'schedule' | 'draft';
}

