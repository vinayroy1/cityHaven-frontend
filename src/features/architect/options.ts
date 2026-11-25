import type { ArchitectService, Bhk, BuildingType, Facing, Floors, LeadStatus, PackageUnit, ProviderType, StartWhen } from "./types";
import { cityDetailPath } from "@/lib/seo/countryPath";
import { formatMoney } from "@/lib/money";

/** Labels for option keys. Keys must match the backend architect.constants.ts. */

/** Only COA-registered architects may be called "Architect" (Architects Act 1972, s.37). */
export const PROVIDER_OPTIONS: { value: ProviderType; label: string; badge: string; hint: string; icon: string }[] = [
  { value: "ARCHITECT", label: "COA-registered architect", badge: "Architect", hint: "Registered with the Council of Architecture (COA number needed)", icon: "🏛️" },
  { value: "ENGINEER", label: "Civil / structural engineer", badge: "Civil engineer", hint: "B.E. / B.Tech / Diploma in civil engineering", icon: "📏" },
  { value: "DESIGNER", label: "Naksha & home planning designer", badge: "Naksha designer", hint: "Draftsman or planner making house plans and elevations", icon: "📐" },
];

export const SERVICE_OPTIONS: { value: ArchitectService; label: string; hint: string; icon: string }[] = [
  { value: "FLOOR_PLAN_2D", label: "2D naksha / floor plan", hint: "Room layout with measurements", icon: "📐" },
  { value: "ELEVATION_3D", label: "3D front elevation", hint: "Realistic view of the front of the house", icon: "🏠" },
  { value: "STRUCTURAL", label: "Structural drawings", hint: "Columns, beams, footing, slab design", icon: "🏗️" },
  { value: "WORKING_DRAWINGS", label: "Working drawings", hint: "Detailed drawings for the site team", icon: "📄" },
  { value: "MEP", label: "Electrical & plumbing", hint: "Wiring, points, water and drainage layout", icon: "💡" },
  { value: "APPROVAL_DRAWINGS", label: "Map approval drawings", hint: "Drawings for municipal / authority approval", icon: "✅" },
  { value: "VASTU_PLAN", label: "Vastu-compliant plan", hint: "Rooms placed as per vastu", icon: "🧭" },
  { value: "INTERIOR_LAYOUT", label: "Interior layout", hint: "Furniture and kitchen layout", icon: "🛋️" },
  { value: "LANDSCAPE", label: "Landscape design", hint: "Garden, lawn and outdoor areas", icon: "🌳" },
  { value: "SITE_SUPERVISION", label: "Site supervision", hint: "Visits during construction", icon: "👷" },
  { value: "ESTIMATE_BOQ", label: "Cost estimate / BOQ", hint: "Material quantities and budget", icon: "🧮" },
  { value: "RENOVATION_PLAN", label: "Renovation / extra floor", hint: "Plans for changes to an existing house", icon: "🔨" },
];

export const BUILDING_TYPE_OPTIONS: { value: BuildingType; label: string }[] = [
  { value: "INDEPENDENT_HOUSE", label: "Independent house" },
  { value: "DUPLEX_VILLA", label: "Duplex / villa" },
  { value: "BUILDER_FLOOR", label: "Builder floor" },
  { value: "APARTMENT_BUILDING", label: "Apartment building" },
  { value: "FARMHOUSE", label: "Farmhouse" },
  { value: "COMMERCIAL_BUILDING", label: "Commercial building" },
  { value: "SHOP_SHOWROOM", label: "Shop / showroom" },
  { value: "HOSPITAL_SCHOOL", label: "Hospital / school" },
  { value: "WAREHOUSE_FACTORY", label: "Warehouse / factory" },
];

export const FACING_OPTIONS: { value: Facing; label: string }[] = [
  { value: "EAST", label: "East facing" },
  { value: "WEST", label: "West facing" },
  { value: "NORTH", label: "North facing" },
  { value: "SOUTH", label: "South facing" },
  { value: "NORTH_EAST", label: "North-east facing" },
  { value: "NORTH_WEST", label: "North-west facing" },
  { value: "SOUTH_EAST", label: "South-east facing" },
  { value: "SOUTH_WEST", label: "South-west facing" },
];

export const FLOOR_OPTIONS: { value: Floors; label: string }[] = [
  { value: "G", label: "Ground only" },
  { value: "G+1", label: "G+1" },
  { value: "G+2", label: "G+2" },
  { value: "G+3", label: "G+3" },
  { value: "G+4+", label: "G+4 or more" },
];

export const BHK_OPTIONS: { value: Bhk; label: string }[] = [
  { value: "1BHK", label: "1 BHK" },
  { value: "2BHK", label: "2 BHK" },
  { value: "3BHK", label: "3 BHK" },
  { value: "4BHK", label: "4 BHK" },
  { value: "5BHK+", label: "5+ BHK" },
];

/** Common Indian plot sizes (width × depth in feet) for quick picks. */
export const PLOT_PRESETS: [number, number][] = [
  [20, 40],
  [25, 50],
  [30, 40],
  [30, 50],
  [30, 60],
  [40, 60],
  [50, 80],
];

export const START_WHEN_OPTIONS: { value: StartWhen; label: string }[] = [
  { value: "IMMEDIATE", label: "Immediately" },
  { value: "1_3_MONTHS", label: "In 1–3 months" },
  { value: "3_6_MONTHS", label: "In 3–6 months" },
  { value: "EXPLORING", label: "Just exploring" },
];

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string; tone: string }[] = [
  { value: "NEW", label: "New", tone: "bg-sky-50 text-sky-700" },
  { value: "CONTACTED", label: "Contacted", tone: "bg-indigo-50 text-indigo-700" },
  { value: "QUOTED", label: "Quoted", tone: "bg-violet-50 text-violet-700" },
  { value: "WON", label: "Won", tone: "bg-emerald-50 text-emerald-700" },
  { value: "LOST", label: "Lost", tone: "bg-slate-100 text-slate-600" },
];

export const UNIT_OPTIONS: { value: PackageUnit; label: string }[] = [
  { value: "PER_SQFT", label: "per sq.ft" },
  { value: "FIXED", label: "fixed price" },
];

/** Suggested packages (owners edit names, prices and inclusions). */
export const PACKAGE_PRESETS: { name: string; unit: PackageUnit; price: number; includes: string[] }[] = [
  { name: "Basic naksha", unit: "PER_SQFT", price: 0, includes: ["2D floor plan with measurements", "2 revisions", "PDF delivery"] },
  { name: "Naksha + 3D", unit: "PER_SQFT", price: 0, includes: ["2D floor plan", "3D front elevation", "Vastu check", "3 revisions"] },
  { name: "Complete set", unit: "PER_SQFT", price: 0, includes: ["2D plan & 3D elevation", "Structural drawings", "Electrical & plumbing layout", "Working drawings"] },
];

export const LANGUAGE_SUGGESTIONS = ["Hindi", "English", "Marathi", "Gujarati", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Punjabi", "Odia"];
export const QUALIFICATION_SUGGESTIONS = ["B.Arch", "M.Arch", "B.E. / B.Tech Civil", "M.E. / M.Tech Structural", "Diploma in Civil Engineering", "Draftsman (ITI)"];

export const label = <T extends string>(list: { value: T; label: string }[], v: T | null | undefined) =>
  list.find((o) => o.value === v)?.label ?? v ?? "";

/** Short public badge: "Architect" only for COA architects. */
export const providerBadge = (t: ProviderType | null | undefined) => PROVIDER_OPTIONS.find((o) => o.value === t)?.badge ?? "Naksha designer";

export const formatPrice = (n: number | null | undefined, unit: PackageUnit | null | undefined, countryCode?: string | null) =>
  !n ? "" : unit === "FIXED" ? formatMoney(Math.round(n), countryCode || "IN") : `${formatMoney(Math.round(n), countryCode || "IN")}/sq.ft`;

/** "30×40 ft (1,200 sq.ft)", "1,200 sq.ft" or "". */
export const plotLabel = (w?: number | null, d?: number | null, sqft?: number | null) => {
  const area = sqft || (w && d ? w * d : null);
  if (w && d) return `${w}×${d} ft${area ? ` (${area.toLocaleString("en-IN")} sq.ft)` : ""}`;
  return area ? `${area.toLocaleString("en-IN")} sq.ft` : "";
};

/** /architects[/cc]/city/slug: non-India profiles carry their country code (see countryPath). */
export const architectProfilePath = (p: { slug: string; city: string; countryCode?: string | null }) =>
  cityDetailPath("/architects", p.city, p.slug, p.countryCode);
export const citySlug = (city: string) => city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
