import {
  parseSearchParams,
  buildSearchParams,
  buildSearchHref,
  fromSearchSlug,
  toSearchSlug,
  toApiParams,
  applyClientRefinements,
  applyFlatmateRefinements,
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

describe("structured SEO search URLs", () => {
  it("moves city and localities into path segments", () => {
    const href = buildSearchHref(state({
      cityName: "New Delhi",
      localities: [{ label: "Saket" }, { label: "Greater Kailash 1" }],
      intent: "RENT",
      priceMax: 50000,
    }));
    expect(href).toBe("/rent/new-delhi/saket/greater-kailash-1?priceMax=50000");
  });

  it("uses the intent landing route when no city is selected", () => {
    expect(buildSearchHref(state({ cityName: undefined }))).toBe("/buy");
    expect(buildSearchHref(state({ cityName: undefined, intent: "PG" }))).toBe("/pg");
    expect(buildSearchHref(state({ cityName: undefined, intent: "FLATMATE" }))).toBe("/flatmate");
  });

  it("normalizes and restores readable location slugs", () => {
    expect(toSearchSlug("Gurugram Sector 56")).toBe("gurugram-sector-56");
    expect(fromSearchSlug("dlf-phase-1")).toBe("Dlf Phase 1");
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
    expect(toApiParams(state({ intent: "FLATMATE" }), 12).listingType).toBe("PG");
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
  it("filters by food policy for PG listings", () => {
    const pgItems = [
      { id: 10, title: "PG with Mess", foodIncluded: true, foodOption: "INCLUDED", resCom: "RESIDENTIAL", locality: "Indiranagar", cityName: "Bengaluru" },
      { id: 11, title: "PG Self Cooking", foodIncluded: false, foodOption: "SELF_COOKING", resCom: "RESIDENTIAL", locality: "Indiranagar", cityName: "Bengaluru" },
      { id: 12, title: "PG Without Food", foodIncluded: false, foodOption: "NO_FOOD", resCom: "RESIDENTIAL", locality: "Indiranagar", cityName: "Bengaluru" },
      { id: 13, title: "Standard Room PG", resCom: "RESIDENTIAL", locality: "Indiranagar", cityName: "Bengaluru" },
    ];
    const withFood = applyClientRefinements(
      pgItems,
      state({ intent: "PG", refine: { subType: [], furnishing: [], postedAs: [], food: ["INCLUDED"] } }),
      subTypeSlugToId,
    ).map((i) => i.id);
    expect(withFood).toEqual([10]);

    const selfCook = applyClientRefinements(
      pgItems,
      state({ intent: "PG", refine: { subType: [], furnishing: [], postedAs: [], food: ["SELF_COOKING"] } }),
      subTypeSlugToId,
    ).map((i) => i.id);
    expect(selfCook).toEqual([11]);

    const noFood = applyClientRefinements(
      pgItems,
      state({ intent: "PG", refine: { subType: [], furnishing: [], postedAs: [], food: ["NO_FOOD"] } }),
      subTypeSlugToId,
    ).map((i) => i.id);
    expect(noFood).toEqual([12, 13]);

    const allFoodSelected = applyClientRefinements(
      pgItems,
      state({ intent: "PG", refine: { subType: [], furnishing: [], postedAs: [], food: ["NO_FOOD", "SELF_COOKING", "OPTIONAL_MESS", "INCLUDED"] } }),
      subTypeSlugToId,
    ).map((i) => i.id);
    expect(allFoodSelected).toEqual([10, 11, 12, 13]);
  });
});

describe("describeFilters / clearAllFilters", () => {
  it("lists active filters including food and each chip removes only itself", () => {
    const s = state({ priceMin: 1000, bedroomsMin: 2, refine: { subType: ["apartment"], furnishing: ["FURNISHED"], postedAs: [], food: ["INCLUDED"] } });
    const chips = describeFilters(s);
    expect(chips.map((c) => c.id).sort()).toEqual(["bhk", "budget", "food:INCLUDED", "furnishing:FURNISHED", "subType:apartment"].sort());
    const afterRemoveFood = chips.find((c) => c.id === "food:INCLUDED")!.remove(s);
    expect(afterRemoveFood.refine.food).toEqual([]);
    expect(afterRemoveFood.refine.subType).toEqual(["apartment"]);
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

  it("handles flatmate filters in describeFilters and remove works accurately", () => {
    const s = state({
      intent: "FLATMATE",
      refine: {
        subType: [],
        furnishing: ["Fully Furnished"],
        postedAs: [],
        flatmateMode: ["HAVE_ROOM"],
        roomType: ["Private Room"],
        gender: ["Female Only"],
        diet: ["Pure Vegetarian"],
        lifestyle: ["PET_FRIENDLY", "NON_SMOKER"],
      },
    });
    const chips = describeFilters(s);
    const chipIds = chips.map((c) => c.id);
    expect(chipIds).toContain("mode:HAVE_ROOM");
    expect(chipIds).toContain("roomType:Private Room");
    expect(chipIds).toContain("gender:Female Only");
    expect(chipIds).toContain("diet:Pure Vegetarian");
    expect(chipIds).toContain("lifestyle:PET_FRIENDLY");
    expect(chipIds).toContain("lifestyle:NON_SMOKER");

    const afterRemoveMode = chips.find((c) => c.id === "mode:HAVE_ROOM")!.remove(s);
    expect(afterRemoveMode.refine.flatmateMode).toEqual([]);
    expect(afterRemoveMode.refine.roomType).toEqual(["Private Room"]);
  });
});

describe("applyFlatmateRefinements", () => {
  const flatmateListings: any[] = [
    {
      id: 1,
      mode: "HAVE_ROOM",
      cityName: "Delhi",
      locality: "Delhi G P O",
      roomType: "Private Room",
      furnishing: "Fully Furnished",
      rent: 18000,
      bhk: 2,
      preferredGenders: ["Female Only"],
      preferredDiet: "Pure Vegetarian",
      petsAllowed: true,
      smokingAllowed: false,
      drinkingAllowed: true,
      profile: { gender: "Female", diet: "Pure Vegetarian", smoking: "No", hasPets: true },
    },
    {
      id: 2,
      mode: "NEED_ROOM",
      cityName: "Delhi",
      locality: "Hauz Khas",
      roomType: "Shared Room",
      furnishing: "Semi-furnished",
      budgetMin: 10000,
      budgetMax: 22000,
      bhk: 3,
      preferredGenders: ["Male Only"],
      preferredDiet: "Non-Vegetarian",
      petsAllowed: false,
      smokingAllowed: true,
      drinkingAllowed: false,
      profile: { gender: "Male", diet: "Non-Vegetarian", smoking: "Yes", hasPets: false },
    },
  ];

  it("filters by flatmate mode", () => {
    const res = applyFlatmateRefinements(
      flatmateListings,
      state({ intent: "FLATMATE", refine: { subType: [], furnishing: [], postedAs: [], flatmateMode: ["HAVE_ROOM"] } }),
    );
    expect(res.map((r) => r.id)).toEqual([1]);
  });

  it("filters by gender preference", () => {
    const res = applyFlatmateRefinements(
      flatmateListings,
      state({ intent: "FLATMATE", refine: { subType: [], furnishing: [], postedAs: [], gender: ["Female Only"] } }),
    );
    expect(res.map((r) => r.id)).toEqual([1]);
  });

  it("filters by lifestyle rules (petsAllowed, non-smoker)", () => {
    const petFriendly = applyFlatmateRefinements(
      flatmateListings,
      state({ intent: "FLATMATE", refine: { subType: [], furnishing: [], postedAs: [], lifestyle: ["PET_FRIENDLY"] } }),
    );
    expect(petFriendly.map((r) => r.id)).toEqual([1]);

    const nonSmoker = applyFlatmateRefinements(
      flatmateListings,
      state({ intent: "FLATMATE", refine: { subType: [], furnishing: [], postedAs: [], lifestyle: ["NON_SMOKER"] } }),
    );
    expect(nonSmoker.map((r) => r.id)).toEqual([1]);
  });

  it("filters by rent / budget range", () => {
    const budgetFiltered = applyFlatmateRefinements(
      flatmateListings,
      state({ intent: "FLATMATE", priceMin: 15000, priceMax: 20000 }),
    );
    expect(budgetFiltered.map((r) => r.id)).toEqual([1, 2]);

    const highOnly = applyFlatmateRefinements(
      flatmateListings,
      state({ intent: "FLATMATE", priceMin: 20000 }),
    );
    expect(highOnly.map((r) => r.id)).toEqual([2]);
  });
});
