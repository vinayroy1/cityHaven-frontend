// State-wise stamp duty & registration charges for residential property sale deeds (2026-27).
// Compiled 24 Nov 2026 from two independent 2026 compilations and cross-checked:
//   A = Taxaj "Stamp Duty & Registration Charges State-Wise 2026-27" (updated 26 Oct 2026; cites G.O.s / dates)
//   B = DesiCalc "Stamp Duty Rates in India 2026: All 29 States" (updated 30 Oct 2026)
// `confidence`: "two-sources" = A and B agree; "single-source" = only B lists it; "conflicting" = A and B differ
// (we use the better-cited figure and say so on the page). Rates change by state notification; the page tells
// users to confirm with the sub-registrar / state IGR portal.

export type Buyer = "male" | "female" | "joint";
export type Confidence = "two-sources" | "single-source" | "conflicting";

export interface DutyLine {
  label: string;
  amount: number;
}

export interface DutyResult {
  stampDuty: number;
  stampRate: number;
  extras: DutyLine[];
  registration: number | null; // null = fixed / challan-based fee we don't compute
  registrationNote?: string;
  total: number;
  warnings: string[];
}

export interface StateDuty {
  slug: string;
  name: string;
  areas?: { id: string; label: string }[];
  /** Stamp duty % for this buyer / value / area. */
  stamp: (v: number, b: Buyer, area: string) => number;
  /** Other duties as % of value (transfer duty, surcharge, cess). */
  extras?: { label: string; rate: (v: number, b: Buyer, area: string, stampRate: number) => number }[];
  /** Registration: % of value with optional min/cap; or null with a note when it's a fixed fee band. */
  registration: { rate: (v: number, b: Buyer, area: string) => number; cap?: number; min?: number; fixed?: number } | null;
  registrationNote?: string;
  /** Summary table on the page. */
  summary: { men: string; women: string; joint: string; registration: string; other?: string };
  notes: string[];
  confidence: Confidence;
  sources: ("A" | "B")[];
}

const flat = (m: number, f: number = m, j: number = m) => (_v: number, b: Buyer) => (b === "female" ? f : b === "joint" ? j : m);
const pct = (r: number) => () => r;

export const SOURCES = {
  A: { label: "Taxaj, State-Wise Rates 2026-27 (updated 26 Oct 2026)", url: "https://www.taxaj.com/learn/stamp-duty-registration-charges-state-wise/" },
  B: { label: "DesiCalc, All States Comparison 2026 (updated 30 Oct 2026)", url: "https://desicalc.in/comparisons/stamp-duty-rates-all-states" },
} as const;

const STATES: StateDuty[] = [
  {
    slug: "andhra-pradesh",
    name: "Andhra Pradesh",
    stamp: pct(5),
    extras: [{ label: "Transfer duty (1.5%)", rate: () => 1.5 }],
    registration: { rate: pct(1) },
    summary: { men: "5%", women: "5%", joint: "5%", registration: "1%", other: "+1.5% transfer duty" },
    notes: ["No concession for women buyers.", "Duty is charged on the market value or the sale price, whichever is higher."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "arunachal-pradesh",
    name: "Arunachal Pradesh",
    stamp: pct(6),
    registration: { rate: pct(1) },
    summary: { men: "6%", women: "6%", joint: "6%", registration: "1%" },
    notes: ["Uniform rate; no concession for women buyers."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "assam",
    name: "Assam",
    stamp: flat(6, 5, 5.5),
    registration: { rate: (v) => (v > 500000 ? 8.5 : 0) },
    registrationNote: "Registration fee of 8.5% applies above ₹5 lakh.",
    summary: { men: "6%", women: "5%", joint: "5.5%", registration: "8.5% (above ₹5 lakh)" },
    notes: ["Assam's registration fee is among the highest in India."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "chhattisgarh",
    name: "Chhattisgarh",
    stamp: flat(5, 4, 4),
    registration: { rate: (_v, b) => (b === "male" ? 4 : 2) },
    summary: { men: "5%", women: "4%", joint: "4%", registration: "4% (women 2%)" },
    notes: ["Registration fee for women buyers was cut to 2% from 7 May 2026."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "delhi",
    name: "Delhi",
    // A: 6% men up to ₹25 lakh, 7% above (MCD areas); women 4% / 5%; joint 5% / 6%.
    stamp: (v, b) => {
      const hi = v > 2500000 ? 1 : 0;
      return (b === "female" ? 4 : b === "joint" ? 5 : 6) + hi;
    },
    registration: { rate: pct(1), fixed: 100 },
    registrationNote: "1% registration fee plus ₹100 pasting fee.",
    summary: { men: "6% (7% above ₹25 lakh)", women: "4% (5% above ₹25 lakh)", joint: "5% (6% above ₹25 lakh)", registration: "1% + ₹100" },
    notes: [
      "The extra 1% above ₹25 lakh is the MCD transfer duty in municipal areas.",
      "Duty is charged on the circle rate value or the sale price, whichever is higher.",
    ],
    confidence: "conflicting",
    sources: ["A", "B"],
  },
  {
    slug: "goa",
    name: "Goa",
    stamp: (v) => (v <= 5000000 ? 3 : v <= 7500000 ? 4 : v <= 10000000 ? 4.5 : v <= 50000000 ? 5 : 6),
    registration: null,
    registrationNote: "Registration fee is calculated on the GAURI e-challan; not included in the total.",
    summary: { men: "3–6% (by value)", women: "Same as men", joint: "Same as men", registration: "Calculated on GAURI e-challan" },
    notes: ["Slabs: 3% up to ₹50 lakh, 4% up to ₹75 lakh, 4.5% up to ₹1 crore, 5% up to ₹5 crore, 6% above.", "New slabs were notified in July 2026."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "gujarat",
    name: "Gujarat",
    stamp: pct(4.9),
    registration: { rate: (_v, b) => (b === "female" ? 0 : 1) },
    registrationNote: "Registration fee is waived for women buyers (sole or all-women joint).",
    summary: { men: "4.9%", women: "4.9%", joint: "4.9%", registration: "1% (waived for women)" },
    notes: ["4.9% includes the surcharge.", "Women buyers save the 1% registration fee."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "haryana",
    name: "Haryana",
    areas: [
      { id: "urban", label: "Urban (municipal area)" },
      { id: "rural", label: "Rural" },
    ],
    stamp: (_v, b, area) => {
      const urban = area !== "rural";
      if (b === "female") return urban ? 5 : 3;
      if (b === "joint") return urban ? 6 : 4;
      return urban ? 7 : 5;
    },
    registration: null,
    registrationNote: "Registration is a fixed fee by value band (₹100 up to ₹50,000 for ₹90 lakh and above), plus ₹200 HARIS fee; not included in the total.",
    summary: { men: "7% urban / 5% rural", women: "5% urban / 3% rural", joint: "6% urban / 4% rural", registration: "Fixed fee ₹100–₹50,000 by value" },
    notes: ["Women buyers pay 2% less than men."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "himachal-pradesh",
    name: "Himachal Pradesh",
    stamp: flat(6, 4, 5),
    registration: { rate: pct(2), cap: 25000 },
    summary: { men: "6%", women: "4%", joint: "5%", registration: "2% (cap ₹25,000)" },
    notes: [
      "The Indian Stamp (Himachal Pradesh Second Amendment) Bill, 2026 proposes 8% above ₹40 lakh (others) / ₹1 crore (women); it applies once notified.",
    ],
    confidence: "conflicting",
    sources: ["A", "B"],
  },
  {
    slug: "jharkhand",
    name: "Jharkhand",
    stamp: pct(4),
    registration: { rate: pct(3) },
    summary: { men: "4%", women: "4%", joint: "4%", registration: "3%" },
    notes: ["No concession for women buyers."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "karnataka",
    name: "Karnataka",
    areas: [
      { id: "urban", label: "Urban" },
      { id: "rural", label: "Rural" },
    ],
    stamp: pct(5),
    extras: [{ label: "Cess and surcharge on duty", rate: (_v, _b, area, s) => s * (area === "rural" ? 0.13 : 0.12) }],
    registration: { rate: pct(2) },
    summary: { men: "5% + cess (≈5.6%)", women: "Same as men", joint: "Same as men", registration: "2%", other: "Cess/surcharge ≈0.6%" },
    notes: [
      "Registration fee was raised from 1% to 2% on 31 August 2025.",
      "Lower 2% / 3% duty applies only to the first sale of a flat up to ₹45 lakh.",
      "Duty is charged on the guidance value or the sale price, whichever is higher.",
    ],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "kerala",
    name: "Kerala",
    stamp: pct(8),
    registration: { rate: pct(2) },
    summary: { men: "8%", women: "8%", joint: "8%", registration: "2%" },
    notes: ["No concession for women buyers."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "madhya-pradesh",
    name: "Madhya Pradesh",
    stamp: pct(7.5),
    registration: { rate: pct(3) },
    summary: { men: "7.5%", women: "7.5%", joint: "7.5%", registration: "3%" },
    notes: ["No concession for women buyers."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "maharashtra",
    name: "Maharashtra",
    areas: [
      { id: "mumbai", label: "Mumbai (MCGM)" },
      { id: "metro", label: "Pune, PCMC, Thane, Navi Mumbai, Nagpur" },
      { id: "municipal", label: "Other municipal areas" },
      { id: "gram", label: "Gram panchayat (rural)" },
    ],
    // Concession only when a woman is the sole buyer; joint pays the men's rate (A).
    stamp: (_v, b, area) => {
      const base = area === "mumbai" ? 6 : area === "metro" ? 7 : area === "municipal" ? 5 : 4;
      return b === "female" ? base - 1 : base;
    },
    registration: { rate: pct(1), cap: 30000 },
    summary: { men: "6% Mumbai · 7% Pune/Thane/Nagpur · 5% municipal · 4% rural", women: "1% less (sole woman buyer)", joint: "Same as men", registration: "1% (cap ₹30,000)" },
    notes: [
      "Rates include the 1% metro cess / local body tax where applicable.",
      "The 1% women's concession applies only when a woman is the sole buyer of a residential property.",
      "Duty is charged on the ready reckoner value or the sale price, whichever is higher.",
    ],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "manipur",
    name: "Manipur",
    stamp: pct(7),
    registration: { rate: pct(3), cap: 25000 },
    summary: { men: "7%", women: "7%", joint: "7%", registration: "3% (cap ₹25,000)" },
    notes: ["No concession for women buyers."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "meghalaya",
    name: "Meghalaya",
    stamp: pct(9.9),
    registration: { rate: pct(1.5) },
    summary: { men: "9.9%", women: "9.9%", joint: "9.9%", registration: "1.5%" },
    notes: ["SC/ST buyers get a 50% concession on duty and registration."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "mizoram",
    name: "Mizoram",
    stamp: pct(3),
    registration: { rate: pct(0.5), cap: 30000 },
    summary: { men: "3%", women: "3%", joint: "3%", registration: "0.5% (cap ₹30,000)" },
    notes: ["Widows get a 2.5% concession on stamp duty."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "nagaland",
    name: "Nagaland",
    stamp: pct(8.25),
    registration: { rate: pct(1) },
    summary: { men: "8.25%", women: "8.25%", joint: "8.25%", registration: "1%" },
    notes: ["No concession for women buyers."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "odisha",
    name: "Odisha",
    stamp: flat(5, 4, 4),
    registration: { rate: pct(2) },
    summary: { men: "5%", women: "4%", joint: "4%", registration: "2%" },
    notes: ["Women and any joint ownership that includes a woman pay 4%."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "punjab",
    name: "Punjab",
    stamp: flat(7, 5, 6),
    registration: { rate: pct(1), cap: 200000 },
    summary: { men: "7%", women: "5%", joint: "6%", registration: "1% (cap ₹2 lakh)" },
    notes: ["Rates include the 1% social infrastructure cess and 1% PIDB fee."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    stamp: flat(6, 5, 6),
    extras: [{ label: "Surcharge on duty", rate: (v, _b, _a, s) => s * (v > 1000000 ? 0.33 : 0.3) }],
    registration: { rate: pct(1), min: 100 },
    summary: { men: "6% + surcharge (≈8%)", women: "5% + surcharge (≈6.65%)", joint: "6% + surcharge", registration: "1%", other: "Surcharge 30–33% of duty" },
    notes: ["SC/ST/BPL women buyers pay a lower rate.", "Surcharge is 30% of the duty up to ₹10 lakh and 33% above."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "sikkim",
    name: "Sikkim",
    stamp: pct(1),
    registration: { rate: (_v, b) => (b === "female" ? 4 : 5) },
    summary: { men: "1%", women: "1%", joint: "1%", registration: "5% urban (women 4%)" },
    notes: ["Non-Sikkimese buyers pay 8% registration.", "Sources disagree on Sikkim's duty slabs; confirm before you pay."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "tamil-nadu",
    name: "Tamil Nadu",
    stamp: pct(7),
    registration: { rate: (v, b) => (b === "female" && v <= 1000000 ? 1 : 2) },
    summary: { men: "7%", women: "7%", joint: "7%", registration: "2% (women 1% up to ₹10 lakh)" },
    notes: ["Women buyers pay 1% registration where the guideline value is up to ₹10 lakh (G.O. (Ms) No. 77 of 2025, from 1 April 2025)."],
    confidence: "conflicting",
    sources: ["A", "B"],
  },
  {
    slug: "telangana",
    name: "Telangana",
    areas: [
      { id: "urban", label: "Urban" },
      { id: "rural", label: "Rural" },
    ],
    stamp: pct(5.5),
    extras: [{ label: "Transfer duty (1.5%)", rate: (_v, _b, area) => (area === "rural" ? 0 : 1.5) }],
    registration: { rate: (_v, _b, area) => (area === "rural" ? 2 : 0.5) },
    summary: { men: "5.5%", women: "5.5%", joint: "5.5%", registration: "0.5% urban / 2% rural", other: "+1.5% transfer duty (urban)" },
    notes: ["Market values were raised 25%–100% from 5 June 2026, so duty on most properties went up.", "No concession for women buyers."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "tripura",
    name: "Tripura",
    stamp: pct(5),
    registration: { rate: pct(1.5), fixed: 78 },
    summary: { men: "5%", women: "5%", joint: "5%", registration: "1.5% + ₹78" },
    notes: ["Registration fee revised in June 2025."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    stamp: (v, b) => (b === "female" ? (v <= 10000000 ? 6 : 7) : b === "joint" ? 6.5 : 7),
    registration: { rate: pct(1), min: 100 },
    summary: { men: "7%", women: "6% up to ₹1 crore", joint: "6.5%", registration: "1%" },
    notes: ["The women's 1% rebate now applies up to ₹1 crore (raised from ₹10 lakh by the cabinet decision of 22 July 2025)."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "uttarakhand",
    name: "Uttarakhand",
    stamp: (v, b) => (v > 2500000 ? 5 : b === "female" ? 3.75 : b === "joint" ? 4.37 : 5),
    registration: { rate: pct(2), cap: 50000 },
    summary: { men: "5%", women: "3.75% up to ₹25 lakh", joint: "4.37% up to ₹25 lakh", registration: "2% (cap ₹50,000)" },
    notes: ["The women's concession ends at ₹25 lakh."],
    confidence: "single-source",
    sources: ["B"],
  },
  {
    slug: "west-bengal",
    name: "West Bengal",
    areas: [
      { id: "urban", label: "Urban" },
      { id: "rural", label: "Rural" },
    ],
    stamp: (v, _b, area) => (area === "rural" ? (v <= 10000000 ? 5 : 6) : v <= 10000000 ? 6 : 7),
    registration: { rate: pct(1), min: 50 },
    summary: { men: "6% urban / 5% rural (+1% above ₹1 crore)", women: "Same as men", joint: "Same as men", registration: "1%" },
    notes: ["The 2% rebate that ended on 30 June 2024 has not been restored.", "No concession for women buyers."],
    confidence: "two-sources",
    sources: ["A", "B"],
  },
  {
    slug: "bihar",
    name: "Bihar",
    stamp: pct(7),
    extras: [{ label: "Municipal transfer duty (urban)", rate: (_v, _b, area) => (area === "rural" ? 0 : 2) }],
    areas: [
      { id: "urban", label: "Urban" },
      { id: "rural", label: "Rural" },
    ],
    registration: { rate: pct(2) },
    summary: { men: "7%", women: "Not confirmed", joint: "7%", registration: "2%", other: "+2% transfer duty (urban)" },
    notes: ["Our sources don't clearly state the women's rate; the calculator uses the standard rate. Confirm with the sub-registrar."],
    confidence: "single-source",
    sources: ["B"],
  },
];

export const STAMP_DUTY_STATES: StateDuty[] = [...STATES].sort((a, b) => a.name.localeCompare(b.name));

export const STAMP_DUTY_BY_SLUG = new Map(STAMP_DUTY_STATES.map((s) => [s.slug, s]));

export function computeDuty(s: StateDuty, value: number, buyer: Buyer, area: string): DutyResult {
  const v = Math.max(0, value || 0);
  const stampRate = s.stamp(v, buyer, area);
  const stampDuty = (v * stampRate) / 100;
  const extras = (s.extras ?? [])
    .map((e) => ({ label: e.label, amount: (v * e.rate(v, buyer, area, stampRate)) / 100 }))
    .filter((e) => e.amount > 0);
  let registration: number | null = null;
  if (s.registration) {
    let r = (v * s.registration.rate(v, buyer, area)) / 100;
    if (s.registration.min != null && r > 0) r = Math.max(r, s.registration.min);
    if (s.registration.cap != null) r = Math.min(r, s.registration.cap);
    registration = r + (s.registration.fixed ?? 0);
  }
  const warnings: string[] = [];
  if (s.confidence === "single-source") warnings.push("Only one of our sources lists this state's rates. Confirm with the sub-registrar before you pay.");
  if (s.confidence === "conflicting") warnings.push("Our sources differ on some figures for this state; we used the better-cited one. Confirm with the sub-registrar.");
  const total = stampDuty + extras.reduce((a, e) => a + e.amount, 0) + (registration ?? 0);
  return { stampDuty, stampRate, extras, registration, registrationNote: s.registrationNote, total, warnings };
}
