// Package <-> fixed comparison-table model. The table rows map onto existing
// InteriorPackageDraft fields so no new backend columns are needed:
//   core board / finish / paint / furnishings -> materialSpecs (BOARD, SURFACE_FINISH, WALL_FINISH, OTHER)
//   hardware brand -> materialSpecs HARDWARE.brand
//   warranty years -> warranty.woodworkYears
//   ₹ per sq.ft    -> priceMin (pricingMode PER_UNIT, pricingUnit PER_SQFT)
//   from ₹ by BHK  -> conditions "2 BHK from ₹4,50,000"
//   quote validity -> conditions "Quote valid for 30 days"
import type { InteriorPackageDraft, MaterialCategory, PackageMaterialSpec } from "@/types/interior.types";
import { PACKAGE_PRESETS } from "@/features/interiors/wizard/options";

export const TIER_NAMES = PACKAGE_PRESETS.map((p) => p.label) as string[];
export const isPresetTier = (name: string) => TIER_NAMES.includes(name);

export const BOARD_GRADES = ["HMR", "BWR", "BWP"] as const;
export const FINISHES = ["Laminate", "Acrylic", "PU / Lacquer", "Veneer"] as const;
export const HARDWARE_BRANDS = ["Ebco", "Hettich", "Hafele", "Blum"] as const;
export const FURNISHING_LEVELS = ["Basic", "Standard", "Premium"] as const;
export const BHKS = ["1 BHK", "2 BHK", "3 BHK"] as const;

const PRESET_DEFAULTS: Record<string, Partial<TableModel>> = {
  Essential: { board: "HMR", finish: "Laminate", hardware: "Ebco", furnishing: "Basic", warrantyYears: 5, validityDays: 30 },
  Premium: { board: "BWR", finish: "Acrylic", hardware: "Hettich", furnishing: "Standard", warrantyYears: 10, validityDays: 30 },
  Luxury: { board: "BWP", finish: "PU / Lacquer", hardware: "Blum", furnishing: "Premium", warrantyYears: 10, validityDays: 30 },
};

export type TableModel = {
  board: string;
  finish: string;
  hardware: string;
  paint: string;
  furnishing: string;
  warrantyYears: number | null;
  perSqft: number | null;
  fromBhk: Record<string, number | null>;
  inclusions: string[];
  exclusions: string[];
  validityDays: number | null;
  otherConditions: string[];
};

const BHK_RE = /^(\d) BHK from ₹([\d,]+)$/;
const VALID_RE = /^Quote valid for (\d+) days?$/;
const FURN_PREFIX = "Furnishings: ";

const spec = (specs: PackageMaterialSpec[], c: MaterialCategory) => specs.find((s) => s.category === c);

export function toTable(p: InteriorPackageDraft): TableModel {
  const specs = p.materialSpecs ?? [];
  const fromBhk: Record<string, number | null> = { "1 BHK": null, "2 BHK": null, "3 BHK": null };
  let validityDays: number | null = null;
  const otherConditions: string[] = [];
  for (const c of p.conditions ?? []) {
    const b = BHK_RE.exec(c);
    const v = VALID_RE.exec(c);
    if (b) fromBhk[`${b[1]} BHK`] = Number(b[2].replace(/,/g, ""));
    else if (v) validityDays = Number(v[1]);
    else otherConditions.push(c);
  }
  const furn = specs.find((s) => s.category === "OTHER" && s.spec.startsWith(FURN_PREFIX));
  return {
    board: spec(specs, "BOARD")?.spec ?? "",
    finish: spec(specs, "SURFACE_FINISH")?.spec ?? "",
    hardware: spec(specs, "HARDWARE")?.brand ?? "",
    paint: spec(specs, "WALL_FINISH")?.spec ?? "",
    furnishing: furn ? furn.spec.slice(FURN_PREFIX.length) : "",
    warrantyYears: p.warranty?.woodworkYears ?? null,
    perSqft: p.pricingUnit === "PER_SQFT" ? p.priceMin : null,
    fromBhk,
    inclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    validityDays,
    otherConditions,
  };
}

const inr = (n: number) => n.toLocaleString("en-IN");

export function fromTable(p: InteriorPackageDraft, t: TableModel): InteriorPackageDraft {
  const specs: PackageMaterialSpec[] = [];
  if (t.board) specs.push({ category: "BOARD", spec: t.board });
  if (t.finish) specs.push({ category: "SURFACE_FINISH", spec: t.finish });
  if (t.hardware) specs.push({ category: "HARDWARE", spec: "Hardware & fittings", brand: t.hardware });
  if (t.paint) specs.push({ category: "WALL_FINISH", spec: t.paint });
  if (t.furnishing) specs.push({ category: "OTHER", spec: `${FURN_PREFIX}${t.furnishing}` });
  const conditions = [
    ...BHKS.flatMap((b) => (t.fromBhk[b] != null ? [`${b.charAt(0)} BHK from ₹${inr(t.fromBhk[b] as number)}`] : [])),
    ...(t.validityDays ? [`Quote valid for ${t.validityDays} days`] : []),
    ...t.otherConditions,
  ];
  const bhkPrices = BHKS.map((b) => t.fromBhk[b]).filter((n): n is number => n != null);
  return {
    ...p,
    materialSpecs: specs,
    warranty: { ...p.warranty, woodworkYears: t.warrantyYears },
    pricingMode: t.perSqft != null ? "PER_UNIT" : bhkPrices.length ? "RANGE" : p.pricingMode,
    pricingUnit: t.perSqft != null ? "PER_SQFT" : bhkPrices.length ? "PER_PROJECT" : p.pricingUnit,
    priceMin: t.perSqft ?? (bhkPrices.length ? Math.min(...bhkPrices) : null),
    priceMax: t.perSqft != null ? null : bhkPrices.length > 1 ? Math.max(...bhkPrices) : null,
    applicableBhk: BHKS.filter((b) => t.fromBhk[b] != null),
    inclusions: t.inclusions,
    exclusions: t.exclusions,
    conditions,
  };
}

export function newPackage(name: string, orderIndex: number, materialHints: { board?: string; hardware?: string } = {}): InteriorPackageDraft {
  const base: InteriorPackageDraft = {
    id: `pkg-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
    serverId: null,
    packageName: name,
    packageCategory: "Full Home",
    description: "",
    pricingMode: "",
    priceMin: null,
    priceMax: null,
    pricingUnit: "",
    applicablePropertyTypes: [],
    applicableBhk: [],
    inclusions: [],
    exclusions: [],
    materialSpecs: [],
    warranty: { woodworkYears: null, hardwareYears: null, civilYears: null },
    conditions: [],
    coverImage: "",
    branchIds: [],
    isActive: true,
    orderIndex,
  };
  const d = PRESET_DEFAULTS[name];
  if (!d) return base;
  const t = { ...toTable(base), ...d };
  if (materialHints.hardware && name !== "Essential") t.hardware = materialHints.hardware;
  return fromTable(base, t);
}

/** Rows a turned-on package must fill (competitor-flow §1: "1 package with its required table rows filled"). */
export function missingRows(t: TableModel, quoteOnly: boolean): string[] {
  const miss: string[] = [];
  if (!t.board) miss.push("Core board");
  if (!t.finish) miss.push("Finish");
  if (!t.hardware) miss.push("Hardware brand");
  if (t.warrantyYears == null) miss.push("Warranty");
  if (!quoteOnly && t.perSqft == null && BHKS.every((b) => t.fromBhk[b] == null)) miss.push("Price (₹/sq.ft or from ₹ by BHK)");
  return miss;
}
