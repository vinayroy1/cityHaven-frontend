import type { ListingType } from "../homePage/components/HeroSearch";

export type CheckboxOption = { label: string; slug: string; apiKey: string; defaultChecked?: boolean };
export type SelectedFilter = { slug: string; label: string; apiKey: string };
export type FilterMeta = { label: string; apiKey: string };
type FilterSection =
  | { key: string; title: string; type: "dual-select"; options: string[] }
  | { key: string; title: string; type: "checkbox"; options: CheckboxOption[] };

export type ListingFilterConfig = {
  defaultFilters?: string[];
  sections: FilterSection[];
  propertyCategorySlugs: string[];
};

export const propertyTypes = [
  { name: "Residential", slug: "residential" },
  { name: "Commercial", slug: "commercial" },
  { name: "PG / Hostel", slug: "pg" },
];

export const propertySubTypes = [
  // Residential
  { name: "Apartment", slug: "apartment", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Independent House / Villa", slug: "independent-house-villa", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Independent / Builder Floor", slug: "independent-builder-floor", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "1 RK / Studio Apartment", slug: "1rk-studio-apartment", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Serviced Apartment", slug: "serviced-apartment", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Plot / Land", slug: "plot-land-res", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Agricultural / Farm Land", slug: "agri-farm-land", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Farmhouse", slug: "farmhouse", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Other", slug: "residential-other", propertyTypeSlug: "residential", apiKey: "propertySubType" },

  // Commercial (grouped sub-categories)
  { name: "Ready to move office space", slug: "ready-to-move-office-space", propertyTypeSlug: "office", apiKey: "propertySubType" },
  { name: "Bare shell office space", slug: "bare-shell-office-space", propertyTypeSlug: "office", apiKey: "propertySubType" },
  { name: "Co-working office space", slug: "co-working-office-space", propertyTypeSlug: "office", apiKey: "propertySubType" },

  { name: "Commercial Shops", slug: "commercial-shops", propertyTypeSlug: "retail", apiKey: "propertySubType" },
  { name: "Commercial Showrooms", slug: "commercial-showrooms", propertyTypeSlug: "retail", apiKey: "propertySubType" },

  { name: "Commercial Land / Inst. Land", slug: "commercial-land-inst-land", propertyTypeSlug: "plot-land-com", apiKey: "propertySubType" },
  { name: "Agricultural / Farm Land", slug: "agricultural-farm-land", propertyTypeSlug: "plot-land-com", apiKey: "propertySubType" },
  { name: "Industrial Lands / Plots", slug: "industrial-lands-plots", propertyTypeSlug: "plot-land-com", apiKey: "propertySubType" },

  { name: "Warehouse", slug: "warehouse", propertyTypeSlug: "storage", apiKey: "propertySubType" },
  { name: "Cold Storage", slug: "cold-storage", propertyTypeSlug: "storage", apiKey: "propertySubType" },
  { name: "Godown", slug: "godown", propertyTypeSlug: "storage", apiKey: "propertySubType" },

  { name: "Factory", slug: "factory", propertyTypeSlug: "industry", apiKey: "propertySubType" },
  { name: "Manufacturing", slug: "manufacturing", propertyTypeSlug: "industry", apiKey: "propertySubType" },

  { name: "Hotel / Resorts", slug: "hotel-resorts", propertyTypeSlug: "hospitality", apiKey: "propertySubType" },
  { name: "Guest-House / Banquet-Halls", slug: "guest-house-banquet-halls", propertyTypeSlug: "hospitality", apiKey: "propertySubType" },

  // PG
  { name: "Private Room", slug: "pg-private-room", propertyTypeSlug: "pg", apiKey: "propertySubType" },
  { name: "Shared Room", slug: "pg-shared-room", propertyTypeSlug: "pg", apiKey: "propertySubType" },
  { name: "Bed / Dormitory", slug: "pg-bed", propertyTypeSlug: "pg", apiKey: "propertySubType" },
];

const RESIDENTIAL_DEFAULTS = [
  "apartment",
  "independent-house-villa",
  "independent-builder-floor",
  "1rk-studio-apartment",
  "serviced-apartment",
  "plot-land-res",
  "farmhouse",
  "residential-other",
];

const COMMERCIAL_DEFAULTS = [
  "ready-to-move-office-space",
  "bare-shell-office-space",
  "co-working-office-space",
  "commercial-shops",
  "commercial-showrooms",
  "commercial-land-inst-land",
  "agricultural-farm-land",
  "industrial-lands-plots",
  "warehouse",
  "cold-storage",
  "godown",
  "factory",
  "manufacturing",
  "hotel-resorts",
  "guest-house-banquet-halls",
];

export const commercialPropertyCategories = [
  { name: "Office space", slug: "office" },
  { name: "Retail", slug: "retail" },
  { name: "Commercial / Inst. land", slug: "plot-land-com" },
  { name: "Storage / Logistics", slug: "storage" },
  { name: "Industry", slug: "industry" },
  { name: "Hospitality", slug: "hospitality" },
];

export const listingFilterConfigs: Record<ListingType, ListingFilterConfig> = {
  SELL: {
    defaultFilters: [...RESIDENTIAL_DEFAULTS],
    propertyCategorySlugs: ["residential"],
    sections: [
      { key: "budget", title: "Budget", type: "dual-select", options: ["No min", "₹40 Lac", "₹80 Lac", "₹1 Cr", "No max"] },
      {
        key: "bedrooms",
        title: "Bedrooms",
        type: "checkbox",
        options: [
          { label: "1 BHK", slug: "1", apiKey: "bedrooms" },
          { label: "2 BHK", slug: "2", apiKey: "bedrooms" },
          { label: "3 BHK", slug: "3", apiKey: "bedrooms" },
          { label: "4+ BHK", slug: "4PLUS", apiKey: "bedrooms" },
        ],
      },
      {
        key: "constructionStatus",
        title: "Construction status",
        type: "checkbox",
        options: [
          { label: "Under construction", slug: "under-construction", apiKey: "constructionStatus" },
          { label: "Ready to move", slug: "ready-to-move", apiKey: "constructionStatus" },
          { label: "New launch", slug: "new-launch", apiKey: "constructionStatus" },
        ],
      },
      {
        key: "postedBy",
        title: "Posted by",
        type: "checkbox",
        options: [
          { label: "Owner", slug: "posted-by-owner", apiKey: "postedBy", defaultChecked: true },
          { label: "Dealer", slug: "posted-by-dealer", apiKey: "postedBy" },
          { label: "Builder", slug: "posted-by-builder", apiKey: "postedBy" },
        ],
      },
    ],
  },
  COMMERCIAL: {
    defaultFilters: [...COMMERCIAL_DEFAULTS],
    propertyCategorySlugs: ["commercial"],
    sections: [
      { key: "budget", title: "Budget", type: "dual-select", options: ["No min", "₹40 Lac", "₹80 Lac", "₹1 Cr", "No max"] },
      { key: "area", title: "Area", type: "dual-select", options: ["No min", "500 sq.ft", "1,000 sq.ft", "5,000 sq.ft", "20,000 sq.ft", "No max"] },
      {
        key: "constructionStatus",
        title: "Construction status",
        type: "checkbox",
        options: [
          { label: "Ready to move", slug: "ready-to-move", apiKey: "constructionStatus", defaultChecked: true },
          { label: "Under construction", slug: "under-construction", apiKey: "constructionStatus" },
          { label: "New launch", slug: "new-launch", apiKey: "constructionStatus" },
        ],
      },
      {
        key: "postedBy",
        title: "Posted by",
        type: "checkbox",
        options: [
          { label: "Owner", slug: "posted-by-owner", apiKey: "postedBy", defaultChecked: true },
          { label: "Dealer", slug: "posted-by-dealer", apiKey: "postedBy" },
          { label: "Builder", slug: "posted-by-builder", apiKey: "postedBy" },
        ],
      },
      {
        key: "investmentOptions",
        title: "Investment options",
        type: "checkbox",
        options: [
          { label: "Pre leased spaces", slug: "invest-pre-leased", apiKey: "investmentOptions" },
          { label: "Food courts", slug: "invest-food-court", apiKey: "investmentOptions" },
          { label: "Restaurants", slug: "invest-restaurant", apiKey: "investmentOptions" },
          { label: "Multiplexes", slug: "invest-multiplex", apiKey: "investmentOptions" },
          { label: "SCO plots", slug: "invest-sco-plot", apiKey: "investmentOptions" },
        ],
      },
    ],
  },
  PLOT: {
    defaultFilters: ["plot-land-res", "agri-farm-land", "commercial-land-inst-land", "agricultural-farm-land", "industrial-lands-plots"],
    propertyCategorySlugs: ["residential", "commercial"],
    sections: [
      { key: "budget", title: "Budget", type: "dual-select", options: ["No min", "₹40 Lac", "₹80 Lac", "₹1 Cr", "No max"] },
      { key: "area", title: "Area", type: "dual-select", options: ["No min", "600 sq.ft", "1,200 sq.ft", "2,400 sq.ft", "1 acre", "No max"] },
      {
        key: "postedBy",
        title: "Posted by",
        type: "checkbox",
        options: [
          { label: "Owner", slug: "posted-by-owner", apiKey: "postedBy", defaultChecked: true },
          { label: "Dealer", slug: "posted-by-dealer", apiKey: "postedBy" },
          { label: "Builder", slug: "posted-by-builder", apiKey: "postedBy" },
        ],
      },
    ],
  },
  RENT: {
    defaultFilters: [...RESIDENTIAL_DEFAULTS],
    propertyCategorySlugs: ["residential"],
    sections: [
      {
        key: "budget",
        title: "Monthly rent",
        type: "dual-select",
        options: ["No min", "₹10k", "₹25k", "₹50k", "₹1L", "No max"],
      },
      {
        key: "bedrooms",
        title: "Bedrooms",
        type: "checkbox",
        options: [
          { label: "1 BHK", slug: "1", apiKey: "bedrooms" },
          { label: "2 BHK", slug: "2", apiKey: "bedrooms" },
          { label: "3 BHK", slug: "3", apiKey: "bedrooms" },
          { label: "4+ BHK", slug: "4PLUS", apiKey: "bedrooms" },
        ],
      },
      {
        key: "postedBy",
        title: "Posted by",
        type: "checkbox",
        options: [
          { label: "Owner", slug: "posted-by-owner", apiKey: "postedBy", defaultChecked: true },
          { label: "Dealer", slug: "posted-by-dealer", apiKey: "postedBy" },
          { label: "Builder", slug: "posted-by-builder", apiKey: "postedBy" },
        ],
      },
      {
        key: "furnishing",
        title: "Furnishing",
        type: "checkbox",
        options: [
          { label: "Unfurnished", slug: "unfurnished", apiKey: "furnishing" },
          { label: "Semi-furnished", slug: "semi-furnished", apiKey: "furnishing" },
          { label: "Fully furnished", slug: "furnished", apiKey: "furnishing" },
        ],
      },
    ],
  },
  PG: {
    defaultFilters: [],
    propertyCategorySlugs: ["pg"],
    sections: [
      {
        key: "budget",
        title: "Rent (per month)",
        type: "dual-select",
        options: ["No min", "₹3k", "₹7k", "₹12k", "₹20k", "No max"],
      },
      {
        key: "occupancy",
        title: "Occupancy type",
        type: "checkbox",
        options: [
          { label: "Single sharing", slug: "occupancy-single", apiKey: "occupancy", defaultChecked: true },
          { label: "Double sharing", slug: "occupancy-double", apiKey: "occupancy", defaultChecked: true },
          { label: "Triple sharing", slug: "occupancy-triple", apiKey: "occupancy" },
          { label: "Dorm / Co-living", slug: "occupancy-dorm", apiKey: "occupancy" },
        ],
      },
      {
        key: "amenities",
        title: "Amenities",
        type: "checkbox",
        options: [
          { label: "AC rooms", slug: "amenity-ac", apiKey: "amenities" },
          { label: "Wi-Fi", slug: "amenity-wifi", apiKey: "amenities", defaultChecked: true },
          { label: "Attached washroom", slug: "amenity-washroom", apiKey: "amenities" },
        ],
      },
    ],
  },
};

export const similarProperties = [
  {
    id: "prop-1",
    title: "Sri Mariyaman Nagar",
    subtitle: "Commercial plot / Land for sale in Tirupattur, Vellore • RERA",
    price: "₹40 Lac",
    area: "3,200 sqft (₹1,250/sqft)",
    age: "1mo ago",
    owner: "Owner",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "prop-2",
    title: "Tirupattur, Vellore",
    subtitle: "Farm / Agricultural land for sale in Tirupattur, Vellore",
    price: "₹2.45 Cr",
    area: "1,52,460 sqft (₹161/sqft)",
    age: "3mo ago",
    owner: "Owner",
    image: "https://images.unsplash.com/photo-1505693415763-3ed5e04ba4cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "prop-3",
    title: "Land on the tirupattur-alangayam highway",
    subtitle: "Commercial plot / Land for sale in Madapalli, Vellore",
    price: "₹1.69 Cr",
    area: "3,488 sqft (₹4,833/sqft)",
    age: "3mo ago",
    owner: "Owner",
    image: "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "prop-4",
    title: "Ponerri",
    subtitle: "Commercial plot / Land for sale in Jolapettai, Vellore",
    price: "₹98.98 Lac",
    area: "1,188 sqft (₹8,331/sqft)",
    age: "7mo ago",
    owner: "Owner",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
  },
];
