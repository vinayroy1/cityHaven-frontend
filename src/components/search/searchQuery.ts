/**
 * Single source of truth for property-search state <-> URL <-> API params.
 *
 * The backend `GET /v1/propertyListing/search` has STRICT validation and 400s on
 * any unknown query key. It only understands:
 *   q, cityId, listingType (SELL|RENT|PG), bedrooms (min), priceMin, priceMax,
 *   sort, page/cursor, pageSize
 * Everything else the UI offers (sub-type, furnishing, posted-by, bathrooms,
 * area, res/com, plot-only) is refined client-side after fetching — its URL keys
 * are namespaced `r.*` so they can never leak into `toApiParams`.
 */

export type LocalityTag = {
  label: string;
  placeId?: string;
  city?: string;
  locality?: string;
};

export type IntentKey = "BUY" | "RENT" | "PG" | "COMMERCIAL" | "PLOT";
export type SortKey = "relevance" | "newest" | "price_asc" | "price_desc";
export type ApiListingType = "SELL" | "RENT" | "PG";

export type RefineState = {
  subType: string[]; // property sub-type slugs
  furnishing: string[]; // UNFURNISHED | SEMI_FURNISHED | FURNISHED
  postedAs: string[]; // OWNER | AGENT | BUILDER
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
};

export type SearchState = {
  q: string; // free keyword (project / builder / landmark)
  cityName?: string; // structured city filter, kept separate from keyword relevance
  localities: LocalityTag[]; // structured location chips
  intent: IntentKey;
  transaction?: "SELL" | "RENT";
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  sort: SortKey;
  refine: RefineState;
};

export const INTENT_CONFIG: Record<
  IntentKey,
  { label: string; listingType: ApiListingType; resCom?: "COMMERCIAL"; plotOnly?: boolean }
> = {
  BUY: { label: "Buy", listingType: "SELL" },
  RENT: { label: "Rent", listingType: "RENT" },
  PG: { label: "PG / Co-living", listingType: "PG" },
  COMMERCIAL: { label: "Commercial", listingType: "SELL", resCom: "COMMERCIAL" },
  PLOT: { label: "Plot / Land", listingType: "SELL", plotOnly: true },
};

export const INTENT_KEYS = Object.keys(INTENT_CONFIG) as IntentKey[];

/** Sub-type slugs that count as "plot / land" for the PLOT intent. */
export const PLOT_SUBTYPE_SLUGS = [
  "plot-land-res",
  "agri-farm-land",
  "commercial-land-inst-land",
  "agricultural-farm-land",
  "industrial-lands-plots",
];

const SORT_KEYS: SortKey[] = ["relevance", "newest", "price_asc", "price_desc"];

const emptyRefine = (): RefineState => ({
  subType: [],
  furnishing: [],
  postedAs: [],
});

export const initialSearchState = (): SearchState => ({
  q: "",
  localities: [],
  intent: "BUY",
  sort: "relevance",
  refine: emptyRefine(),
});

// --- helpers ---------------------------------------------------------------

const toNum = (v: string | null): number | undefined => {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const splitList = (v: string | null): string[] =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

/** Map a legacy `listingType=` value (old links) to an intent. */
const legacyListingTypeToIntent = (v: string): IntentKey | undefined => {
  switch (v.toUpperCase()) {
    case "SELL":
      return "BUY";
    case "RENT":
      return "RENT";
    case "PG":
      return "PG";
    case "COMMERCIAL":
      return "COMMERCIAL";
    case "PLOT":
      return "PLOT";
    default:
      return undefined;
  }
};

// --- parse ---------------------------------------------------------------

export function parseSearchParams(sp: URLSearchParams): SearchState {
  const state = initialSearchState();

  state.q = sp.get("q")?.trim() ?? "";
  state.cityName = sp.get("city")?.trim() || undefined;

  state.localities = sp
    .getAll("loc")
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ label }));

  const intentParam = sp.get("intent");
  if (intentParam && INTENT_KEYS.includes(intentParam as IntentKey)) {
    state.intent = intentParam as IntentKey;
  } else {
    const legacy = sp.get("listingType");
    if (legacy) state.intent = legacyListingTypeToIntent(legacy) ?? state.intent;
  }

  state.priceMin = toNum(sp.get("priceMin"));
  state.transaction = sp.get("transaction") === "RENT" ? "RENT" : "SELL";
  state.priceMax = toNum(sp.get("priceMax"));
  state.bedroomsMin = toNum(sp.get("bhk") ?? sp.get("bedrooms"));

  const sort = sp.get("sort") as SortKey | null;
  if (sort && SORT_KEYS.includes(sort)) state.sort = sort;

  state.refine = {
    subType: splitList(sp.get("r.subType")),
    furnishing: splitList(sp.get("r.furnishing")).map((s) => s.toUpperCase()),
    postedAs: splitList(sp.get("r.postedAs")).map((s) => s.toUpperCase()),
    bathroomsMin: toNum(sp.get("r.bath")),
    areaMin: toNum(sp.get("r.areaMin")),
    areaMax: toNum(sp.get("r.areaMax")),
  };

  return state;
}

// --- build (state -> URL) ----------------------------------------------

export function buildSearchParams(state: SearchState): URLSearchParams {
  const sp = new URLSearchParams();

  if (state.q) sp.set("q", state.q);
  if (state.cityName) sp.set("city", state.cityName);
  state.localities.forEach((l) => l.label && sp.append("loc", l.label));
  sp.set("intent", state.intent);
  if (state.intent === "COMMERCIAL" && state.transaction === "RENT") sp.set("transaction", "RENT");

  if (state.priceMin != null) sp.set("priceMin", String(state.priceMin));
  if (state.priceMax != null) sp.set("priceMax", String(state.priceMax));
  if (state.bedroomsMin != null) sp.set("bhk", String(state.bedroomsMin));
  if (state.sort !== "relevance") sp.set("sort", state.sort);

  const r = state.refine;
  if (r.subType.length) sp.set("r.subType", r.subType.join(","));
  if (r.furnishing.length) sp.set("r.furnishing", r.furnishing.join(","));
  if (r.postedAs.length) sp.set("r.postedAs", r.postedAs.join(","));
  if (r.bathroomsMin != null) sp.set("r.bath", String(r.bathroomsMin));
  if (r.areaMin != null) sp.set("r.areaMin", String(r.areaMin));
  if (r.areaMax != null) sp.set("r.areaMax", String(r.areaMax));

  return sp;
}

export const buildSearchHref = (state: SearchState): string =>
  `/propertySearch?${buildSearchParams(state).toString()}`;

/** The location text sent to the backend `q` (keyword + locality labels). */
export function buildQueryText(state: SearchState): string {
  return [state.q, ...state.localities.map((l) => l.label)]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

// --- API params (backend allow-list ONLY) ------------------------------

export type ApiSearchParams = {
  q?: string;
  cityName?: string;
  listingType: ApiListingType;
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: Exclude<SortKey, "relevance">;
  pageSize: number;
};

export function toApiParams(state: SearchState, pageSize: number): ApiSearchParams {
  const q = buildQueryText(state);
  const out: ApiSearchParams = {
    listingType: state.intent === "COMMERCIAL" ? state.transaction ?? "SELL" : INTENT_CONFIG[state.intent].listingType,
    pageSize,
  };
  if (q) out.q = q;
  if (state.cityName) out.cityName = state.cityName;
  if (state.bedroomsMin != null) out.bedrooms = state.bedroomsMin;
  if (state.priceMin != null) out.priceMin = state.priceMin;
  if (state.priceMax != null) out.priceMax = state.priceMax;
  if (state.sort !== "relevance") out.sort = state.sort;
  return out;
}

/** True when the state carries any filter that is only applied in the browser. */
export function hasClientRefinements(state: SearchState): boolean {
  const r = state.refine;
  return (
    r.subType.length > 0 ||
    r.furnishing.length > 0 ||
    r.postedAs.length > 0 ||
    r.bathroomsMin != null ||
    r.areaMin != null ||
    r.areaMax != null ||
    state.intent === "COMMERCIAL" ||
    state.intent === "PLOT" ||
    state.localities.length > 1
  );
}

// --- client-side refinement -------------------------------------------

export type RefinableItem = {
  resCom?: string | null;
  furnishing?: string | null;
  postedAs?: string | null;
  bathrooms?: number | null;
  carpetArea?: number | null;
  carpetAreaUnit?: string | null;
  builtUpArea?: number | null;
  builtUpAreaUnit?: string | null;
  plotArea?: number | null;
  plotAreaUnit?: string | null;
  areaUnit?: string | null;
  propertySubTypeId?: number | null;
  propertySubType?: { slug?: string | null } | null;
  cityName?: string | null;
  locality?: string | null;
  subLocality?: string | null;
};

/**
 * @param subTypeSlugToId  resolves a sub-type slug -> backend propertySubTypeId
 *                         (from the catalog in app/propertySearch/data.ts)
 */
export function applyClientRefinements<T extends RefinableItem>(
  items: T[],
  state: SearchState,
  subTypeSlugToId: (slug: string) => number | undefined,
): T[] {
  const { refine, intent } = state;
  const intentCfg = INTENT_CONFIG[intent];

  const wantedSubTypeIds = new Set(
    [
      ...refine.subType,
      ...(intent === "PLOT" && !refine.subType.length ? PLOT_SUBTYPE_SLUGS : []),
    ]
      .map(subTypeSlugToId)
      .filter((v): v is number => v != null),
  );
  const wantedSubTypeSlugs = new Set([
    ...refine.subType,
    ...(intent === "PLOT" && !refine.subType.length ? PLOT_SUBTYPE_SLUGS : []),
  ]);

  const localityNeedles = state.localities
    .map((l) => l.label.toLowerCase())
    .map((label) => label.split(",")[0].trim());

  return items.filter((item) => {
    if (intentCfg.resCom && (item.resCom ?? "").toUpperCase() !== intentCfg.resCom) {
      return false;
    }

    if (wantedSubTypeIds.size || wantedSubTypeSlugs.size) {
      const slug = item.propertySubType?.slug ?? undefined;
      const byId = item.propertySubTypeId != null && wantedSubTypeIds.has(item.propertySubTypeId);
      const bySlug = slug != null && wantedSubTypeSlugs.has(slug);
      if (!byId && !bySlug) return false;
    }

    if (refine.furnishing.length) {
      const f = (item.furnishing ?? "").toUpperCase();
      if (!refine.furnishing.includes(f)) return false;
    }

    if (refine.postedAs.length) {
      const p = (item.postedAs ?? "").toUpperCase();
      if (!refine.postedAs.includes(p)) return false;
    }

    if (refine.bathroomsMin != null && (item.bathrooms ?? 0) < refine.bathroomsMin) {
      return false;
    }

    const area = areaInSquareFeet(item, intent);
    if (refine.areaMin != null && (area == null || area < refine.areaMin)) return false;
    if (refine.areaMax != null && (area == null || area > refine.areaMax)) return false;

    if (localityNeedles.length > 1) {
      const hay = [item.locality, item.subLocality, item.cityName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!localityNeedles.some((n) => hay.includes(n))) return false;
    }

    return true;
  });
}

export function areaInSquareFeet(item: RefinableItem, intent: IntentKey): number | undefined {
  const value = intent === "PLOT" ? item.plotArea : intent === "COMMERCIAL" ? item.builtUpArea ?? item.carpetArea : item.carpetArea;
  const unit = intent === "PLOT" ? item.plotAreaUnit : intent === "COMMERCIAL" && item.builtUpArea != null ? item.builtUpAreaUnit : item.carpetAreaUnit;
  const factors: Record<string, number> = { SQ_FT: 1, SQFT: 1, SQUARE_FEET: 1, SQ_M: 10.7639, SQM: 10.7639, SQUARE_METER: 10.7639, SQ_YD: 9, SQYD: 9, SQUARE_YARDS: 9, ACRE: 43560, ACRES: 43560, HECTARE: 107639 };
  const factor = factors[(unit ?? item.areaUnit ?? "SQ_FT").toUpperCase().replace(/[. ]/g, "")];
  return value != null && factor != null ? value * factor : undefined;
}

// --- summarising for chips / bar -------------------------------------

export function countActiveFilters(state: SearchState): number {
  const r = state.refine;
  let n = 0;
  if (state.priceMin != null || state.priceMax != null) n += 1;
  if (state.bedroomsMin != null) n += 1;
  n += r.subType.length;
  n += r.furnishing.length;
  n += r.postedAs.length;
  if (r.bathroomsMin != null) n += 1;
  if (r.areaMin != null || r.areaMax != null) n += 1;
  return n;
}

export type FilterChip = { id: string; label: string; remove: (s: SearchState) => SearchState };

/** Flat list of the currently-applied refinement filters, for the "applied" row. */
export function describeFilters(
  state: SearchState,
  labels: {
    subType?: (slug: string) => string;
    furnishing?: (v: string) => string;
    postedAs?: (v: string) => string;
    money?: (v: number) => string;
  } = {},
): FilterChip[] {
  const chips: FilterChip[] = [];
  const money = labels.money ?? ((v: number) => `₹${v}`);

  if (state.priceMin != null || state.priceMax != null) {
    const lo = state.priceMin != null ? money(state.priceMin) : "Any";
    const hi = state.priceMax != null ? money(state.priceMax) : "Any";
    chips.push({
      id: "budget",
      label: `${lo} – ${hi}`,
      remove: (s) => ({ ...s, priceMin: undefined, priceMax: undefined }),
    });
  }
  if (state.bedroomsMin != null) {
    chips.push({
      id: "bhk",
      label: `${state.bedroomsMin}+ BHK`,
      remove: (s) => ({ ...s, bedroomsMin: undefined }),
    });
  }
  state.refine.subType.forEach((slug) => {
    chips.push({
      id: `subType:${slug}`,
      label: labels.subType?.(slug) ?? slug,
      remove: (s) => ({ ...s, refine: { ...s.refine, subType: s.refine.subType.filter((x) => x !== slug) } }),
    });
  });
  state.refine.furnishing.forEach((v) => {
    chips.push({
      id: `furnishing:${v}`,
      label: labels.furnishing?.(v) ?? v,
      remove: (s) => ({ ...s, refine: { ...s.refine, furnishing: s.refine.furnishing.filter((x) => x !== v) } }),
    });
  });
  state.refine.postedAs.forEach((v) => {
    chips.push({
      id: `postedAs:${v}`,
      label: labels.postedAs?.(v) ?? v,
      remove: (s) => ({ ...s, refine: { ...s.refine, postedAs: s.refine.postedAs.filter((x) => x !== v) } }),
    });
  });
  if (state.refine.bathroomsMin != null) {
    chips.push({
      id: "bath",
      label: `${state.refine.bathroomsMin}+ Bath`,
      remove: (s) => ({ ...s, refine: { ...s.refine, bathroomsMin: undefined } }),
    });
  }
  if (state.refine.areaMin != null || state.refine.areaMax != null) {
    const lo = state.refine.areaMin != null ? `${state.refine.areaMin}` : "Any";
    const hi = state.refine.areaMax != null ? `${state.refine.areaMax}` : "Any";
    chips.push({
      id: "area",
      label: `${lo} – ${hi} sq.ft`,
      remove: (s) => ({ ...s, refine: { ...s.refine, areaMin: undefined, areaMax: undefined } }),
    });
  }
  return chips;
}

export function clearAllFilters(state: SearchState): SearchState {
  return {
    ...state,
    priceMin: undefined,
    priceMax: undefined,
    bedroomsMin: undefined,
    refine: emptyRefine(),
  };
}

export function locationSummary(state: SearchState): string {
  const parts = [...state.localities.map((l) => l.label), state.q, state.cityName].filter(Boolean);
  if (!parts.length) return "Anywhere";
  if (parts.length <= 2) return parts.join(" · ");
  return `${parts[0]} +${parts.length - 1} more`;
}
