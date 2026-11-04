/** Standard (international) area units. Value = square metres in one unit. */
export type AreaUnit = { key: string; name: string; plural: string; short: string; sqm: number };

export const AREA_UNITS: AreaUnit[] = [
  { key: "sq-ft", name: "Square Foot", plural: "Square Feet", short: "sq ft", sqm: 0.09290304 },
  { key: "sq-m", name: "Square Metre", plural: "Square Metres", short: "sq m", sqm: 1 },
  { key: "sq-yd", name: "Square Yard", plural: "Square Yards", short: "sq yd", sqm: 0.83612736 },
  { key: "sq-in", name: "Square Inch", plural: "Square Inches", short: "sq in", sqm: 0.00064516 },
  { key: "acre", name: "Acre", plural: "Acres", short: "acre", sqm: 4046.8564224 },
  { key: "hectare", name: "Hectare", plural: "Hectares", short: "ha", sqm: 10000 },
  { key: "are", name: "Are", plural: "Ares", short: "a", sqm: 100 },
  { key: "sq-km", name: "Square Kilometre", plural: "Square Kilometres", short: "sq km", sqm: 1_000_000 },
  { key: "sq-mile", name: "Square Mile", plural: "Square Miles", short: "sq mi", sqm: 2_589_988.110336 },
];

export const unitByKey = (k: string) => AREA_UNITS.find((u) => u.key === k);

export const convertArea = (value: number, from: AreaUnit, to: AreaUnit) => (value * from.sqm) / to.sqm;

/** Human-friendly number: up to 6 significant digits, Indian grouping, scientific only for extremes. */
export function fmtArea(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(4);
  const digits = abs >= 1 ? Math.max(0, 6 - Math.floor(Math.log10(abs)) - 1) : 8;
  return n.toLocaleString("en-IN", { maximumFractionDigits: Math.min(digits, 8) });
}

export const pairSlug = (a: AreaUnit, b: AreaUnit) => `${a.key}-to-${b.key}`;

export function parsePair(slug: string): [AreaUnit, AreaUnit] | null {
  const m = slug.split("-to-");
  if (m.length !== 2) return null;
  const a = unitByKey(m[0]);
  const b = unitByKey(m[1]);
  return a && b && a !== b ? [a, b] : null;
}

export const ALL_PAIRS: Array<[AreaUnit, AreaUnit]> = AREA_UNITS.flatMap((a) =>
  AREA_UNITS.filter((b) => b !== a).map((b) => [a, b] as [AreaUnit, AreaUnit]),
);

/** Most searched pairs in India, shown as quick links. */
export const POPULAR_PAIRS = [
  "sq-ft-to-sq-m", "sq-m-to-sq-ft", "acre-to-sq-ft", "sq-ft-to-acre", "acre-to-hectare", "hectare-to-acre",
  "sq-yd-to-sq-ft", "sq-ft-to-sq-yd", "sq-m-to-sq-yd", "hectare-to-sq-m", "acre-to-sq-m", "sq-km-to-acre",
];
