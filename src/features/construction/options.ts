import type { BuildingType, Certification, ConstructionService, EnquiryType, Floors, InfraSector, InHouse, LeadStatus, ProjectStatus, StartWhen, TurnoverBand } from "./types";
import { cityDetailPath } from "@/lib/seo/countryPath";
import { formatMoney, formatMoneyShort } from "@/lib/money";

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

/* ---------------- Infrastructure / government contractors ---------------- */

export const SECTOR_OPTIONS: { value: InfraSector; label: string; hint: string; icon: string }[] = [
  { value: "ROADS_HIGHWAYS", label: "Roads & highways", hint: "NH, SH, PMGSY, city roads", icon: "🛣️" },
  { value: "BRIDGES_FLYOVERS", label: "Bridges & flyovers", hint: "ROB, RUB, culverts, elevated roads", icon: "🌉" },
  { value: "HOSPITALS_HEALTHCARE", label: "Hospitals & healthcare", hint: "Medical colleges, PHCs, AIIMS blocks", icon: "🏥" },
  { value: "SCHOOLS_INSTITUTIONAL", label: "Schools & institutions", hint: "Schools, colleges, hostels, universities", icon: "🏫" },
  { value: "GOVT_BUILDINGS", label: "Government buildings", hint: "Offices, courts, police lines, quarters", icon: "🏛️" },
  { value: "WATER_SEWAGE", label: "Water supply & sewage", hint: "Pipelines, STP, WTP, Jal Jeevan", icon: "🚰" },
  { value: "IRRIGATION_DAMS", label: "Irrigation & dams", hint: "Canals, barrages, embankments", icon: "🌊" },
  { value: "RAILWAYS_METRO", label: "Railways & metro", hint: "Track, stations, civil works", icon: "🚆" },
  { value: "AIRPORTS_PORTS", label: "Airports & ports", hint: "Terminals, runways, jetties", icon: "✈️" },
  { value: "POWER_ELECTRICAL", label: "Power & electrical", hint: "Substations, transmission, solar", icon: "⚡" },
  { value: "INDUSTRIAL_EPC", label: "Industrial / EPC", hint: "Plants, factories, turnkey EPC", icon: "🏭" },
  { value: "URBAN_INFRA", label: "Urban infrastructure", hint: "Smart city, drains, parks, street lights", icon: "🏙️" },
  { value: "HOUSING_SCHEMES", label: "Housing schemes", hint: "PMAY, govt housing, townships", icon: "🏘️" },
];

export const TURNOVER_OPTIONS: { value: TurnoverBand; label: string }[] = [
  { value: "UNDER_5CR", label: "Under ₹5 Cr" },
  { value: "5_25CR", label: "₹5–25 Cr" },
  { value: "25_100CR", label: "₹25–100 Cr" },
  { value: "100_500CR", label: "₹100–500 Cr" },
  { value: "ABOVE_500CR", label: "Above ₹500 Cr" },
];

export const CERTIFICATION_OPTIONS: { value: Certification; label: string }[] = [
  { value: "ISO_9001", label: "ISO 9001 (Quality)" },
  { value: "ISO_14001", label: "ISO 14001 (Environment)" },
  { value: "ISO_45001", label: "ISO 45001 (Safety)" },
  { value: "CIDC", label: "CIDC graded" },
  { value: "MSME", label: "MSME / Udyam" },
  { value: "STARTUP_INDIA", label: "Startup India" },
];

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "COMPLETED", label: "Completed" },
  { value: "ONGOING", label: "Ongoing" },
];

export const ENQUIRY_TYPE_OPTIONS: { value: EnquiryType; label: string }[] = [
  { value: "PROJECT", label: "Execute a project for us" },
  { value: "SUBCONTRACT", label: "Subcontract work" },
  { value: "MATERIAL_SUPPLY", label: "Supply material" },
  { value: "JOINT_VENTURE", label: "Joint venture / tender partner" },
  { value: "EQUIPMENT_HIRE", label: "Hire / supply equipment" },
  { value: "JOB", label: "Job / work with you" },
  { value: "OTHER", label: "Something else" },
];

export const CLIENT_SUGGESTIONS = ["NHAI", "CPWD", "State PWD", "MoRTH", "PMGSY", "Indian Railways", "RVNL", "Metro Rail", "NBCC", "MES", "Municipal Corporation", "Smart City SPV", "Jal Jeevan Mission", "Health Department", "BSRDC", "NHIDCL"];
export const EQUIPMENT_SUGGESTIONS = ["Hot mix plant", "Wet mix plant", "Sensor paver", "Batching plant", "Transit mixers", "Excavators", "Motor grader", "Vibratory roller", "Tower crane", "Piling rig", "Boom placer"];

/** Rupee crore label, e.g. 120 → "₹120 Cr", 0.5 → "₹50 L". */
/** Values are stored in crore; outside India they are shown in the company's currency (₹1 Cr = 10,000,000). */
export const formatCr = (n: number | null | undefined, countryCode?: string | null) =>
  !n
    ? ""
    : countryCode && countryCode !== "IN"
      ? formatMoneyShort(n * 1e7, countryCode, { decimals: "trim" })
      : n < 1
        ? `₹${Math.round(n * 100)} L`
        : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Cr`;

export const isInfra = (p: { segment?: string | null } | null | undefined) => p?.segment === "INFRA";

export const label = <T extends string>(list: { value: T; label: string }[], v: T | null | undefined) =>
  list.find((o) => o.value === v)?.label ?? v ?? "";

export const formatRate = (n: number | null | undefined, countryCode?: string | null) =>
  n ? `${formatMoney(Math.round(n), countryCode || "IN")}/sq.ft` : "";

/** /construction-companies[/cc]/city/slug: non-India companies carry their country code (see countryPath). */
export const constructionProfilePath = (p: { slug: string; city: string; countryCode?: string | null }) =>
  cityDetailPath("/construction-companies", p.city, p.slug, p.countryCode);
export const citySlug = (city: string) => city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
