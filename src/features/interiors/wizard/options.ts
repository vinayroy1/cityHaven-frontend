// Option lists for the interior wizard. Values that already exist in
// constants/interior-data.ts are reused verbatim so the directory filters and
// cards keep matching.

import type { Option } from "@/lib/listingEngine/types";
import {
  BOARD_BRANDS,
  BOARD_MATERIALS,
  COUNTERTOPS,
  DESIGN_STYLES,
  FINISH_BRANDS,
  FLOORING_AND_WALLS,
  HARDWARE_BRANDS,
  HARDWARE_FITTINGS,
  PRICING_UNITS,
  PROPERTY_TYPES,
  SERVICES_OFFERED,
  SURFACE_FINISHES,
} from "@/constants/interior-data";
import type {
  CredentialDocType,
  InteriorBranchType,
  MaterialCategory,
  RoomType,
  SupportChannel,
  WarrantyCategory,
} from "@/types/interior.types";

const toOptions = (list: readonly string[], group?: string): Option[] =>
  list.map((v) => ({ value: v, label: v, ...(group ? { group } : {}) }));

export const PROVIDER_TYPE_OPTIONS: Option[] = [
  { value: "INDIVIDUAL", label: "Individual designer", icon: "user", description: "Freelancer or solo studio — you are the face of the work." },
  { value: "COMPANY", label: "Company / Firm", icon: "building-2", description: "A registered business with a team, branches or a brand." },
];

export const TEAM_SIZE_OPTIONS: Option[] = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

const SERVICE_GROUP: Record<string, string> = {
  "Full Home Interior (Turnkey)": "Full home & turnkey",
  "Living Room Makeover": "Full home & turnkey",
  "Master Bedroom Luxury Suite": "Full home & turnkey",
  "Home Automation & Smart Lighting": "Full home & turnkey",
  "False Ceiling & Architectural Lighting": "Full home & turnkey",
  "Modular Kitchen Design & Install": "Modular kitchen & wardrobes",
  "Custom Wardrobes & Storage": "Modular kitchen & wardrobes",
  "Civil Structural & Flooring Work": "Renovation",
  "Bathroom Luxury Remodeling": "Renovation",
  "Commercial Office Interiors": "Commercial",
  "Retail Showroom & Restaurant Design": "Commercial",
  "3D Photorealistic Visualization & VR": "Design & consultation",
};

export const EXTRA_SERVICES = ["Design Consultation Only", "Renovation & Repainting"] as const;

export const SERVICE_OPTIONS: Option[] = [
  ...SERVICES_OFFERED.map((v) => ({ value: v, label: v, group: SERVICE_GROUP[v] ?? "Other" })),
  { value: "Renovation & Repainting", label: "Renovation & Repainting", group: "Renovation" },
  { value: "Design Consultation Only", label: "Design Consultation Only", group: "Design & consultation" },
];

export const PROPERTY_TYPE_OPTIONS: Option[] = [
  ...toOptions(PROPERTY_TYPES),
  { value: "Independent House", label: "Independent House" },
  { value: "Hospitality (Hotel / Restaurant)", label: "Hospitality (Hotel / Restaurant)" },
];

export const BHK_OPTIONS: Option[] = ["1RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"].map((v) => ({ value: v, label: v }));

export const BUDGET_SEGMENT_OPTIONS: Option[] = [
  { value: "ECONOMY", label: "Economy", description: "Value-focused, essential finishes" },
  { value: "MID_RANGE", label: "Mid-range", description: "Branded materials, balanced spend" },
  { value: "PREMIUM", label: "Premium", description: "Imported hardware, premium finishes" },
  { value: "LUXURY", label: "Luxury", description: "Bespoke design, top-end brands" },
];

export const DESIGN_STYLE_OPTIONS: Option[] = toOptions(DESIGN_STYLES);
export const MAX_DESIGN_STYLES = 8;

export const EXECUTION_CAPABILITY_OPTIONS: Option[] = toOptions([
  "In-house factory / modular unit",
  "In-house carpenters",
  "Civil & masonry team",
  "Electrical & plumbing team",
  "Project manager on site",
  "3D visualisation in-house",
]);

export const PRICING_UNIT_OPTIONS: Option[] = PRICING_UNITS.filter((u) => u.value !== "CUSTOM_QUOTATION").map((u) => ({
  value: u.value,
  label: u.label,
}));

export const PRICE_MODE_OPTIONS: Option[] = [
  { value: "STARTING_PRICE", label: "Show a starting price", description: "Clients see “from ₹X” on your card." },
  { value: "QUOTE_ONLY", label: "Custom quotation only", description: "Prices shown as “On request” after a site visit." },
];

export const PACKAGE_PRICING_MODE_OPTIONS: Option[] = [
  { value: "FIXED", label: "Fixed price" },
  { value: "RANGE", label: "Price range" },
  { value: "PER_UNIT", label: "Per unit (sq.ft / room)" },
];

export const PACKAGE_CATEGORY_OPTIONS: Option[] = toOptions(["Full Home", "Modular Kitchen", "Wardrobes", "Living Room", "Bedroom", "Renovation", "Commercial"]);

export const PACKAGE_PRESETS = [
  { key: "ESSENTIAL", label: "Essential", segment: "ECONOMY" },
  { key: "PREMIUM", label: "Premium", segment: "PREMIUM" },
  { key: "LUXURY", label: "Luxury", segment: "LUXURY" },
] as const;

export const BRANCH_TYPES: { value: InteriorBranchType; label: string }[] = [
  { value: "HEAD_OFFICE", label: "Head office" },
  { value: "BRANCH", label: "Branch office" },
  { value: "EXPERIENCE_CENTER", label: "Experience center" },
  { value: "DESIGN_STUDIO", label: "Design studio" },
  { value: "FACTORY", label: "Factory" },
  { value: "WAREHOUSE", label: "Warehouse" },
];
export const BRANCH_TYPE_OPTIONS: Option[] = BRANCH_TYPES.map((b) => ({ ...b }));

export const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string; materials: readonly string[]; brands: readonly string[] }[] = [
  { value: "BOARD", label: "Boards & plywood", materials: BOARD_MATERIALS, brands: BOARD_BRANDS },
  { value: "SURFACE_FINISH", label: "Surface finishes", materials: SURFACE_FINISHES, brands: FINISH_BRANDS },
  { value: "HARDWARE", label: "Hardware & fittings", materials: HARDWARE_FITTINGS, brands: HARDWARE_BRANDS },
  { value: "COUNTERTOP", label: "Countertops", materials: COUNTERTOPS, brands: [] },
  { value: "FLOORING", label: "Flooring", materials: FLOORING_AND_WALLS.filter((m) => /floor|tile|marble/i.test(m)), brands: [] },
  { value: "WALL_FINISH", label: "Walls & ceilings", materials: FLOORING_AND_WALLS.filter((m) => !/floor|tile|marble/i.test(m) || /wall/i.test(m)), brands: [] },
  { value: "LIGHTING", label: "Lighting", materials: [], brands: [] },
  { value: "SANITARY", label: "Sanitary & bath", materials: [], brands: [] },
  { value: "OTHER", label: "Other", materials: [], brands: [] },
];
export const MATERIAL_CATEGORY_OPTIONS: Option[] = MATERIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

/** One-tap quick-add chips for MaterialSpecTable (material · brand). */
export const MATERIAL_QUICK_ADD: { category: MaterialCategory; material: string; brand: string }[] = [
  { category: "BOARD", material: BOARD_MATERIALS[0], brand: "CenturyPly" },
  { category: "BOARD", material: BOARD_MATERIALS[2], brand: "Action TESA" },
  { category: "SURFACE_FINISH", material: SURFACE_FINISHES[0], brand: "Merino Laminates" },
  { category: "HARDWARE", material: HARDWARE_FITTINGS[0], brand: "Hettich (Germany)" },
  { category: "HARDWARE", material: HARDWARE_FITTINGS[1], brand: "Blum (Austria)" },
];

export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "LIVING", label: "Living room" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "MASTER_BEDROOM", label: "Master bedroom" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "KIDS_ROOM", label: "Kids room" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "DINING", label: "Dining" },
  { value: "POOJA", label: "Pooja room" },
  { value: "STUDY", label: "Study" },
  { value: "BALCONY", label: "Balcony" },
  { value: "FOYER", label: "Foyer" },
  { value: "OTHER", label: "Other" },
];
export const ROOM_TYPE_OPTIONS: Option[] = ROOM_TYPES.map((r) => ({ ...r }));

export const CONSULTATION_MODE_OPTIONS: Option[] = [
  { value: "ONLINE", label: "Online call" },
  { value: "IN_PERSON", label: "At studio / office" },
  { value: "SITE_VISIT", label: "Site visit" },
];

export const WARRANTY_CATEGORIES: { value: WarrantyCategory; label: string }[] = [
  { value: "WOODWORK", label: "Woodwork" },
  { value: "HARDWARE", label: "Hardware" },
  { value: "CIVIL", label: "Civil work" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "PAINT", label: "Paint" },
  { value: "APPLIANCES", label: "Appliances" },
  { value: "OTHER", label: "Other" },
];
export const WARRANTY_CATEGORY_OPTIONS: Option[] = WARRANTY_CATEGORIES.map((w) => ({ ...w }));

export const SUPPORT_CHANNELS: { value: SupportChannel; label: string }[] = [
  { value: "PHONE", label: "Phone" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
  { value: "IN_APP", label: "In-app chat" },
  { value: "SITE_VISIT", label: "Site visit" },
];
export const SUPPORT_CHANNEL_OPTIONS: Option[] = SUPPORT_CHANNELS.map((s) => ({ ...s }));

export const CREDENTIAL_DOC_TYPES: { value: CredentialDocType; label: string; for: ("INDIVIDUAL" | "COMPANY")[] }[] = [
  { value: "ID_PROOF", label: "Government ID proof", for: ["INDIVIDUAL"] },
  { value: "PAN", label: "PAN card", for: ["INDIVIDUAL", "COMPANY"] },
  { value: "DEGREE", label: "Design degree / diploma", for: ["INDIVIDUAL"] },
  { value: "COA_REG", label: "COA registration", for: ["INDIVIDUAL"] },
  { value: "IIID_MEMBERSHIP", label: "IIID membership", for: ["INDIVIDUAL"] },
  { value: "GST_CERT", label: "GST certificate", for: ["COMPANY"] },
  { value: "COI", label: "Certificate of incorporation", for: ["COMPANY"] },
  { value: "MSME", label: "MSME / Udyam certificate", for: ["COMPANY"] },
  { value: "TRADE_LICENSE", label: "Trade license", for: ["COMPANY"] },
  { value: "OTHER", label: "Other", for: ["INDIVIDUAL", "COMPANY"] },
];

export const LEAD_PREFERENCE_OPTIONS: Option[] = [
  { value: "CALL", label: "Phone call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
  { value: "ANY", label: "Any" },
];

export const WORKING_DAY_OPTIONS: Option[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => ({
  value: d,
  label: d.charAt(0) + d.slice(1).toLowerCase(),
}));

export const ACCEPTING_OPTIONS: Option[] = [
  { value: true, label: "Yes, taking new projects" },
  { value: false, label: "Not right now" },
];

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const INDIAN_PHONE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;
