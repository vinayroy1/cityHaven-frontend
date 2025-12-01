export interface PropertyListingData {
  /**
   * @deprecated Legacy scaffold from the first pass of the wizard.
   *             New flow uses PropertyListingFormValues below.
   */
  listingType?: 'sell' | 'rent' | 'pg';
  propertyCategory?: 'residential' | 'commercial';
  propertyType?: string;
  city?: string;
  locality?: string;
  subLocality?: string;
  societyName?: string;
  houseNumber?: string;
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
  photos?: string[];
  video?: string | null;
  ownershipType?: 'freehold' | 'leasehold' | 'co-op' | 'power-of-attorney';
  expectedPrice?: number | string;
  areaBasis?: 'carpet' | 'builtup' | 'superbuiltup';
  pricePerSqft?: number;
  allInclusive?: boolean;
  taxExcluded?: boolean;
  negotiable?: boolean;
  maintenance?: number | string;
  maintenanceFrequency?: 'monthly' | 'quarterly' | 'yearly';
  bookingAmount?: number | string;
  annualDues?: number | string;
  membershipCharges?: number | string;
  description?: string;
  amenities?: string[];
  propertyFeatures?: string[];
  societyFeatures?: string[];
  locationAdvantages?: string[];
  publishOption?: 'immediate' | 'schedule' | 'draft';
}

export type ListingType = 'RENT' | 'SELL' | 'PG';
export type ResComType = 'RESIDENTIAL' | 'COMMERCIAL';
export type AvailabilityStatus = 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION' | 'POSSESSION_SOON' | 'NEW_LAUNCH';

export interface PropertyContextBlock {
  listingType: ListingType;
  resCom: ResComType;
  postedAs?: string;
  propertyTypeId?: string;
  propertySubTypeId?: string;
  propertySubCategoryId?: string;
  locatedInsideId?: string;
  organizationId?: string;
  ownerId?: number | null;
  createdById?: number | null;
}

export interface PropertyLocationBlock {
  cityId?: string;
  cityName?: string;
  localityId?: string;
  locality?: string;
  subLocality?: string;
  projectId?: string;
  societyOrProjectName?: string;
  mall?: string;
  address?: string;
  houseNumber?: string;
  plotNumber?: string;
  latitude?: number | null;
  longitude?: number | null;
  totalTowers?: number | null;
  totalUnits?: number | null;
  constructionStatus?: string;
  possessionDate?: string;
}

export interface PropertyDetailsBlock {
  areaSize?: number | null;
  areaUnit?: string;
  carpetArea?: number | null;
  carpetAreaUnit?: string;
  builtUpArea?: number | null;
  builtUpAreaUnit?: string;
  superBuiltUpArea?: number | null;
  superBuiltUpAreaUnit?: string;
  plotArea?: number | null;
  plotAreaUnit?: string;
  plotLength?: number | null;
  plotBreadth?: number | null;
  widthOfFacingRoad?: number | null;
  widthUnit?: string;
  entranceWidth?: number | null;
  entranceWidthUnit?: string;
  ceilingWidth?: number | null;
  ceilingWidthUnit?: string;
  ceilingHeight?: number | null;
  ceilingHeightUnit?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  otherRooms?: Record<string, boolean>;
  totalFloors?: number | null;
  floorNumber?: string | number | null;
  floorsAllowed?: number | null;
  lift?: boolean;
  ageOfProperty?: string;
  propertyFacing?: string;
  kitchenType?: string;
  roomType?: string;
  sharingCapacity?: number | null;
  totalBeds?: number | null;
  availableBeds?: number | null;
  foodIncluded?: boolean;
  pgFor?: string;
  mealType?: string;
  sharingType?: string;
  securityDeposit?: number | null;
  acAvailable?: boolean;
  attachedBathroom?: boolean;
  attachedBalcony?: boolean;
  availableFor?: string;
  maxNoOfSeats?: number | null;
  minNoOfSeats?: number | null;
  noOfPrivateWashroom?: number | null;
  noOfSharedWashroom?: number | null;
  washRoomAvailable?: boolean;
  totalRooms?: number | null;
  meetingRooms?: number | null;
  cabins?: number | null;
  washrooms?: number | null;
  washroomType?: string;
  officeType?: string;
  cabinCount?: number | null;
  workstations?: number | null;
  multiFloorSelect?: boolean;
  multiFloorNum?: number | null;
  openSides?: number | null;
  staircases?: number | null;
  zoneType?: string;
  suitableForBussinessType?: string;
  businessApproval?: string;
}

export interface PricingFinancialsBlock {
  price?: number | null;
  priceType?: string;
  pricePerSqFt?: number | null;
  pricePerUnitArea?: number | null;
  pricePerUnitAreaUnit?: string;
  priceNegotiable?: boolean;
  priceInWords?: string;
  priceRangeText?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  deposit?: number | null;
  maintenance?: number | null;
  maintenancePaymentPeriod?: string;
  allInclusivePrice?: boolean;
  taxAndGovtExcluded?: boolean;
  inclusive?: string;
  bookingAmount?: number | null;
  membershipCharge?: number | null;
  annualDuesPayable?: number | null;
  expectedRental?: number | null;
  expectedAnnualReturns?: number | null;
  brokerage?: number | null;
  brokerageType?: string;
  brokerageNegotiable?: boolean;
  taxGovtCharges?: number | null;
}

export interface AvailabilityBlock {
  availabilityStatus?: AvailabilityStatus;
  availableFrom?: string;
  possessionStatus?: string;
  possessionType?: string;
  possessionBy?: string;
  possessionByMonth?: number | null;
  constructionDone?: boolean;
  constructionType?: string;
  ageOfProperty?: string;
}

export interface AmenitiesLegalBlock {
  furnishing?: string;
  furnishingDetails?: Record<string, number>;
  pantryType?: string;
  pantrySize?: number | null;
  pantryUnit?: string;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  fireSafety?: Record<string, boolean>;
  facilities?: Record<string, boolean>;
  societyFeatures?: Record<string, boolean>;
  parkingAvailable?: boolean;
  privateParkingBasement?: boolean;
  privateParkingOutside?: boolean;
  publicParking?: boolean;
  noOfParkings?: number | null;
  reservedParking?: Record<string, boolean>;
  ownershipType?: string;
  authorityIds?: number[];
  approvedBy?: Record<string, boolean>;
  boundaryWall?: boolean;
  fireNoc?: boolean;
  amenityIds?: number[];
}

export interface MetaBlock {
  title?: string;
  description?: string;
  aiMetadata?: Record<string, unknown> | null;
  draftState?: Record<string, unknown> | null;
}

export interface MediaBlock {
  mediaIds?: number[];
  documentIds?: number[];
}

export interface PublishOptionsBlock {
  status?: 'ACTIVE' | 'DRAFT';
  qcRequired?: boolean;
}

export interface PropertyListingFormValues {
  context: PropertyContextBlock;
  location: PropertyLocationBlock;
  details: PropertyDetailsBlock;
  pricing: PricingFinancialsBlock;
  availability: AvailabilityBlock;
  amenities: AmenitiesLegalBlock;
  meta: MetaBlock;
  media: MediaBlock;
  publishOptions: PublishOptionsBlock;
}
