// Co-working centres: one listing (sub-category co-working-office-space) that sells several plans.
// Shared by the posting form, result cards and the detail page so labels and prices read the same
// everywhere. Mirrors awasio-backend src/modules/propertyListing/helpers/coworking.ts.

import { formatMoney } from "@/lib/money";

export const COWORKING_SUBCATEGORY_SLUG = "co-working-office-space";

export type PlanType =
  | "HOT_DESK"
  | "DEDICATED_DESK"
  | "PRIVATE_CABIN"
  | "MANAGED_OFFICE"
  | "DAY_PASS"
  | "MEETING_ROOM"
  | "VIRTUAL_OFFICE"
  | "FLEXI_PASS"
  | "EVENT_SPACE"
  | "STUDIO"
  | "OTHER";

export type PriceUnit = "PER_SEAT_MONTH" | "PER_CABIN_MONTH" | "PER_MONTH" | "PER_DAY" | "PER_HOUR" | "PER_YEAR";

export type CoworkingPlan = {
  type: PlanType;
  name?: string | null;
  /** null = price on request */
  price?: number | null;
  priceUnit?: PriceUnit | null;
  capacity?: number | null;
  unitsAvailable?: number | null;
  minSeats?: number | null;
  /** Flexi pass: days of access per month. */
  daysIncluded?: number | null;
  lockInMonths?: number | null;
  depositMonths?: number | null;
  isAvailable?: boolean | null;
};

export const PLAN_TYPES: { value: PlanType; label: string; hint: string; unit: PriceUnit; hasCapacity: boolean }[] = [
  { value: "HOT_DESK", label: "Hot desk", hint: "Any free seat in the open area", unit: "PER_SEAT_MONTH", hasCapacity: false },
  { value: "DEDICATED_DESK", label: "Dedicated desk", hint: "The same fixed seat every day", unit: "PER_SEAT_MONTH", hasCapacity: false },
  { value: "PRIVATE_CABIN", label: "Private cabin", hint: "Lockable room for a team", unit: "PER_SEAT_MONTH", hasCapacity: true },
  { value: "MANAGED_OFFICE", label: "Managed office", hint: "Private floor / suite run by the operator", unit: "PER_SEAT_MONTH", hasCapacity: true },
  { value: "DAY_PASS", label: "Day pass", hint: "Drop in for a day", unit: "PER_DAY", hasCapacity: false },
  { value: "FLEXI_PASS", label: "Flexi pass", hint: "A set number of days each month", unit: "PER_MONTH", hasCapacity: false },
  { value: "MEETING_ROOM", label: "Meeting room", hint: "Booked by the hour", unit: "PER_HOUR", hasCapacity: true },
  { value: "VIRTUAL_OFFICE", label: "Virtual office", hint: "Business address, mail & GST registration", unit: "PER_YEAR", hasCapacity: false },
  { value: "EVENT_SPACE", label: "Event space", hint: "Hall for workshops, trainings & launches", unit: "PER_DAY", hasCapacity: true },
  { value: "STUDIO", label: "Studio / phone booth", hint: "Podcast or video studio, private call booth", unit: "PER_HOUR", hasCapacity: true },
  { value: "OTHER", label: "Other", hint: "Anything else; give it a name below", unit: "PER_MONTH", hasCapacity: false },
];

export const planTypeMeta = (t: PlanType | string | null | undefined) =>
  PLAN_TYPES.find((p) => p.value === t) ?? PLAN_TYPES[0];

export const PRICE_UNITS: { value: PriceUnit; label: string; short: string }[] = [
  { value: "PER_SEAT_MONTH", label: "per seat / month", short: "/seat/mo" },
  { value: "PER_CABIN_MONTH", label: "per cabin / month", short: "/cabin/mo" },
  { value: "PER_MONTH", label: "per month", short: "/mo" },
  { value: "PER_DAY", label: "per day", short: "/day" },
  { value: "PER_HOUR", label: "per hour", short: "/hr" },
  { value: "PER_YEAR", label: "per year", short: "/yr" },
];

export const unitLabel = (u: PriceUnit | string | null | undefined, short = false) => {
  const m = PRICE_UNITS.find((x) => x.value === u);
  return m ? (short ? m.short : m.label) : "";
};

export const WORKSPACE_INCLUSIONS: { value: string; label: string }[] = [
  { value: "WIFI", label: "High-speed Wi-Fi" },
  { value: "POWER_BACKUP", label: "Power backup" },
  { value: "AC", label: "Air conditioning" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "TEA_COFFEE", label: "Tea & coffee" },
  { value: "PRINTING", label: "Printing" },
  { value: "MEETING_ROOM_CREDITS", label: "Meeting-room credits" },
  { value: "PHONE_BOOTHS", label: "Phone booths" },
  { value: "MAIL_HANDLING", label: "Mail handling" },
  { value: "LOCKERS", label: "Lockers" },
  { value: "PARKING", label: "Parking" },
  { value: "RECEPTION", label: "Reception" },
  { value: "SECURITY", label: "24h security / CCTV" },
  { value: "EVENTS", label: "Community events" },
];

export const inclusionLabel = (v: string) => WORKSPACE_INCLUSIONS.find((i) => i.value === v)?.label ?? v;

export const OPEN_DAYS: { value: string; label: string }[] = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

/** "₹9,000/seat/mo", or "Price on request". */
export function formatPlanPrice(price: number | null | undefined, unit: PriceUnit | string | null | undefined, currency = "INR", short = true) {
  if (price == null || price <= 0) return "Price on request";
  const sep = short ? "" : " ";
  return `${formatMoney(price, currency)}${sep}${unitLabel(unit, short)}`;
}

/** Monthly cost of one seat, the number renters compare (cabins priced per cabin are split by size). */
export function monthlySeatPrice(p: Pick<CoworkingPlan, "price" | "priceUnit" | "capacity">): number | null {
  if (p.price == null || p.price <= 0) return null;
  if (p.priceUnit === "PER_SEAT_MONTH") return p.price;
  if (p.priceUnit === "PER_CABIN_MONTH" && p.capacity && p.capacity > 0) return p.price / p.capacity;
  return null;
}

/** "Hot desk · Cabins 4–10 seats · Day pass": what a centre offers, for card subtitles. */
export function summarizePlans(plans: CoworkingPlan[] | null | undefined): string {
  const live = (plans ?? []).filter((p) => p.isAvailable !== false);
  const parts: string[] = [];
  for (const t of PLAN_TYPES) {
    const ofType = live.filter((p) => p.type === t.value);
    if (!ofType.length) continue;
    const caps = ofType.map((p) => p.capacity ?? 0).filter((n) => n > 0);
    if (t.value === "PRIVATE_CABIN" && caps.length) {
      const lo = Math.min(...caps);
      const hi = Math.max(...caps);
      parts.push(lo === hi ? `${lo}-seat cabin` : `Cabins ${lo}–${hi} seats`);
    } else {
      parts.push(t.label);
    }
  }
  return parts.join(" · ");
}

/** Opening hours line: "Open 24×7" or "Mon–Sat · 09:00–20:00". */
export function hoursLine(p: { open24x7?: boolean | null; openingTime?: string | null; closingTime?: string | null; openDays?: string[] | null }) {
  if (p.open24x7) return "Open 24×7";
  const days = (p.openDays ?? []).filter(Boolean);
  const order = OPEN_DAYS.map((d) => d.value);
  const sorted = order.filter((d) => days.includes(d));
  let dayText = "";
  if (sorted.length === 7) dayText = "All days";
  else if (sorted.length) {
    const idx = sorted.map((d) => order.indexOf(d));
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    const label = (d: string) => OPEN_DAYS.find((x) => x.value === d)?.label ?? d;
    dayText = contiguous && sorted.length > 2 ? `${label(sorted[0])}–${label(sorted[sorted.length - 1])}` : sorted.map(label).join(", ");
  }
  const time = p.openingTime && p.closingTime ? `${p.openingTime}–${p.closingTime}` : "";
  return [dayText, time].filter(Boolean).join(" · ");
}

export const isCoworkingListing = (p: {
  propertySubCategorySlug?: string | null;
  propertySubCategory?: { slug?: string | null } | null;
  officeType?: string | null;
  priceUnit?: string | null;
}) =>
  p.propertySubCategorySlug === COWORKING_SUBCATEGORY_SLUG ||
  p.propertySubCategory?.slug === COWORKING_SUBCATEGORY_SLUG ||
  p.officeType === "CO_WORKING";
