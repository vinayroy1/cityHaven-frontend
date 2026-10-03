import { evaluateCondition, predicates } from "../conditions";
import { computeListingScore } from "../scoring";
import { requiredPathsForStep } from "../validation";
import { listingSteps } from "../steps";
import { propertyProfileStep } from "../steps/propertyProfile";
import { pricingAmenitiesStep } from "../steps/pricingAmenities";
import { basicDetailsStep } from "../steps/basicDetails";
import { initialPropertyListingFormValues } from "../../slice";
import { mapFormToApiPayload } from "../../mapper";
import { deriveConfiguration, suggestTitle } from "../derive";
import { evaluateCondition as evalC } from "../conditions";

const ctx = (over: Record<string, unknown>) => ({
  ...initialPropertyListingFormValues,
  context: { ...initialPropertyListingFormValues.context, ...over },
});

describe("predicate registry — tied to Basic Details", () => {
  test("apartment for rent", () => {
    const v = ctx({ listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "apartment" });
    expect(predicates.isResidential(v)).toBe(true);
    expect(predicates.isBuildingUnit(v)).toBe(true);
    expect(predicates.showBedrooms(v)).toBe(true);
    expect(predicates.showFloorNumber(v)).toBe(true);
    expect(predicates.showSuperBuiltUpArea(v)).toBe(true);
    expect(predicates.showLift(v)).toBe(true);
  });

  test("villa: no 'property on floor', no super built-up, no lift", () => {
    const v = ctx({ listingType: "SELL", resCom: "RESIDENTIAL", propertySubTypeSlug: "independent-house-villa" });
    expect(predicates.isStandaloneHome(v)).toBe(true);
    expect(predicates.showFloorNumber(v)).toBe(false);
    expect(predicates.showSuperBuiltUpArea(v)).toBe(false);
    expect(predicates.showLift(v)).toBe(false);
    expect(predicates.showTotalFloors(v)).toBe(true);
    expect(predicates.showOpenSides(v)).toBe(true);
  });

  test("studio: no BHK selector", () => {
    const v = ctx({ listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "1rk-studio-apartment" });
    expect(predicates.showBedrooms(v)).toBe(false);
    expect(predicates.showBathrooms(v)).toBe(true);
    expect(deriveConfiguration(v)).toBe("Studio");
  });

  test("plot: minimal set", () => {
    const v = ctx({ listingType: "SELL", resCom: "RESIDENTIAL", propertySubTypeSlug: "plot-land-res" });
    expect(predicates.showBedrooms(v)).toBe(false);
    expect(predicates.showFurnishing(v)).toBe(false);
    expect(predicates.showParking(v)).toBe(false);
    expect(predicates.showPlotArea(v)).toBe(true);
    expect(predicates.showBoundaryWall(v)).toBe(true);
    expect(predicates.showOwnership(v)).toBe(true);
  });
});

describe("listing-type gates las Basic Details", () => {
  const apt = { listingType: "", resCom: "RESIDENTIAL", propertySubTypeSlug: "apartment" };

  test("rent hides ownership/authority/construction-type; shows available-from", () => {
    const v = ctx({ ...apt, listingType: "RENT" });
    const legal = propertyProfileStep.sections!.find((s) => s.id === "legal")!;
    const ids = legal.fields.filter((f) => evalC(v, f.visibleWhen)).map((f) => f.id);
    expect(ids).toContain("availability.availableFrom");
    expect(ids).not.toContain("amenities.ownershipType");
    expect(ids).not.toContain("availability.availabilityStatus");
    expect(ids).not.toContain("availability.constructionType");
  });

  test("sell shows ownership + availability status, not available-from", () => {
    const v = ctx({ ...apt, listingType: "SELL" });
    const legal = propertyProfileStep.sections!.find((s) => s.id === "legal")!;
    const ids = legal.fields.filter((f) => evalC(v, f.visibleWhen)).map((f) => f.id);
    expect(ids).toContain("amenities.ownershipType");
    expect(ids).toContain("availability.availabilityStatus");
    expect(ids).not.toContain("availability.availableFrom");
  });

  test("pricing: rent label is 'Monthly rent', deposit shown, no price/sqft", () => {
    const v = ctx({ ...apt, listingType: "RENT", postedAs: "OWNER" });
    const price = pricingAmenitiesStep.sections!.find((s) => s.id === "price")!;
    const visiblePrice = price.fields.filter((f) => evalC(v, f.visibleWhen));
    expect(visiblePrice.find((f) => f.id === "pricing.price")?.label).toBe("Monthly rent (₹)");
    expect(visiblePrice.some((f) => f.id === "pricing.pricePerSqFt")).toBe(false);
    expect(predicates.showDeposit(v)).toBe(true);
  });

  test("pricing: sell label is 'Expected price', brokerage only for agents", () => {
    const owner = ctx({ ...apt, listingType: "SELL", postedAs: "OWNER" });
    const agent = ctx({ ...apt, listingType: "SELL", postedAs: "AGENT" });
    const price = pricingAmenitiesStep.sections!.find((s) => s.id === "price")!;
    expect(price.fields.filter((f) => evalC(owner, f.visibleWhen)).find((f) => f.id === "pricing.price")?.label).toBe(
      "Expected price (₹)",
    );
    expect(predicates.showBrokerage(owner)).toBe(false);
    expect(predicates.showBrokerage(agent)).toBe(true);
  });
});

describe("step validation paths", () => {
  test("basic step requires classification", () => {
    const v = ctx({ listingType: "SELL", resCom: "RESIDENTIAL" });
    expect(requiredPathsForStep(basicDetailsStep, v)).toContain("context.propertySubTypeSlug");
  });

  test("apartment rent requires BHK + bathrooms + floor", () => {
    const v = ctx({ listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "apartment" });
    const paths = requiredPathsForStep(propertyProfileStep, v);
    expect(paths).toContain("details.bedrooms");
    expect(paths).toContain("details.bathrooms");
    expect(paths).toContain("details.floorNumber");
  });

  test("plot requires only plot area (+ title)", () => {
    const v = ctx({ listingType: "SELL", resCom: "RESIDENTIAL", propertySubTypeSlug: "plot-land-res" });
    const paths = requiredPathsForStep(propertyProfileStep, v);
    expect(paths).toContain("details.plotArea");
    expect(paths).not.toContain("details.bedrooms");
    expect(paths).not.toContain("details.carpetArea");
  });
});

describe("derive: configuration + title", () => {
  test("3 BHK apartment for rent", () => {
    const v = { ...ctx({ listingType: "RENT", propertySubTypeSlug: "apartment" }) };
    v.details = { ...v.details, bedrooms: 3 };
    v.location = { ...v.location, cityName: "Bengaluru", locality: "Whitefield" };
    expect(deriveConfiguration(v)).toBe("3 BHK");
    expect(suggestTitle(v)).toBe("3 BHK Apartment for Rent in Whitefield, Bengaluru");
  });

  test("commercial office title", () => {
    const v = ctx({ listingType: "SELL", resCom: "COMMERCIAL", propertySubTypeSlug: "office" });
    v.location = { ...v.location, cityName: "Pune" };
    expect(deriveConfiguration(v)).toBe("Office");
    expect(suggestTitle(v)).toBe("Office for Sale in Pune");
  });
});

describe("scoring + mapper", () => {
  test("filling fields raises the score", () => {
    const base = ctx({ listingType: "SELL", resCom: "RESIDENTIAL", propertySubTypeSlug: "apartment" });
    const low = computeListingScore(listingSteps, base);
    const filled = computeListingScore(listingSteps, {
      ...base,
      meta: { ...base.meta, title: "Nice flat" },
      details: { ...base.details, carpetArea: 1200, bedrooms: 3, bathrooms: 2 },
      location: { ...base.location, cityName: "B", locality: "H" },
    });
    expect(filled.pct).toBeGreaterThan(low.pct);
  });

  test("config slugs reach the API payload", () => {
    const v = ctx({
      listingType: "RENT",
      resCom: "COMMERCIAL",
      propertySubTypeSlug: "retail",
      propertySubCategorySlug: "commercial-shops",
      locatedInsideSlug: "mall",
    });
    const p = mapFormToApiPayload(v) as Record<string, unknown>;
    expect(p.propertySubTypeSlug).toBe("retail");
    expect(p.propertyTypeSlug).toBe("commercial");
  });

  test("numeric gt operator still works", () => {
    expect(evaluateCondition({ details: { floorsAllowed: 3 } }, { field: "details.floorsAllowed", gt: 1 })).toBe(true);
  });

  // sanity: no field references an unknown preset
  test("every preset referenced by configs exists", () => {
    const seen = new Set<string>();
    const walk = (c: unknown) => {
      if (!c || typeof c !== "object") return;
      const o = c as Record<string, unknown>;
      if (typeof o.preset === "string") seen.add(o.preset);
      Object.values(o).forEach((val) => {
        if (Array.isArray(val)) val.forEach(walk);
        else if (val && typeof val === "object") walk(val);
      });
    };
    for (const step of listingSteps) {
      for (const sec of step.sections ?? []) {
        walk(sec.visibleWhen);
        for (const f of sec.fields) {
          walk(f.visibleWhen);
          walk(f.requiredWhen);
          (f.options ?? []).forEach((op) => walk(op.visibleWhen));
        }
      }
    }
    for (const name of seen) expect(predicates[name]).toBeInstanceOf(Function);
  });
});
