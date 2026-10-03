// Condition evaluator + named-predicate registry.
//
// The predicate registry is the single source of truth for "which property
// class is this?" — it is the declarative replacement for the old
// `propertyDetails/visibility.ts`. Configs reference predicates via
// `{ preset: "isResidential" }` so the verbose class logic lives in one place.

import type { Condition, FormValues } from "./types";

export function getValue(obj: FormValues, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

const RESIDENTIAL_SUBTYPES = [
  "apartment",
  "independent-house-villa",
  "independent-builder-floor",
  "1rk-studio-apartment",
  "serviced-apartment",
  "farmhouse",
  "residential-other",
];

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

type Predicate = (v: FormValues) => boolean;

const isPG: Predicate = (v) => str(getValue(v, "context.listingType")) === "PG";
const isPlot: Predicate = (v) => str(getValue(v, "context.propertySubTypeSlug")).includes("plot-land");
const subType = (v: FormValues) => str(getValue(v, "context.propertySubTypeSlug"));
const subCategory = (v: FormValues) => str(getValue(v, "context.propertySubCategorySlug"));

const isResidential: Predicate = (v) =>
  RESIDENTIAL_SUBTYPES.includes(subType(v)) &&
  str(getValue(v, "context.resCom")) !== "COMMERCIAL" &&
  !isPG(v) &&
  !isPlot(v);

const isCommercial: Predicate = (v) =>
  str(getValue(v, "context.resCom")) === "COMMERCIAL" && !isPlot(v) && !isPG(v);

const isApartmentOrBuilder: Predicate = (v) =>
  subType(v) === "apartment" || subType(v) === "independent-builder-floor";
const isVilla: Predicate = (v) => subType(v) === "independent-house-villa";
const isFarmhouse: Predicate = (v) => subType(v) === "farmhouse";
const isStudio: Predicate = (v) => subType(v) === "1rk-studio-apartment";
const isServiced: Predicate = (v) => subType(v) === "serviced-apartment";
const isOffice: Predicate = (v) => subType(v) === "office";
const isRetail: Predicate = (v) => subType(v) === "retail";
const isWarehouse: Predicate = (v) => subType(v) === "storage";
const isIndustry: Predicate = (v) => subType(v) === "industry";
const isHospitality: Predicate = (v) => subType(v) === "hospitality";
const isShopCategory: Predicate = (v) => isRetail(v) && subCategory(v) === "commercial-shops";
const insideComplex: Predicate = (v) => Boolean(str(getValue(v, "context.locatedInsideSlug")));

// A unit physically inside a multi-storey building (has a floor, a lift, a society).
const isBuildingUnit: Predicate = (v) =>
  isApartmentOrBuilder(v) || isStudio(v) || isServiced(v) || isOffice(v) || isRetail(v) || isHospitality(v);
// A standalone structure on its own land.
const isStandaloneHome: Predicate = (v) => isVilla(v) || isFarmhouse(v);
// Residential dwellings that have a BHK configuration (studio has none).
const hasBhkConfig: Predicate = (v) =>
  isResidential(v) && !isStudio(v) && !isPlot(v);

const listingType = (v: FormValues) => str(getValue(v, "context.listingType"));
const isSell: Predicate = (v) => listingType(v) === "SELL";
const isRent: Predicate = (v) => listingType(v) === "RENT";
const postedAsAgent: Predicate = (v) => str(getValue(v, "context.postedAs")) === "AGENT";

const hasProjectOrSociety: Predicate = (v) =>
  Boolean(getValue(v, "location.projectId") || getValue(v, "location.societyOrProjectName"));

const anyDwelling: Predicate = (v) =>
  isResidential(v) || isHospitality(v) || isPG(v);
const showFurnishing: Predicate = (v) => anyDwelling(v) && !isPlot(v);
const showSociety: Predicate = (v) =>
  !isPlot(v) &&
  ((isBuildingUnit(v) && isResidential(v)) ? true : isCommercial(v) ? insideComplex(v) : hasProjectOrSociety(v));
const showLegal: Predicate = (v) =>
  !isPlot(v) && (isResidential(v) || isCommercial(v) || isPG(v) || isHospitality(v));

export const predicates: Record<string, Predicate> = {
  isPG,
  isNotPG: (v) => !isPG(v),
  isPlot,
  isNotPlot: (v) => !isPlot(v),
  isResidential,
  isCommercial,
  isResidentialOrCommercial: (v) => isResidential(v) || isCommercial(v),
  isApartmentOrBuilder,
  isVilla,
  isFarmhouse,
  isStudio,
  isServiced,
  isStandaloneHome,
  isBuildingUnit,
  isOffice,
  isRetail,
  isWarehouse,
  isIndustry,
  isHospitality,
  isShopCategory,
  insideComplex,
  isSell,
  isRent,
  isSellOrRent: (v) => isSell(v) || isRent(v),
  postedAsAgent,
  hasBhkConfig,

  // ---- Area ----
  showAreaSection: (v) => anyDwelling(v) || isPlot(v) || isWarehouse(v),
  showBuiltUpArea: (v) => anyDwelling(v) && !isPlot(v) && !isWarehouse(v),
  showCarpetArea: (v) => anyDwelling(v) && !isPlot(v),
  // super built-up is a building-unit concept (loading/common area) — not for villas/farmhouses
  showSuperBuiltUpArea: (v) => (isApartmentOrBuilder(v) || isStudio(v) || isServiced(v) || isOffice(v) || isRetail(v)),
  showPlotArea: (v) => isPlot(v) || isWarehouse(v),

  // ---- Rooms & layout ----
  showBedrooms: hasBhkConfig, // BHK selector — hidden for studio/plot
  showBathrooms: (v) => (isResidential(v) && !isPlot(v)) || isPG(v) || isHospitality(v),
  showBalconies: (v) => isResidential(v) && !isPlot(v),
  showKitchenType: (v) => isResidential(v) && !isPlot(v),
  showFloorNumber: (v) => isBuildingUnit(v), // "property on floor" — only inside a building
  showTotalFloors: (v) => isApartmentOrBuilder(v) || isStandaloneHome(v) || isOffice(v) || isRetail(v) || isHospitality(v),
  showFloorsAllowed: isPlot,
  showMultiFloor: (v) => subType(v) === "independent-builder-floor",
  showStaircases: (v) => isOffice(v) || isStandaloneHome(v),
  showOpenSides: (v) => isPlot(v) || isStandaloneHome(v) || isShopCategory(v),
  showPropertyFacing: (v) => isResidential(v) || isHospitality(v) || isPG(v) || isPlot(v),
  showWidthOfFacingRoad: (v) => isPlot(v) || isShopCategory(v),

  showFurnishing,
  showOtherRooms: (v) => (isResidential(v) && !isPlot(v) && !isStudio(v)),

  // ---- Society / project ----
  showSociety,

  // ---- Construction & legal (listing-type aware) ----
  showLegal,
  showLegalOrPlot: (v) => showLegal(v) || isPlot(v),
  showAvailabilityStatus: (v) => (isSell(v) || isPG(v)) && !isPlot(v),
  showAvailableFrom: (v) => (isRent(v) || isPG(v)) && !isPlot(v),
  showConstructionType: (v) => isSell(v) && !isPlot(v),
  showAgeOfProperty: (v) => !isPlot(v) && (isResidential(v) || isCommercial(v) || isHospitality(v)),
  showOwnership: (v) => isSell(v) || isPlot(v),
  showAuthority: (v) => isSell(v) || isPlot(v),
  showBoundaryWall: isPlot,
  showFireSafety: isCommercial,
  showBusinessApproval: isCommercial,

  // ---- Lifts & parking ----
  showParking: (v) => !isPlot(v),
  showLift: (v) => isApartmentOrBuilder(v) || isServiced(v) || isOffice(v) || isRetail(v) || isHospitality(v),
  showLiftCounts: (v) => isApartmentOrBuilder(v) || isOffice(v) || isRetail(v) || isHospitality(v),
  showLiftsAndParking: (v) => !isPlot(v),
  showPgSection: isPG,

  // ---- Pricing (listing-type aware) ----
  priceIsSell: isSell,
  priceIsRent: isRent,
  priceIsPg: isPG,
  showPricePerSqFt: (v) => isSell(v) && !isPG(v),
  showDeposit: (v) => isRent(v) || isPG(v),
  showMaintenance: (v) => (isSell(v) || isRent(v)) && (isBuildingUnit(v) || insideComplex(v)),
  showSocietyCharges: (v) => isSell(v) && isBuildingUnit(v),
  showBookingAmount: (v) => isSell(v),
  showBrokerage: (v) => postedAsAgent(v) && !isPG(v),
  showRentalYield: (v) => isSell(v) && isResidential(v),
};

export function evaluateCondition(values: FormValues, condition?: Condition): boolean {
  if (!condition) return true;

  if ("preset" in condition) {
    const fn = predicates[condition.preset];
    if (!fn) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[formConfig] unknown predicate preset: ${condition.preset}`);
      }
      return true;
    }
    return fn(values);
  }
  if ("not" in condition) return !evaluateCondition(values, condition.not);
  if ("and" in condition) return condition.and.every((c) => evaluateCondition(values, c));
  if ("or" in condition) return condition.or.some((c) => evaluateCondition(values, c));

  const actual = getValue(values, condition.field);
  if ("equals" in condition) return actual === condition.equals;
  if ("notEquals" in condition) return actual !== condition.notEquals;
  if ("in" in condition) return condition.in.includes(actual as never);
  if ("exists" in condition) {
    const present = actual !== undefined && actual !== null && actual !== "";
    return condition.exists ? present : !present;
  }
  const num = typeof actual === "number" ? actual : Number(actual);
  if ("gt" in condition) return Number.isFinite(num) && num > condition.gt;
  if ("gte" in condition) return Number.isFinite(num) && num >= condition.gte;
  if ("lt" in condition) return Number.isFinite(num) && num < condition.lt;
  if ("lte" in condition) return Number.isFinite(num) && num <= condition.lte;
  return true;
}

/** Convenience for configs: `preset("isResidential")`. */
export const preset = (name: keyof typeof predicates | string): Condition => ({ preset: name });
