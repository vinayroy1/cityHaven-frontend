import type { BuildingType, ConstructionService, Floors, InHouse, LeadStatus, StartWhen } from "./types";

/** Labels for option keys. Keys must match the backend construction.constants.ts. */
export const SERVICE_OPTIONS: { value: ConstructionService; label: string; hint: string; icon: string }[] = [
  { value: "TURNKEY", label: "Turnkey construction", hint: "Design, material & labour — keys at handover", icon: "🏠" },
  { value: "CIVIL_ONLY", label: "Civil / structure work", hint: "Foundation, RCC, brickwork, plaster", icon: "🧱" },
  { value: "LABOUR_ONLY", label: "Labour contract", hint: "Owner buys material, you supply labour", icon: "👷" },
  { value: "RENOVATION", label: "Renovation & extension", hint: "Repairs, additional floor, extensions", icon: "🔨" },
  { value: "ARCHITECTURE", label: "Architecture & drawings", hint: "Plans, elevation, structural design", icon: "📐" },
  { value: "COMMERCIAL", label: "Commercial buildings", hint: "Shops, offices, warehouses", icon: "🏢" },
  { value: "INTERIOR_FINISHING", label: "Finishing work", hint: "Flooring, false ceiling, painting", icon: "🎨" },
  { value: "WATERPROOFING", label: "Waterproofing", hint: "Roof, basement & bathroom waterproofing", icon: "💧" },
];

export const BUILDING_TYPE_OPTIONS: { value: BuildingType; label: string }[] = [
  { value: "INDEPENDENT_HOUSE", label: "Independent house" },
  { value: "DUPLEX_VILLA", label: "Duplex / villa" },
  { value: "BUILDER_FLOOR", label: "Builder floor" },
  { value: "APARTMENT_BUILDING", label: "Apartment building" },
  { value: "FARMHOUSE", label: "Farmhouse" },
  { value: "COMMERCIAL_BUILDING", label: "Commercial building" },
  { value: "WAREHOUSE_FACTORY", label: "Warehouse / factory" },
];

export const IN_HOUSE_OPTIONS: { value: InHouse; label: string }[] = [
  { value: "ARCHITECT", label: "Architect" },
  { value: "STRUCTURAL_ENGINEER", label: "Structural engineer" },
  { value: "SITE_SUPERVISOR", label: "Site supervisor" },
  { value: "OWN_LABOUR", label: "Own labour team" },
  { value: "OWN_MACHINERY", label: "Own machinery" },
  { value: "3D_ELEVATION", label: "3D elevation" },
  { value: "SOIL_TESTING", label: "Soil testing" },
  { value: "APPROVALS_SUPPORT", label: "Map / approval support" },
];

export const FLOOR_OPTIONS: { value: Floors; label: string }[] = [
  { value: "G", label: "Ground only" },
  { value: "G+1", label: "G+1" },
  { value: "G+2", label: "G+2" },
  { value: "G+3", label: "G+3" },
  { value: "G+4+", label: "G+4 or more" },
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
  { value: "SITE_VISIT", label: "Site visit", tone: "bg-amber-50 text-amber-700" },
  { value: "QUOTED", label: "Quoted", tone: "bg-violet-50 text-violet-700" },
  { value: "WON", label: "Won", tone: "bg-emerald-50 text-emerald-700" },
  { value: "LOST", label: "Lost", tone: "bg-slate-100 text-slate-600" },
];

/** Suggested package names and inclusions (owners edit them). */
export const PACKAGE_PRESETS = [
  { name: "Basic", ratePerSqft: 0, includes: ["Standard cement & TMT steel", "Red clay bricks", "Basic tiles & fittings"] },
  { name: "Standard", ratePerSqft: 0, includes: ["Branded cement & Fe550 TMT", "Vitrified tiles", "ISI electrical & plumbing"] },
  { name: "Premium", ratePerSqft: 0, includes: ["Premium cement & Fe550D TMT", "Large-format tiles / marble", "Premium sanitary & modular switches"] },
];

export const MATERIAL_GROUPS: { key: "cement" | "steel" | "bricks" | "electrical" | "plumbing" | "paint"; label: string; suggestions: string[] }[] = [
  { key: "cement", label: "Cement", suggestions: ["UltraTech", "ACC", "Ambuja", "Dalmia", "Shree", "JK Lakshmi"] },
  { key: "steel", label: "TMT steel", suggestions: ["Tata Tiscon", "JSW Neosteel", "SAIL", "Kamdhenu", "Jindal Panther", "Shyam"] },
  { key: "bricks", label: "Bricks / blocks", suggestions: ["Red clay bricks", "Fly ash bricks", "AAC blocks", "Concrete blocks"] },
  { key: "electrical", label: "Electrical", suggestions: ["Havells", "Polycab", "Finolex", "Anchor", "Legrand"] },
  { key: "plumbing", label: "Plumbing", suggestions: ["Supreme", "Astral", "Ashirvad", "Finolex", "Prince"] },
  { key: "paint", label: "Paint", suggestions: ["Asian Paints", "Berger", "Nippon", "Dulux"] },
];

export const label = <T extends string>(list: { value: T; label: string }[], v: T | null | undefined) =>
  list.find((o) => o.value === v)?.label ?? v ?? "";

export const formatRate = (n: number | null | undefined) => (n ? `₹${Math.round(n).toLocaleString("en-IN")}/sq.ft` : "");

export const constructionProfilePath = (p: { slug: string; city: string }) =>
  `/construction-companies/${encodeURIComponent(citySlug(p.city || "india"))}/${p.slug}`;
export const citySlug = (city: string) => city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
