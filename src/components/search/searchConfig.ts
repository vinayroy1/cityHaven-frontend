/**
 * Declarative config for the property-search filter UI. Add a filter by adding a
 * section here — the renderer (`FilterSheet`) and quick chips read from this.
 *
 * `server: true`  -> the value is sent to the backend (`toApiParams`).
 * `server: false` -> the value is applied client-side (`applyClientRefinements`).
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
  { value: "FURNISHED", label: "Fully furnished" },
];

export const POSTED_BY_OPTIONS = [
  { value: "OWNER", label: "Owner" },
  { value: "AGENT", label: "Agent" },
  { value: "BUILDER", label: "Builder" },
];

const BHK_OPTIONS = [
  { value: 1, label: "1+ BHK" },
  { value: 2, label: "2+ BHK" },
  { value: 3, label: "3+ BHK" },
  { value: 4, label: "4+ BHK" },
  { value: 5, label: "5+ BHK" },
];

const BATH_OPTIONS = [
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

const L = 100_000;
const CR = 10_000_000;

/** Budget preset stops (₹) per intent — used for the min/max dropdowns. */
export const BUDGET_PRESETS: Record<IntentKey, number[]> = {
  BUY: [10 * L, 20 * L, 30 * L, 50 * L, 75 * L, 1 * CR, 1.5 * CR, 2 * CR, 3 * CR, 5 * CR, 10 * CR],
  RENT: [5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000, 50_000, 75_000, 1 * L],
  PG: [3_000, 5_000, 7_000, 10_000, 12_000, 15_000, 20_000, 25_000],
  COMMERCIAL: [25 * L, 50 * L, 1 * CR, 2 * CR, 5 * CR, 10 * CR, 25 * CR, 50 * CR],
  PLOT: [10 * L, 25 * L, 50 * L, 1 * CR, 2 * CR, 5 * CR, 10 * CR, 20 * CR],
};

/** Area preset stops (sq.ft) for the built-up / plot-area dropdowns. */
export const AREA_PRESETS = [200, 500, 1_000, 1_500, 2_000, 3_000, 5_000, 10_000, 20_000];

export function formatMoney(v: number): string {
  if (v >= CR) return `₹${Number((v / CR).toFixed(2))} Cr`;
  if (v >= L) return `₹${Number((v / L).toFixed(2))} L`;
  if (v >= 1_000) return `₹${Number((v / 1_000).toFixed(1))}k`;
  return `₹${v}`;
}

export function budgetConfig(state: Pick<SearchState, "intent" | "transaction">) {
  const monthly = state.intent === "RENT" || state.intent === "PG" || (state.intent === "COMMERCIAL" && state.transaction === "RENT");
  const presets = state.intent === "COMMERCIAL" && monthly
    ? [5_000, 10_000, 20_000, 30_000, 50_000, 75_000, 100_000, 150_000, 200_000, 300_000, 500_000, 1_000_000]
    : BUDGET_PRESETS[state.intent];
  const label = state.intent === "PG" ? "PG budget / month" : monthly ? "Monthly rent" : state.intent === "COMMERCIAL" ? "Commercial purchase budget" : state.intent === "PLOT" ? "Plot purchase budget" : "Purchase budget";
  const format = (value: number) => monthly ? `₹${value.toLocaleString("en-IN")}` : formatMoney(value);
  return { monthly, presets, label, format };
}

// --- sub-type option lists -------------------------------------------

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

/** slug -> backend propertySubTypeId. The catalog order matches the backend
 * seed (apartment = 1, independent-house-villa = 2, …). */
const SUBTYPE_ID_BY_SLUG: Record<string, number> = propertySubTypes.reduce(
  (acc, s, i) => {
    acc[s.slug] = i + 1;
    return acc;
  },
  {} as Record<string, number>,
);

export const subTypeSlugToId = (slug: string): number | undefined => SUBTYPE_ID_BY_SLUG[slug];

// --- sections -------------------------------------------------------

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
      key: "bedrooms";
      title: string;
      kind: "min-chips";
      server: true;
      options: { value: number; label: string }[];
    }
  | {
      key: "bathrooms";
      title: string;
      kind: "min-chips";
      server: false;
      options: { value: number; label: string }[];
    }
  | {
      key: "subType" | "furnishing" | "postedAs";
      title: string;
      kind: "multi-chips";
      server: false;
      hint?: string;
      options: { value: string; label: string }[];
    };

export function filterSectionsFor(intent: IntentKey): FilterSection[] {
  const sections: FilterSection[] = [
    { key: "budget", title: "Budget", kind: "range", server: true, stateKeys: ["priceMin", "priceMax"] },
  ];

  const isResidential = intent === "BUY" || intent === "RENT";

  if (isResidential) {
    sections.push({
      key: "bedrooms",
      title: "Bedrooms",
      kind: "min-chips",
      server: true,
      options: BHK_OPTIONS,
    });
  }

  if (intent === "COMMERCIAL" || intent === "PLOT") {
    sections.push({
      key: "area",
      title: intent === "PLOT" ? "Plot area (sq.ft)" : "Built-up area (sq.ft)",
      kind: "range",
      server: false,
      stateKeys: ["areaMin", "areaMax"],
    });
  }

  {
    const opts = intent === "PLOT" ? propertySubTypes.filter((s) => PLOT_SUBTYPE_SLUGS.includes(s.slug)).map((s) => ({ slug: s.slug, label: s.name })) : intent === "PG" ? subTypesByPropertySlug(["pg"]) : intent === "COMMERCIAL" ? COMMERCIAL_SUBTYPES : RESIDENTIAL_SUBTYPES;
    if (opts.length) {
      sections.push({
        key: "subType",
        title: intent === "PG" ? "Accommodation" : intent === "PLOT" ? "Land use" : "Property type",
        kind: "multi-chips",
        server: false,
        options: opts.map((o) => ({ value: o.slug, label: o.label })),
      });
    }
  }

  if (isResidential || intent === "PG") {
    sections.push({
      key: "furnishing",
      title: "Furnishing",
      kind: "multi-chips",
      server: false,
      options: FURNISHING_OPTIONS,
    });
  }

  if (isResidential) {
    sections.push({
      key: "bathrooms",
      title: "Bathrooms",
      kind: "min-chips",
      server: false,
      options: BATH_OPTIONS,
    });
  }

  sections.push({
    key: "postedAs",
    title: "Posted by",
    kind: "multi-chips",
    server: false,
    options: POSTED_BY_OPTIONS,
  });

  return sections;
}

export const CLIENT_REFINE_HINT =
  "Marked filters are applied instantly in your browser as results load.";
