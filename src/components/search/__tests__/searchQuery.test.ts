import {
  parseSearchParams,
  buildSearchParams,
  toApiParams,
  applyClientRefinements,
  hasClientRefinements,
  describeFilters,
  clearAllFilters,
  initialSearchState,
  type SearchState,
} from "../searchQuery";
import { subTypeSlugToId } from "../searchConfig";

const state = (over: Partial<SearchState> = {}): SearchState => ({
  ...initialSearchState(),
  ...over,
  refine: { ...initialSearchState().refine, ...(over.refine ?? {}) },
});

describe("parse <-> build round-trip", () => {
  it("preserves location, intent, price, bhk, sort and refinements", () => {
    const s = state({
      q: "Prestige Lakeside",
      localities: [{ label: "Whitefield, Bengaluru" }, { label: "Marathahalli" }],
      intent: "RENT",
      priceMin: 20000,
      priceMax: 45000,
      bedroomsMin: 2,
      sort: "price_desc",
      refine: { subType: ["apartment"], furnishing: ["SEMI_FURNISHED"], postedAs: ["OWNER"], bathroomsMin: 2 },
    });
    const round = parseSearchParams(buildSearchParams(s));
    expect(round.q).toBe("Prestige Lakeside");
    expect(round.localities.map((l) => l.label)).toEqual(["Whitefield, Bengaluru", "Marathahalli"]);
    expect(round.intent).toBe("RENT");
    expect(round.priceMin).toBe(20000);
    expect(round.priceMax).toBe(45000);
    expect(round.bedroomsMin).toBe(2);
    expect(round.sort).toBe("price_desc");
    expect(round.refine.subType).toEqual(["apartment"]);
    expect(round.refine.furnishing).toEqual(["SEMI_FURNISHED"]);
    expect(round.refine.postedAs).toEqual(["OWNER"]);
    expect(round.refine.bathroomsMin).toBe(2);
  });

  it("reads legacy listingType= links", () => {
    expect(parseSearchParams(new URLSearchParams("listingType=SELL")).intent).toBe("BUY");
    expect(parseSearchParams(new URLSearchParams("listingType=COMMERCIAL")).intent).toBe("COMMERCIAL");
    expect(parseSearchParams(new URLSearchParams("q=koramangala")).q).toBe("koramangala");
  });

  it("reads backend-style cityName and commercial resCom links", () => {
    const parsed = parseSearchParams(
      new URLSearchParams("listingType=SELL&pageSize=30&resCom=COMMERCIAL&q=Delhi&cityName=Delhi"),
    );
    expect(parsed.intent).toBe("COMMERCIAL");
    expect(parsed.cityName).toBe("Delhi");
    expect(parsed.q).toBe("Delhi");
  });
});

describe("toApiParams — backend allow-list only", () => {
  it("emits only keys the backend accepts and never an r.* key", () => {
    const s = state({
      q: "x",
      localities: [{ label: "HSR Layout" }],
      intent: "BUY",
      priceMin: 5000000,
      bedroomsMin: 3,
      sort: "newest",
      refine: { subType: ["apartment"], furnishing: ["FURNISHED"], postedAs: ["AGENT"] },
    });
    const api = toApiParams(s, 12) as Record<string, unknown>;
    expect(Object.keys(api).sort()).toEqual(
      ["bedrooms", "listingType", "pageSize", "postedAs", "priceMin", "q", "sort"].sort(),
    );
    expect(api.listingType).toBe("SELL");
    expect(api.bedrooms).toBe(3);
    expect(api.q).toBe("x, HSR Layout");
    expect(Object.keys(api).some((k) => k.startsWith("r."))).toBe(false);
  });

  it("clamps Commercial / Plot intents to SELL", () => {
    expect(toApiParams(state({ intent: "COMMERCIAL" }), 12).listingType).toBe("SELL");
    expect(toApiParams(state({ intent: "PLOT" }), 12).listingType).toBe("SELL");
    expect(toApiParams(state({ intent: "PG" }), 12).listingType).toBe("PG");
  });

  it("drops sort when relevance", () => {
    expect(toApiParams(state({ sort: "relevance" }), 12).sort).toBeUndefined();
  });

  it("sends cityName when a single selected locality is a city chip", () => {
    const api = toApiParams(state({ localities: [{ label: "Delhi", city: "Delhi" }] }), 12);
    expect(api.cityName).toBe("Delhi");
    expect(api.q).toBe("Delhi");
  });
});

describe("hasClientRefinements", () => {
  it("is true for Plot intents and for browser-only filters", () => {
    expect(hasClientRefinements(state())).toBe(false);
    expect(hasClientRefinements(state({ intent: "COMMERCIAL" }))).toBe(false);
    expect(hasClientRefinements(state({ intent: "PLOT" }))).toBe(true);
    expect(hasClientRefinements(state({ refine: { subType: ["apartment"], furnishing: [], postedAs: [] } }))).toBe(true);
    expect(hasClientRefinements(state({ localities: [{ label: "a" }, { label: "b" }] }))).toBe(true);
  });
});

describe("applyClientRefinements", () => {
  const items = [
    { id: 1, furnishing: "SEMI_FURNISHED", postedAs: "OWNER", bathrooms: 2, carpetArea: 1200, resCom: "RESIDENTIAL", propertySubType: { slug: "apartment" }, propertySubTypeId: 1, locality: "Whitefield", cityName: "Bengaluru" },
    { id: 2, furnishing: "FURNISHED", postedAs: "AGENT", bathrooms: 1, carpetArea: 800, resCom: "RESIDENTIAL", propertySubType: { slug: "independent-house-villa" }, propertySubTypeId: 2, locality: "Marathahalli", cityName: "Bengaluru" },
    { id: 3, furnishing: "UNFURNISHED", postedAs: "OWNER", bathrooms: 3, carpetArea: 5000, resCom: "COMMERCIAL", propertySubType: { slug: "commercial-shops" }, propertySubTypeId: 14, locality: "MG Road", cityName: "Bengaluru" },
  ];

  const run = (s: SearchState) => applyClientRefinements(items, s, subTypeSlugToId).map((i) => i.id);

  it("filters by furnishing", () => {
    expect(run(state({ refine: { subType: [], furnishing: ["FURNISHED"], postedAs: [] } }))).toEqual([2]);
  });
  it("filters by sub-type slug", () => {
    expect(run(state({ refine: { subType: ["apartment"], furnishing: [], postedAs: [] } }))).toEqual([1]);
  });
  it("filters by posted-by and bathrooms minimum", () => {
    expect(run(state({ refine: { subType: [], furnishing: [], postedAs: ["OWNER"], bathroomsMin: 3 } }))).toEqual([3]);
  });
  it("Commercial intent keeps only COMMERCIAL resCom", () => {
    expect(run(state({ intent: "COMMERCIAL" }))).toEqual([3]);
  });
  it("filters backend flat propertySubTypeSlug values", () => {
    const backendItems = [
      { id: 52, resCom: "COMMERCIAL", propertySubTypeSlug: "retail", locality: "Connaught Place", cityName: "New Delhi" },
      { id: 107, resCom: "COMMERCIAL", propertySubTypeSlug: null, locality: "Jasola", cityName: "New Delhi" },
    ];
    const ids = applyClientRefinements(
      backendItems,
      state({ intent: "COMMERCIAL", refine: { subType: ["retail"], furnishing: [], postedAs: [] } }),
      subTypeSlugToId,
    ).map((i) => i.id);
    expect(ids).toEqual([52]);
  });
  it("filters by area range", () => {
    expect(run(state({ refine: { subType: [], furnishing: [], postedAs: [], areaMin: 1000, areaMax: 3000 } }))).toEqual([1]);
  });
  it("multi-locality narrows by locality text", () => {
    expect(run(state({ localities: [{ label: "Whitefield" }, { label: "Indiranagar" }] }))).toEqual([1]);
  });
});

describe("describeFilters / clearAllFilters", () => {
  it("lists active filters and each chip removes only itself", () => {
    const s = state({ priceMin: 1000, bedroomsMin: 2, refine: { subType: ["apartment"], furnishing: ["FURNISHED"], postedAs: [] } });
    const chips = describeFilters(s);
    expect(chips.map((c) => c.id).sort()).toEqual(["bhk", "budget", "furnishing:FURNISHED", "subType:apartment"].sort());
    const afterRemoveBhk = chips.find((c) => c.id === "bhk")!.remove(s);
    expect(afterRemoveBhk.bedroomsMin).toBeUndefined();
    expect(afterRemoveBhk.refine.subType).toEqual(["apartment"]);
  });
  it("clearAllFilters keeps location + intent + sort", () => {
    const s = state({ q: "x", intent: "RENT", sort: "newest", priceMin: 1, bedroomsMin: 2, refine: { subType: ["apartment"], furnishing: [], postedAs: [] } });
    const cleared = clearAllFilters(s);
    expect(cleared.q).toBe("x");
    expect(cleared.intent).toBe("RENT");
    expect(cleared.sort).toBe("newest");
    expect(cleared.priceMin).toBeUndefined();
    expect(cleared.bedroomsMin).toBeUndefined();
    expect(cleared.refine.subType).toEqual([]);
  });
});
