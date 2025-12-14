import type { ListingType } from "../homePage/components/HeroSearch";

type CheckboxOption = { label: string; defaultChecked?: boolean };
type FilterSection =
  | { key: string; title: string; type: "dual-select"; options: string[] }
  | { key: string; title: string; type: "checkbox"; options: CheckboxOption[] };

export type ListingFilterConfig = {
  appliedFilters: string[];
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
];

export const listingFilterConfigs: Record<ListingType, ListingFilterConfig> = {
  SELL: {
    appliedFilters: ["Agricultural/Farm Land", "Industrial Lands/Plots", "Commercial Land/Inst. Land", "T.N.H.B.Phase-1"],
    propertyCategorySlugs: ["residential", "commercial"],
    sections: [
      { key: "budget", title: "Budget", type: "dual-select", options: ["No min", "₹40 Lac", "₹80 Lac", "₹1 Cr", "No max"] },
      {
        key: "postedBy",
        title: "Posted by",
        type: "checkbox",
        options: [{ label: "Owner", defaultChecked: true }, { label: "Dealer" }, { label: "Builder" }],
      },
    ],
  },
  RENT: {
    appliedFilters: ["Near metro", "Furnished", "Parking available"],
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
        options: [{ label: "Furnished" }, { label: "With parking", defaultChecked: true }, { label: "Pet friendly" }],
      },
    ],
  },
  PG: {
    appliedFilters: ["Meals included", "Near college", "Female only"],
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
          { label: "Single sharing", defaultChecked: true },
          { label: "Double sharing", defaultChecked: true },
          { label: "Triple sharing" },
          { label: "Dorm / Co-living" },
        ],
      },
      {
        key: "amenities",
        title: "Amenities",
        type: "checkbox",
        options: [{ label: "AC rooms" }, { label: "Wi-Fi", defaultChecked: true }, { label: "Attached washroom" }],
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
