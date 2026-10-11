// Shared option lists for the listing form config, aligned to backend enums
// (src/constants/backend-schema.ts).

import { BACKEND_ENUMS } from "@/constants/backend-schema";
import type { Option } from "./types";

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const enumOptions = (name: keyof typeof BACKEND_ENUMS, labels?: Record<string, string>): Option[] =>
  BACKEND_ENUMS[name].map((value) => ({ value, label: labels?.[value] ?? titleCase(value) }));

export const areaUnitOptions: Option[] = enumOptions("AreaUnit", {
  SQ_FT: "sq.ft.",
  SQ_M: "sq.m.",
  BIGHA: "bigha",
  KOTTAH: "kottah",
  GROUNDS: "grounds",
  ARES: "ares",
  BISWA: "biswa",
  GUNTHA: "guntha",
  AANKADAM: "aankadam",
  HECTARES: "hectares",
  CENTS: "cents",
  PERCH: "perch",
});

export const lengthUnitOptions: Option[] = enumOptions("MeasurementUnit", { FEET: "ft.", METER: "m." });

export const furnishingOptions: Option[] = enumOptions("FurnishingType", {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FULLY_FURNISHED: "Fully furnished",
});

export const facingOptions: Option[] = enumOptions("Facing");

export const availabilityStatusOptions: Option[] = enumOptions("AvailabilityStatus", {
  READY_TO_MOVE: "Ready to move",
  UNDER_CONSTRUCTION: "Under construction",
  POSSESSION_SOON: "Possession soon",
  NEW_LAUNCH: "New launch",
});

export const ageOfPropertyOptions: Option[] = enumOptions("AgeOfProperty", {
  ZERO_TO_ONE: "0-1 years",
  ONE_TO_FIVE: "1-5 years",
  FIVE_TO_TEN: "5-10 years",
  TEN_PLUS: "10+ years",
});

export const ownershipOptions: Option[] = enumOptions("OwnershipType", {
  FREEHOLD: "Freehold",
  LEASEHOLD: "Leasehold",
  CO_OPERATIVE: "Co-operative society",
});

export const paymentFrequencyOptions: Option[] = enumOptions("PaymentFrequency", {
  ONE_TIME: "One time",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half yearly",
  ANNUALLY: "Annually",
});

export const possessionByOptions: Option[] = enumOptions("PossessionType", {
  WITHIN_3_MONTHS: "Within 3 months",
  WITHIN_6_MONTHS: "Within 6 months",
  BY_2027: "By 2027",
  BY_2028: "By 2028",
  BY_2029: "By 2029",
});

export const monthOptions: Option[] = enumOptions("Months");

export const floorOptions: Option[] = BACKEND_ENUMS.PropertyOnFloor.map((value) => ({
  value,
  label: value.startsWith("FLOOR_") ? value.replace("FLOOR_", "Floor ") : titleCase(value),
}));

export const kitchenTypeOptions: Option[] = [
  { value: "MODULAR", label: "Modular" },
  { value: "SEMI_MODULAR", label: "Semi-modular" },
  { value: "NORMAL", label: "Normal" },
];

export const constructionTypeOptions: Option[] = [
  { value: "RCC", label: "RCC frame structure" },
  { value: "LOAD_BEARING", label: "Load bearing" },
  { value: "STEEL_FRAME", label: "Steel frame" },
  { value: "PRECAST", label: "Precast" },
  { value: "OTHER", label: "Other" },
];

export const pgForOptions: Option[] = [
  { value: "BOYS", label: "Boys Only" },
  { value: "GIRLS", label: "Girls Only" },
  { value: "UNISEX", label: "Co-ed / Anyone" },
];

export const accommodationTypeOptions: Option[] = [
  { value: "LODGE", label: "Lodge / Student Rooms" },
  { value: "PG", label: "Paying Guest (PG)" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "STUDENT_ROOM", label: "Independent Room for Students" },
];

export const pricingBasisOptions: Option[] = [
  { value: "PER_BED", label: "Bed / Seat Wise" },
  { value: "PER_ROOM", label: "Entire Room Wise" },
];

export const foodOptionOptions: Option[] = [
  { value: "INCLUDED", label: "Food / Meals Included in Rent" },
  { value: "OPTIONAL_MESS", label: "Optional Mess Available (Extra Charge)" },
  { value: "SELF_COOKING", label: "Self Cooking Allowed (Kitchen / Gas Provided)" },
  { value: "NO_FOOD", label: "No Food / Outside Tiffin Allowed" },
];

export const electricityTypeOptions: Option[] = [
  { value: "INCLUDED", label: "Electricity Included in Rent" },
  { value: "SUB_METER", label: "Sub-Meter (As per reading ₹/unit)" },
  { value: "FIXED_MONTHLY", label: "Fixed Monthly Surcharge" },
];

export const gateClosingTimeOptions: Option[] = [
  { value: "NO_RESTRICTION", label: "No Curfew / 24x7 Entry" },
  { value: "08:00_PM", label: "8:00 PM" },
  { value: "09:00_PM", label: "9:00 PM" },
  { value: "09:30_PM", label: "9:30 PM" },
  { value: "10:00_PM", label: "10:00 PM" },
  { value: "10:30_PM", label: "10:30 PM" },
  { value: "11:00_PM", label: "11:00 PM" },
];

export const mealTypeOptions: Option[] = [
  { value: "BREAKFAST", label: "Breakfast Only" },
  { value: "DINNER", label: "Dinner Only" },
  { value: "BOTH", label: "Breakfast & Dinner" },
  { value: "ALL_MEALS", label: "All 3 Meals (Breakfast, Lunch & Dinner)" },
];

export const sharingTypeOptions: Option[] = [
  { value: "SINGLE", label: "1 Sharing (Single Seater)" },
  { value: "DOUBLE", label: "2 Sharing (Double Seater)" },
  { value: "TRIPLE", label: "3 Sharing (Triple Seater)" },
  { value: "QUAD", label: "4+ Sharing (Dormitory/Hall)" },
];

export const washroomTypeOptions: Option[] = [
  { value: "PRIVATE", label: "Private" },
  { value: "PUBLIC", label: "Public / shared" },
  { value: "NONE", label: "Not available" },
];

export const pantryTypeOptions: Option[] = [
  { value: "PRIVATE", label: "Private" },
  { value: "SHARED", label: "Shared" },
  { value: "NONE", label: "Not available" },
];

export const officeTypeOptions: Option[] = [
  { value: "PRIVATE", label: "Private office" },
  { value: "CO_WORKING", label: "Co-working" },
  { value: "MANAGED", label: "Managed office" },
];

export const qualityRatingOptions: Option[] = [
  { value: "NO_RATING", label: "No rating" },
  ...Array.from({ length: 7 }, (_, i) => ({ value: `${i + 1}_STAR`, label: `${i + 1} star` })),
];

// Furnishing items with per-mode visibility (from the old propertyDetails config).
export const furnishingItems: { key: string; label: string; modes: string[] }[] = [
  { key: "wardrobe", label: "Wardrobe", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "bed", label: "Bed", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "sofa", label: "Sofa", modes: ["FULLY_FURNISHED"] },
  { key: "diningTable", label: "Dining table", modes: ["FULLY_FURNISHED"] },
  { key: "tv", label: "TV", modes: ["FULLY_FURNISHED"] },
  { key: "refrigerator", label: "Refrigerator", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "washingMachine", label: "Washing machine", modes: ["FULLY_FURNISHED"] },
  { key: "geyser", label: "Geyser", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "modularKitchen", label: "Modular kitchen", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "chimney", label: "Chimney", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "curtains", label: "Curtains", modes: ["FULLY_FURNISHED"] },
  { key: "exhaustFan", label: "Exhaust fan", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "lights", label: "Lights", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "fans", label: "Fans", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "ac", label: "AC", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
];

export const otherRoomsOptions: Option[] = [
  { value: "POOJA_ROOM", label: "Pooja Room" },
  { value: "STUDY_ROOM", label: "Study Room" },
  { value: "SERVANT_ROOM", label: "Servant Room" },
  { value: "STORE_ROOM", label: "Store Room" },
];

export const fireSafetyOptions: Option[] = [
  { value: "FIRE_EXTINGUISHER", label: "Fire extinguisher" },
  { value: "FIRE_SENSORS", label: "Fire sensors" },
  { value: "SPRINKLERS", label: "Sprinklers" },
  { value: "FIRE_HOSE", label: "Fire hose" },
];

export const businessUseOptions: Option[] = [
  { value: "IT", label: "IT / ITES" },
  { value: "RETAIL", label: "Retail" },
  { value: "CLINIC", label: "Clinic" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "CAFE", label: "Cafe / Restaurant" },
  { value: "OTHER", label: "Other" },
];

export const locatedNearOptions: Option[] = [
  { value: "ENTRANCE", label: "Entrance" },
  { value: "ELEVATOR", label: "Elevator" },
  { value: "STAIRS", label: "Stairs" },
];

export const constructionStatusOptions: Option[] = [
  { value: "READY_TO_MOVE", label: "Ready to move" },
  { value: "UNDER_CONSTRUCTION", label: "Under construction" },
];
