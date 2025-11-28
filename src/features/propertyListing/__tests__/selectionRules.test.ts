import { getAllowedPropertyTypes, getSubTypesForSelection, propertyTypes, propertySubTypeCatalog } from "@/features/propertyListing";

describe("Property listing selection rules", () => {
  test("SELL allows Residential and Commercial types", () => {
    const types = getAllowedPropertyTypes("SELL");
    const ids = types.map((t) => t.id);
    expect(ids).toEqual(["1", "2"]);
  });

  test("RENT allows Residential and Commercial types", () => {
    const types = getAllowedPropertyTypes("RENT");
    const ids = types.map((t) => t.id);
    expect(ids).toEqual(["1", "2"]);
  });

  test("PG allows only Residential type", () => {
    const types = getAllowedPropertyTypes("PG");
    const ids = types.map((t) => t.id);
    expect(ids).toEqual(["1"]);
  });

  test("PG sub-types are forced to PG group regardless of propertyTypeId", () => {
    const subsNoType = getSubTypesForSelection("PG");
    const subsWithRes = getSubTypesForSelection("PG", "1");
    const subsWithCom = getSubTypesForSelection("PG", "2");
    const pgSubs = propertySubTypeCatalog.pg.map((s) => s.id);
    expect(subsNoType.map((s) => s.id)).toEqual(pgSubs);
    expect(subsWithRes.map((s) => s.id)).toEqual(pgSubs);
    expect(subsWithCom.map((s) => s.id)).toEqual(pgSubs);
  });

  test("Residential sub-types list includes Apartment and Plot/Land", () => {
    const subs = getSubTypesForSelection("SELL", "1");
    const slugs = subs.map((s) => s.slug);
    expect(slugs).toContain("apartment");
    expect(slugs).toContain("res-plot-land");
  });

  test("Commercial sub-types list includes Office and Retail", () => {
    const subs = getSubTypesForSelection("SELL", "2");
    const slugs = subs.map((s) => s.slug);
    expect(slugs).toContain("office");
    expect(slugs).toContain("retail");
  });

  test("Office and Retail have categories and locatedInside options", () => {
    const office = propertySubTypeCatalog.commercial.find((s) => s.slug === "office");
    const retail = propertySubTypeCatalog.commercial.find((s) => s.slug === "retail");
    expect(office?.categories?.length).toBeGreaterThan(0);
    expect(retail?.categories?.length).toBeGreaterThan(0);
    expect(office?.locatedInsideOptions?.length).toBeGreaterThan(0);
    expect(retail?.locatedInsideOptions?.length).toBeGreaterThan(0);
  });

  test("Other commercial sub-types have no locatedInside options", () => {
    const others = propertySubTypeCatalog.commercial.filter((s) => s.slug !== "office" && s.slug !== "retail");
    for (const s of others) {
      expect(s.locatedInsideOptions ?? []).toHaveLength(0);
    }
  });
});

