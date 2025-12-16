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
  { name: "Farmhouse", slug: "farmhouse", propertyTypeSlug: "residential", apiKey: "propertySubType" },
  { name: "Other", slug: "residential-other", propertyTypeSlug: "residential", apiKey: "propertySubType" },

  // Commercial
  { name: "Office", slug: "office", propertyTypeSlug: "commercial", apiKey: "propertySubType" },
  { name: "Retail", slug: "retail", propertyTypeSlug: "commercial", apiKey: "propertySubType" },
  { name: "Plot / Land", slug: "plot-land-com", propertyTypeSlug: "commercial", apiKey: "propertySubType" },
  { name: "Storage", slug: "storage", propertyTypeSlug: "commercial", apiKey: "propertySubType" },
  { name: "Industry", slug: "industry", propertyTypeSlug: "commercial", apiKey: "propertySubType" },
  { name: "Hospitality", slug: "hospitality", propertyTypeSlug: "commercial", apiKey: "propertySubType" },
  { name: "Other", slug: "commercial-other", propertyTypeSlug: "commercial", apiKey: "propertySubType" },

  // PG
  { name: "Private Room", slug: "pg-private-room", propertyTypeSlug: "pg", apiKey: "propertySubType" },
  { name: "Shared Room", slug: "pg-shared-room", propertyTypeSlug: "pg", apiKey: "propertySubType" },
  { name: "Bed / Dormitory", slug: "pg-bed", propertyTypeSlug: "pg", apiKey: "propertySubType" },
];

export const listingFilterConfigs: Record<ListingType, ListingFilterConfig> = {
  SELL: {
    defaultFilters: [],
    propertyCategorySlugs: ["residential", "commercial"],
    sections: [
      { key: "budget", title: "Budget", type: "dual-select", options: ["No min", "₹40 Lac", "₹80 Lac", "₹1 Cr", "No max"] },
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
    defaultFilters: [],
    propertyCategorySlugs: ["residential", "commercial"],
    sections: [
      {
        key: "budget",
        title: "Monthly rent",
        type: "dual-select",
        options: ["No min", "₹10k", "₹25k", "₹50k", "₹1L", "No max"],
      },
      {
        key: "amenities",
        title: "Preferences",
        type: "checkbox",
        options: [
          { label: "Furnished", slug: "amenity-furnished", apiKey: "amenities" },
          { label: "With parking", slug: "amenity-parking", apiKey: "amenities", defaultChecked: true },
          { label: "Pet friendly", slug: "amenity-pet-friendly", apiKey: "amenities" },
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
