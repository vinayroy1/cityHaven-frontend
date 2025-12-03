// Auto-synced constants from backend schema (prisma/schema/enums.prisma + seedsData)
// Source: testing-backend prisma/schema/enums.prisma & prisma/seedsData.ts

// Enums
export const BACKEND_ENUMS = {
  ListingType: ["RENT", "SELL", "PG"] as const,
  FurnishingType: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"] as const,
  Facing: ["NORTH", "SOUTH", "EAST", "WEST", "NORTH_EAST", "NORTH_WEST", "SOUTH_EAST", "SOUTH_WEST"] as const,
  PossessionStatus: ["READY_TO_MOVE", "UNDER_CONSTRUCTION", "LAUNCH"] as const,
  OwnershipType: ["FREEHOLD", "LEASEHOLD", "CO_OPERATIVE"] as const,
  AvailabilityStatus: ["READY_TO_MOVE", "UNDER_CONSTRUCTION", "POSSESSION_SOON", "NEW_LAUNCH"] as const,
  AgeOfProperty: ["ZERO_TO_ONE", "ONE_TO_FIVE", "FIVE_TO_TEN", "TEN_PLUS"] as const,
  PaymentFrequency: ["ONE_TIME", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUALLY"] as const,
  AreaUnit: [
    "SQ_FT",
    "SQ_M",
    "BIGHA",
    "KOTTAH",
    "GROUNDS",
    "ARES",
    "BISWA",
    "GUNTHA",
    "AANKADAM",
    "HECTARES",
    "CENTS",
    "PERCH",
  ] as const,
  PossessionType: ["WITHIN_3_MONTHS", "WITHIN_6_MONTHS", "BY_2027", "BY_2028", "BY_2029"] as const,
  Months: [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ] as const,
  PropertyZoneType: [
    "INDUSTRIAL",
    "COMMERCIAL",
    "RESIDENTIAL",
    "TRANSPORT_AND_COMMUNICATION",
    "PUBLIC_UTILITIES",
    "PUBLIC_AND_SEMI_PUBLIC_USE",
    "OPEN_SPACES",
    "AGRICULTURAL_ZONE",
    "SPECIAL_ECONOMIC_ZONE",
    "NATURAL_CONSERVATION_ZONE",
    "GOVERNMENT_USE",
    "OTHER",
  ] as const,
  MeasurementUnit: ["FEET", "METER"] as const,
  PropertyOnFloor: [
    "LOWER_BASEMENT",
    "BASEMENT",
    "LOWER_GROUND",
    "GROUND",
    "ROOFTOP_TERRACE",
    "FLOOR_1",
    "FLOOR_2",
    "FLOOR_3",
    "FLOOR_4",
    "FLOOR_5",
    "FLOOR_6",
    "FLOOR_7",
    "FLOOR_8",
    "FLOOR_9",
    "FLOOR_10",
    "FLOOR_11",
    "FLOOR_12",
    "FLOOR_13",
    "FLOOR_14",
    "FLOOR_15",
    "FLOOR_16",
    "FLOOR_17",
    "FLOOR_18",
    "FLOOR_19",
    "FLOOR_20",
  ] as const,
};

export type BackendEnumName = keyof typeof BACKEND_ENUMS;

// Seeded property types / subtypes (from prisma/seedsData.ts)
export const PROPERTY_TYPES = [
  { name: "Residential", slug: "residential", resCom: "RESIDENTIAL" },
  { name: "Commercial", slug: "commercial", resCom: "COMMERCIAL" },
  { name: "PG / Hostel", slug: "pg", resCom: "RESIDENTIAL" },
] as const;

export const PROPERTY_SUBTYPES = [
  // Residential
  { name: "Apartment", slug: "apartment", propertyTypeSlug: "residential" },
  { name: "Independent House / Villa", slug: "independent-house-villa", propertyTypeSlug: "residential" },
  { name: "Independent / Builder Floor", slug: "independent-builder-floor", propertyTypeSlug: "residential" },
  { name: "1 RK / Studio Apartment", slug: "1rk-studio-apartment", propertyTypeSlug: "residential" },
  { name: "Serviced Apartment", slug: "serviced-apartment", propertyTypeSlug: "residential" },
  { name: "Plot / Land", slug: "plot-land-res", propertyTypeSlug: "residential" },
  { name: "Farmhouse", slug: "farmhouse", propertyTypeSlug: "residential" },
  { name: "Other", slug: "residential-other", propertyTypeSlug: "residential" },

  // Commercial
  { name: "Office", slug: "office", propertyTypeSlug: "commercial" },
  { name: "Retail", slug: "retail", propertyTypeSlug: "commercial" },
  { name: "Plot / Land", slug: "plot-land-com", propertyTypeSlug: "commercial" },
  { name: "Storage", slug: "storage", propertyTypeSlug: "commercial" },
  { name: "Industry", slug: "industry", propertyTypeSlug: "commercial" },
  { name: "Hospitality", slug: "hospitality", propertyTypeSlug: "commercial" },
  { name: "Other", slug: "commercial-other", propertyTypeSlug: "commercial" },

  // PG
  { name: "Private Room", slug: "pg-private-room", propertyTypeSlug: "pg" },
  { name: "Shared Room", slug: "pg-shared-room", propertyTypeSlug: "pg" },
  { name: "Bed / Dormitory", slug: "pg-bed", propertyTypeSlug: "pg" },
] as const;

// Seeded sub-categories for commercial (from seedsData.ts)
export const PROPERTY_SUBCATEGORIES = [
  // Office
  { name: "Ready to move office space", slug: "ready-to-move-office-space", propertySubTypeSlug: "office" },
  { name: "Bare shell office space", slug: "bare-shell-office-space", propertySubTypeSlug: "office" },
  { name: "Co-working office space", slug: "co-working-office-space", propertySubTypeSlug: "office" },
  // Retail
  { name: "Commercial Shops", slug: "commercial-shops", propertySubTypeSlug: "retail" },
  { name: "Commercial Showrooms", slug: "commercial-showrooms", propertySubTypeSlug: "retail" },
] as const;

// Seeded "located inside" options (from seedsData.ts)
export const LOCATED_INSIDE_OPTIONS = [
  { name: "Mall", slug: "mall", propertySubTypeSlug: "office" },
  { name: "Commercial Project", slug: "commercial-project", propertySubTypeSlug: "office" },
  { name: "Retail Complex/Building", slug: "retail-complex", propertySubTypeSlug: "office" },
  { name: "Market / High Street", slug: "market-high-street", propertySubTypeSlug: "office" },
  { name: "IT Park", slug: "it-park", propertySubTypeSlug: "office" },
  { name: "Business Park", slug: "business-park", propertySubTypeSlug: "office" },
  { name: "Business Center", slug: "business-center", propertySubTypeSlug: "office" },
  { name: "Corporate Tower", slug: "corporate-tower", propertySubTypeSlug: "office" },
  { name: "Commercial Complex", slug: "commercial-complex", propertySubTypeSlug: "office" },
  { name: "Others", slug: "others", propertySubTypeSlug: "office" },
  // Retail reuse the same set per seedsData
  { name: "Mall", slug: "mall", propertySubTypeSlug: "retail" },
  { name: "Commercial Project", slug: "commercial-project", propertySubTypeSlug: "retail" },
  { name: "Retail Complex/Building", slug: "retail-complex", propertySubTypeSlug: "retail" },
  { name: "Market / High Street", slug: "market-high-street", propertySubTypeSlug: "retail" },
  { name: "IT Park", slug: "it-park", propertySubTypeSlug: "retail" },
  { name: "Business Park", slug: "business-park", propertySubTypeSlug: "retail" },
  { name: "Business Center", slug: "business-center", propertySubTypeSlug: "retail" },
  { name: "Corporate Tower", slug: "corporate-tower", propertySubTypeSlug: "retail" },
  { name: "Commercial Complex", slug: "commercial-complex", propertySubTypeSlug: "retail" },
  { name: "Others", slug: "others", propertySubTypeSlug: "retail" },
] as const;
