// config/basicDetailsStep.ts

import { StepConfig } from "./types";

export const basicDetailsStep: StepConfig = {
  id: "basic_details",
  title: "Basic Details",
  sections: [
    {
      id: "primary",
      title: "Basic Details",
      fields: [
        // 1) I'm looking to → ListingType enum
        {
          id: "listingType",
          label: "I'm looking to",
          type: "chip-radio",
          required: true,
          options: [
            { value: "SELL", label: "Sell", icon: "sell" }, // ListingType.SELL
            { value: "RENT", label: "Rent / Lease", icon: "rent" }, // ListingType.RENT
            { value: "PG", label: "PG", icon: "bed" }, // ListingType.PG
          ],
        },

        // 2) Property usage → high-level type
        {
          id: "propertyUsage",
          label: "What kind of property do you have?",
          type: "chip-radio",
          required: true,
          options: [
            { value: "residential", label: "Residential", icon: "home" },
            {
              value: "commercial",
              label: "Commercial",
              icon: "office-building",
            },
            { value: "pg", label: "PG / Hostel", icon: "hostel" },
          ],
        },

        // ============================================================
        // RESIDENTIAL
        // ============================================================

        {
          id: "residentialTypeSellRent",
          label: "What kind of property do you have?",
          type: "chip-radio",
          visibleWhen: {
            and: [
              { field: "propertyUsage", equals: "residential" },
              { field: "listingType", in: ["SELL", "RENT"] },
            ],
          },
          options: [
            { value: "apartment", label: "Apartment", icon: "apartment" },
            {
              value: "independent-house-villa",
              label: "Independent House / Villa",
              icon: "villa",
            },
            {
              value: "independent-builder-floor",
              label: "Independent / Builder Floor",
              icon: "floor",
            },
            {
              value: "plot-land-res",
              label: "Plot / Land",
              icon: "plot",
            },
            {
              value: "1rk-studio-apartment",
              label: "1 RK / Studio Apartment",
              icon: "studio",
            },
            {
              value: "serviced-apartment",
              label: "Serviced Apartment",
              icon: "service-apartment",
            },
            {
              value: "farmhouse",
              label: "Farmhouse",
              icon: "farm",
            },
            {
              value: "residential-other",
              label: "Other",
              icon: "dots",
            },
          ],
        },

        // ============================================================
        // PG / HOSTEL
        // ============================================================

        {
          id: "pgType",
          label: "What kind of PG / Hostel do you have?",
          type: "chip-radio",
          visibleWhen: { field: "propertyUsage", equals: "pg" },
          options: [
            {
              value: "pg-private-room",
              label: "Private Room",
              icon: "user",
            },
            {
              value: "pg-shared-room",
              label: "Shared Room",
              icon: "users",
            },
            {
              value: "pg-bed",
              label: "Bed / Dormitory",
              icon: "bed-bunk",
            },
          ],
        },

        // ============================================================
        // COMMERCIAL
        // ============================================================

        {
          id: "commercialKind",
          label: "What kind of property do you have?",
          type: "chip-radio",
          visibleWhen: { field: "propertyUsage", equals: "commercial" },
          options: [
            { value: "office", label: "Office", icon: "briefcase" },
            { value: "retail", label: "Retail", icon: "store" },
            { value: "plot-land-com", label: "Plot / Land", icon: "map" },
            { value: "storage", label: "Storage", icon: "warehouse" },
            { value: "industry", label: "Industry", icon: "factory" },
            { value: "hospitality", label: "Hospitality", icon: "hotel" },
            { value: "commercial-other", label: "Other", icon: "dots" },
          ],
        },

        // Office sub-category
        {
          id: "officeType",
          label: "What kind of office is it?",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "office" },
          options: [
            {
              value: "ready-to-move-office-space",
              label: "Ready to move office space",
              icon: "office-ready",
            },
            {
              value: "bare-shell-office-space",
              label: "Bare shell office space",
              icon: "office-bare",
            },
            {
              value: "co-working-office-space",
              label: "Co-working office space",
              icon: "coworking",
            },
          ],
        },

        // Retail sub-category
        {
          id: "retailType",
          label: "What type of retail space do you have?",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "retail" },
          options: [
            {
              value: "commercial-shops",
              label: "Commercial Shops",
              icon: "shop",
            },
            {
              value: "commercial-showrooms",
              label: "Commercial Showrooms",
              icon: "showroom",
            },
          ],
        },

        // Retail located inside
        {
          id: "locatedInside",
          label: "Your shop is located inside",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "retail" },
          options: [
            { value: "mall", label: "Mall", icon: "mall" },
            {
              value: "commercial-project",
              label: "Commercial Project",
              icon: "project",
            },
            {
              value: "retail-complex-building",
              label: "Retail Complex/Building",
              icon: "building-retail",
            },
            {
              value: "market-high-street",
              label: "Market / High Street",
              icon: "market",
            },
            { value: "it-park", label: "IT Park", icon: "it-park" },
            {
              value: "business-park",
              label: "Business Park",
              icon: "business-park",
            },
            {
              value: "business-center",
              label: "Business Center",
              icon: "business-center",
            },
            {
              value: "corporate-tower",
              label: "Corporate Tower",
              icon: "tower",
            },
            {
              value: "commercial-complex",
              label: "Commercial Complex",
              icon: "complex",
            },
            { value: "others", label: "Others", icon: "dots" },
          ],
        },

        // Commercial land
        {
          id: "commercialLandType",
          label: "What kind of plot / land is it?",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "plot-land-com" },
          options: [
            {
              value: "commercial-land-inst-land",
              label: "Commercial Land / Inst. Land",
              icon: "plot-commercial",
            },
            {
              value: "agricultural-farm-land",
              label: "Agricultural / Farm Land",
              icon: "farm-land",
            },
            {
              value: "industrial-lands-plots",
              label: "Industrial Lands / Plots",
              icon: "industry-plot",
            },
          ],
        },

        // Storage
        {
          id: "storageType",
          label: "What kind of storage is it?",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "storage" },
          options: [
            { value: "warehouse", label: "Warehouse", icon: "warehouse" },
            { value: "cold-storage", label: "Cold Storage", icon: "snowflake" },
            { value: "godown", label: "Godown", icon: "storage-unit" },
          ],
        },

        // Industry
        {
          id: "industryType",
          label: "What kind of industry is it?",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "industry" },
          options: [
            { value: "factory", label: "Factory", icon: "factory" },
            { value: "manufacturing", label: "Manufacturing", icon: "cog" },
          ],
        },

        // Hospitality
        {
          id: "hospitalityType",
          label: "What kind of hospitality is it?",
          type: "chip-radio",
          visibleWhen: { field: "commercialKind", equals: "hospitality" },
          options: [
            { value: "hotel-resorts", label: "Hotel / Resorts", icon: "hotel" },
            {
              value: "guest-house-banquet-halls",
              label: "Guest-House / Banquet-Halls",
              icon: "banquet",
            },
          ],
        },
      ],
    },
  ],
};
