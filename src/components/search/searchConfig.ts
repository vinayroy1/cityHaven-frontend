/**
 * Declarative config for the property-search filter UI.
 */
import {
  propertySubTypes,
  commercialPropertyCategories,
} from "@/app/propertySearch/data";
import type { IntentKey, SearchState } from "./searchQuery";
import { PLOT_SUBTYPE_SLUGS } from "./searchQuery";

export type SortOption = { value: "relevance" | "newest" | "price_asc" | "price_desc"; label: string };

export const SORT_OPTIONS: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FURNISHED", label: "Furnished" },
];

export const POSTED_BY_OPTIONS = [
  { value: "OWNER", label: "Owners" },
  { value: "AGENT", label: "Partner Agents" },
  { value: "BUILDER", label: "Builders" },
];

export const POSSESSION_STATUS_OPTIONS = [
  { value: "READY_TO_MOVE", label: "Ready To Move" },
  { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
];

export const GATED_COMMUNITY_OPTIONS = [
  { value: "YES", label: "Gated Community" },
];

export const AMENITIES_OPTIONS = [
  { value: "SECURITY", label: "24 x 7 Security" },
  { value: "POWER_BACKUP", label: "Power Backup" },
  { value: "SWIMMING_POOL", label: "Swimming Pool" },
  { value: "MARKET", label: "Attached Market" },
  { value: "CLUBHOUSE", label: "Clubhouse" },
  { value: "PARKING", label: "Visitor's Parking" },
  { value: "CENTRAL_AC", label: "Central AC" },
  { value: "INTERCOM", label: "Intercom" },
];

export const FOOD_OPTIONS = [
  { value: "INCLUDED", label: "Meals Included in Rent" },
  { value: "OPTIONAL_MESS", label: "Optional Mess / Tiffin" },
  { value: "SELF_COOKING", label: "Self Cooking / Kitchen" },
  { value: "NO_FOOD", label: "Outside Food / Tiffin" },
];

export const BHK_OPTIONS = [
  { value: "1 RK", label: "1 RK" },
  { value: "Studio", label: "Studio" },
  { value: "1 BHK", label: "1 BHK" },
  { value: "1.5 BHK", label: "1.5 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "2.5 BHK", label: "2.5 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "3.5 BHK", label: "3.5 BHK" },
  { value: "4 BHK", label: "4 BHK" },
  { value: "5 BHK", label: "5 BHK" },
  { value: "6 BHK", label: "6 BHK" },
  { value: "6+ BHK", label: "6+ BHK" },
];

export const BATH_OPTIONS = [
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

export const FLATMATE_MODE_OPTIONS = [
  { value: "HAVE_ROOM", label: "Room Available" },
  { value: "NEED_ROOM", label: "Looking for Room" },
  { value: "BUDDY_UP", label: "Buddy Up (Team)" },
];

export const FLATMATE_ROOM_TYPE_OPTIONS = [
  { value: "Private Room", label: "Private Room" },
  { value: "Shared Room (Twin)", label: "Shared Room" },
  { value: "Whole Flat", label: "Whole Flat" },
];

export const FLATMATE_GENDER_OPTIONS = [
  { value: "Female Only", label: "Female Only" },
  { value: "Male Only", label: "Male Only" },
  { value: "Any Gender", label: "Any Gender" },
];

export const FLATMATE_DIET_OPTIONS = [
  { value: "Pure Vegetarian", label: "Pure Vegetarian" },
  { value: "Vegetarian & Eggetarian", label: "Veg & Egg" },
  { value: "Non-Vegetarian", label: "Non-Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "Any Diet", label: "Any Diet" },
];

export const FLATMATE_LIFESTYLE_OPTIONS = [
  { value: "PET_FRIENDLY", label: "Pet-friendly" },
  { value: "NON_SMOKER", label: "Non-smoker" },
  { value: "SMOKING_ALLOWED", label: "Smoking Allowed" },
  { value: "DRINKING_ALLOWED", label: "Drinking Allowed" },
];

export const FLATMATE_BHK_OPTIONS = [
  { value: "1 BHK", label: "1 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "4+ BHK", label: "4+ BHK" },
];

export const FLATMATE_FURNISHING_OPTIONS = [
  { value: "Fully Furnished", label: "Fully Furnished" },
  { value: "Semi-furnished", label: "Semi-furnished" },
  { value: "Unfurnished", label: "Unfurnished" },
];

const L = 100_000;
const CR = 10_000_000;

export const BUDGET_PRESETS: Record<IntentKey, number[]> = {
  BUY: [10 * L, 20 * L, 30 * L, 50 * L, 75 * L, 1 * CR, 1.5 * CR, 2 * CR, 3 * CR, 5 * CR, 10 * CR],
  RENT: [5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000, 50_000, 75_000, 1 * L],
  PG: [3_000, 5_000, 7_000, 10_000, 12_000, 15_000, 20_000, 25_000],
  FLATMATE: [3_000, 5_000, 7_000, 10_000, 15_000, 20_000, 25_000, 35_000, 50_000, 75_000, 100_000],
  COMMERCIAL: [25 * L, 50 * L, 1 * CR, 2 * CR, 5 * CR, 10 * CR, 25 * CR, 50 * CR],
  PLOT: [10 * L, 25 * L, 50 * L, 1 * CR, 2 * CR, 5 * CR, 10 * CR, 20 * CR],
};

export const AREA_PRESETS = [200, 500, 1_000, 1_500, 2_000, 3_000, 5_000, 10_000, 20_000];

export function formatMoney(v: number): string {
  if (v >= CR) return `₹${Number((v / CR).toFixed(2))} Cr`;
  if (v >= L) return `₹${Number((v / L).toFixed(2))} L`;
  if (v >= 1_000) return `₹${Number((v / 1_000).toFixed(1))}k`;
  return `₹${v}`;
}

export function budgetConfig(state: Pick<SearchState, "intent" | "transaction">) {
  const monthly = state.intent === "RENT" || state.intent === "PG" || state.intent === "FLATMATE" || (state.intent === "COMMERCIAL" && state.transaction === "RENT");
  const presets = state.intent === "COMMERCIAL" && monthly
    ? [5_000, 10_000, 20_000, 30_000, 50_000, 75_000, 100_000, 150_000, 200_000, 300_000, 500_000, 1_000_000]
    : BUDGET_PRESETS[state.intent];
  const label = state.intent === "PG" ? "PG budget / month" : state.intent === "FLATMATE" ? "Flatmate budget / month" : monthly ? "Monthly rent" : state.intent === "COMMERCIAL" ? "Commercial purchase budget" : state.intent === "PLOT" ? "Plot purchase budget" : "Purchase budget";
  const format = (value: number) => monthly ? `₹${value.toLocaleString("en-IN")}` : formatMoney(value);
  return { monthly, presets, label, format };
}

type SubTypeOption = { slug: string; label: string };

const subTypesByPropertySlug = (slugs: string[]): SubTypeOption[] =>
  propertySubTypes
    .filter((s) => slugs.includes(s.propertyTypeSlug))
    .map((s) => ({ slug: s.slug, label: s.name }));

const RESIDENTIAL_SUBTYPES = subTypesByPropertySlug(["residential"]).filter(
  (s) => !PLOT_SUBTYPE_SLUGS.includes(s.slug) && s.slug !== "residential-other",
);

const COMMERCIAL_SUBTYPES = subTypesByPropertySlug(
  commercialPropertyCategories.map((c) => c.slug),
).filter((s) => !PLOT_SUBTYPE_SLUGS.includes(s.slug));

const SUBTYPE_ID_BY_SLUG: Record<string, number> = propertySubTypes.reduce(
  (acc, s, i) => {
    acc[s.slug] = i + 1;
    return acc;
  },
  {} as Record<string, number>,
);

export const subTypeSlugToId = (slug: string): number | undefined => SUBTYPE_ID_BY_SLUG[slug];

export type FilterSection =
  | {
      key: "budget";
      title: string;
      kind: "range";
      server: true;
      stateKeys: ["priceMin", "priceMax"];
    }
  | {
      key: "area";
      title: string;
      kind: "range";
      server: false;
      stateKeys: ["areaMin", "areaMax"];
    }
  | {
      key: "bathrooms";
      title: string;
      kind: "min-chips";
      server: false;
      options: { value: number; label: string }[];
    }
  | {
      key:
        | "subType"
        | "furnishing"
        | "postedAs"
        | "possessionStatus"
        | "gatedCommunity"
        | "amenities"
        | "bhkTypes"
        | "food"
        | "flatmateMode"
        | "roomType"
        | "gender"
        | "diet"
        | "lifestyle";
      title: string;
      kind: "multi-chips";
      server: false;
      hint?: string;
      options: { value: string; label: string }[];
    };

export function filterSectionsFor(intent: IntentKey): FilterSection[] {
  // Flatmate has specialized roommate & shared living filters
  if (intent === "FLATMATE") {
    return [
      { key: "budget", title: "Monthly Rent / Budget", kind: "range", server: true, stateKeys: ["priceMin", "priceMax"] },
      { key: "flatmateMode", title: "Looking For / Mode", kind: "multi-chips", server: false, options: FLATMATE_MODE_OPTIONS },
      { key: "roomType", title: "Room Type", kind: "multi-chips", server: false, options: FLATMATE_ROOM_TYPE_OPTIONS },
      { key: "gender", title: "Preferred Gender", kind: "multi-chips", server: false, options: FLATMATE_GENDER_OPTIONS },
      { key: "diet", title: "Dietary Preference", kind: "multi-chips", server: false, options: FLATMATE_DIET_OPTIONS },
      { key: "lifestyle", title: "House Rules & Lifestyle", kind: "multi-chips", server: false, options: FLATMATE_LIFESTYLE_OPTIONS },
      { key: "bhkTypes", title: "Bedrooms (BHK)", kind: "multi-chips", server: false, options: FLATMATE_BHK_OPTIONS },
      { key: "furnishing", title: "Furnishing Status", kind: "multi-chips", server: false, options: FLATMATE_FURNISHING_OPTIONS },
    ];
  }

  const sections: FilterSection[] = [
    { key: "budget", title: "Budget", kind: "range", server: true, stateKeys: ["priceMin", "priceMax"] },
    {
      key: "area",
      title: intent === "PLOT" ? "Plot Area / Size (sq.ft)" : "Size / Area (sq.ft)",
      kind: "range",
      server: false,
      stateKeys: ["areaMin", "areaMax"],
    },
  ];

  const isResidential = intent === "BUY" || intent === "RENT";

  // Property Type / Accommodation Type
  const isSharedLiving = intent === "PG";
  const opts = intent === "PLOT" ? propertySubTypes.filter((s) => PLOT_SUBTYPE_SLUGS.includes(s.slug)).map((s) => ({ slug: s.slug, label: s.name })) : isSharedLiving ? subTypesByPropertySlug(["pg"]) : intent === "COMMERCIAL" ? COMMERCIAL_SUBTYPES : RESIDENTIAL_SUBTYPES;
  if (opts.length) {
    sections.push({
      key: "subType",
      title: isSharedLiving ? "Accommodation Type" : intent === "PLOT" ? "Land Use" : "Property Type",
      kind: "multi-chips",
      server: false,
      options: opts.map((o) => ({ value: o.slug, label: o.label })),
    });
  }

  // Food & Mess Policy (PG / Co-living only)
  if (isSharedLiving) {
    sections.push({
      key: "food",
      title: "Food & Mess",
      kind: "multi-chips",
      server: false,
      options: FOOD_OPTIONS,
    });
  }

  // Bedrooms / BHK
  if (isResidential) {
    sections.push({
      key: "bhkTypes",
      title: "Bedrooms",
      kind: "multi-chips",
      server: false,
      options: BHK_OPTIONS,
    });
  }

  // Furnishing
  if (isResidential || isSharedLiving) {
    sections.push({
      key: "furnishing",
      title: "Furnishing Status",
      kind: "multi-chips",
      server: false,
      options: FURNISHING_OPTIONS,
    });
  }

  // Possession Status
  if (isResidential || intent === "COMMERCIAL") {
    sections.push({
      key: "possessionStatus",
      title: "Possession Status",
      kind: "multi-chips",
      server: false,
      options: POSSESSION_STATUS_OPTIONS,
    });
  }

  // Gated Community
  if (isResidential) {
    sections.push({
      key: "gatedCommunity",
      title: "Gated Communities",
      kind: "multi-chips",
      server: false,
      options: GATED_COMMUNITY_OPTIONS,
    });
  }

  // Bathrooms
  if (isResidential) {
    sections.push({
      key: "bathrooms",
      title: "Bathrooms",
      kind: "min-chips",
      server: false,
      options: BATH_OPTIONS,
    });
  }

  // Posted By
  sections.push({
    key: "postedAs",
    title: "Posted By",
    kind: "multi-chips",
    server: false,
    options: POSTED_BY_OPTIONS,
  });

  // Amenities
  if (isResidential || intent === "COMMERCIAL" || isSharedLiving) {
    sections.push({
      key: "amenities",
      title: "Amenities",
      kind: "multi-chips",
      server: false,
      options: AMENITIES_OPTIONS,
    });
  }

  return sections;
}

export const CLIENT_REFINE_HINT =
  "Filters are applied instantly in your browser as results load.";
