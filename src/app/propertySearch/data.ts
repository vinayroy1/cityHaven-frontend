/**
 * Static catalogs for the property-search UI.
 *
 * `propertySubTypes` / `commercialPropertyCategories` feed the search filter
 * config (`src/components/search/searchConfig.ts`). `similarProperties` is demo
 * content for the property-details page.
 */

export const commercialPropertyCategories = [
  { name: "Office space", slug: "office" },
  { name: "Retail", slug: "retail" },
  { name: "Commercial / Inst. land", slug: "plot-land-com" },
  { name: "Storage / Logistics", slug: "storage" },
  { name: "Industry", slug: "industry" },
  { name: "Hospitality", slug: "hospitality" },
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

  // Commercial
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
