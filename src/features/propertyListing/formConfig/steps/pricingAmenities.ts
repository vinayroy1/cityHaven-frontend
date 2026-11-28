import { amenityOptions } from "../../constants";
import { preset } from "../conditions";
import { hideForCoworking } from "../coworkingScope";
import { paymentFrequencyOptions } from "../options";
import type { FieldConfig, Option, StepConfig } from "../types";

const money = (id: string, label: string, extra?: Partial<FieldConfig>): FieldConfig => {
  let defaultPlaceholder = "e.g. 10,000";
  if (id.includes("deposit")) defaultPlaceholder = "e.g. 50,000";
  else if (id.includes("maintenance")) defaultPlaceholder = "e.g. 2,500";
  else if (id.includes("bookingAmount")) defaultPlaceholder = "e.g. 1,00,000";
  else if (id.includes("membershipCharge")) defaultPlaceholder = "e.g. 5,000";
  else if (id.includes("annualDuesPayable")) defaultPlaceholder = "e.g. 10,000";
  else if (id.includes("expectedRental")) defaultPlaceholder = "e.g. 25,000";

  return {
    id,
    label,
    placeholder: extra?.placeholder ?? defaultPlaceholder,
    type: "number",
    min: 0,
    ...extra,
  };
};

// Amenities, grouped the way posters think about them (society, home, power, water, floor, view).
// Every group writes into the one amenities.amenityIds list, so saved listings are unchanged.
// Not offered: facing (own "Property facing" field), location advantages (found from the map),
// "Others" chips, and rarely used floor types (earlier picks of those are kept, just not shown).
const bySlug = new Map(amenityOptions.map((a) => [a.slug, a.label]));
const pick = (slugs: string[], labels: Record<string, string> = {}): Option[] =>
  slugs.filter((s) => bySlug.has(s)).map((s) => ({ value: s, label: labels[s] ?? bySlug.get(s)! }));
const AMENITY_ID = "amenities.amenityIds";

const amenityGroups: FieldConfig[] = [
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Society & building",
    type: "chip-multi",
    options: pick([
      "security-personnel", "visitor-parking", "park", "fitness-centre-gym", "swimming-pool",
      "club-house-community-center", "maintenance-staff", "water-storage", "rain-water-harvesting",
      "waste-disposal", "low-density-society",
    ], { "fitness-centre-gym": "Gym", "club-house-community-center": "Club house" }),
  },
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Inside the home",
    type: "chip-multi",
    options: pick([
      "centrally-air-conditioned", "internet-wifi-connectivity", "water-purifier", "security-fire-alarm",
      "private-garden-terrace", "false-ceiling-lighting", "high-ceiling-height", "recently-renovated",
      "natural-light", "spacious-interiors", "airy-rooms",
    ], { "centrally-air-conditioned": "Central AC", "internet-wifi-connectivity": "Wi-Fi ready", "security-fire-alarm": "Fire alarm" }),
  },
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Power backup",
    type: "chip-multi",
    exclusive: true,
    options: pick(["full-power-backup", "partial-power-backup", "no-power-backup"]),
  },
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Water supply",
    type: "chip-multi",
    options: pick(["24x7-water", "municipal-corporation", "borewell-tank"], { "municipal-corporation": "Municipal" }),
  },
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Flooring",
    type: "chip-multi",
    options: pick(["vitrified-flooring", "marble-flooring", "granite-flooring", "wood-flooring", "ceramic-flooring", "mosaic-flooring"]),
  },
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Overlooking",
    type: "chip-multi",
    options: pick(["park-garden-overlooking", "pool-overlooking", "club-overlooking", "main-road-overlooking"]),
  },
  {
    id: AMENITY_ID,
    hideOptionalTag: true,
    label: "Other features",
    type: "chip-multi",
    options: pick([
      "in-gated-society", "corner-property", "pet-friendly", "wheelchair-friendly",
      "feng-shui-vaastu-compliant", "separate-entry-servant-room", "no-open-drainage-around", "bank-attached-property",
    ], { "feng-shui-vaastu-compliant": "Vaastu compliant" }),
  },
];

const pricingAmenitiesBase: StepConfig = {
  id: "pricing",
  label: "Pricing & Amenities",
  title: "Pricing & other details",
  caption: "Commercials, brokerage & features",
  kind: "config",
  sections: [
    {
      id: "workspacePlans",
      title: "Workspace plans",
      requiredHint: "Add at least one plan",
      visibleWhen: preset("isCoworking"),
      fields: [{ id: "details.coworkingPlans", label: "Plans", type: "coworking-plans", required: true, weight: 4 }],
    },
    {
      id: "workspaceTerms",
      title: "Contract terms",
      mobileColumns: 2,
      visibleWhen: preset("isCoworking"),
      fields: [
        { id: "details.lockInMonths", label: "Minimum lock-in (months)", type: "number", min: 0, max: 120, placeholder: "e.g. 3" },
        { id: "details.noticePeriodDays", label: "Notice period (days)", type: "number", min: 0, max: 365, placeholder: "e.g. 30" },
        { id: "details.depositMonths", label: "Security deposit (months of rent)", type: "number", min: 0, max: 24, step: 0.5, placeholder: "e.g. 2" },
      ],
    },
    {
      id: "price",
      title: "Price details",
      fields: [
        // one price field per listing type, so the label matches Basic Details
        {
          id: "pricing.price",
          label: "Expected price (₹)",
          placeholder: "Expected price (e.g. 50,00,000)",
          type: "price",
          required: true,
          perUnitField: "pricing.pricePerSqFt",
          visibleWhen: preset("priceIsSell"),
        },
        {
          id: "pricing.price",
          label: "Monthly rent (₹)",
          placeholder: "Monthly rent (e.g. 25,000)",
          type: "price",
          required: true,
          visibleWhen: preset("priceIsRent"),
        },
        {
          id: "pricing.price",
          label: "Rent per bed / month (₹)",
          placeholder: "Rent per bed / month (e.g. 5,000)",
          type: "price",
          required: true,
          visibleWhen: preset("priceIsPgBed"),
        },
        {
          id: "pricing.price",
          label: "Monthly rent for room (₹)",
          placeholder: "Monthly room rent (e.g. 4,000)",
          type: "price",
          required: true,
          visibleWhen: preset("priceIsPgRoom"),
        },
        { id: "pricing.priceNegotiable", label: "Price negotiable", type: "checkbox" },
        { id: "pricing.allInclusivePrice", label: "All-inclusive price", type: "checkbox", visibleWhen: preset("isSell") },
        {
          id: "pricing.taxAndGovtExcluded",
          label: "Tax & govt charges excluded (e.g. GST added on top)",
          type: "checkbox",
          visibleWhen: { or: [preset("isSell"), preset("isCoworking")] },
        },
      ],
    },
    {
      id: "deposit",
      title: "Deposit & charges",
      collapsible: true,
      defaultCollapsed: false,
      visibleWhen: {
        or: [
          preset("showDeposit"),
          preset("showMaintenance"),
          preset("showBookingAmount"),
          preset("showSocietyCharges"),
          preset("showRentalYield"),
        ],
      },
      fields: [
        money("pricing.deposit", "Security deposit (₹)", { visibleWhen: preset("showDeposit") }),
        money("pricing.maintenance", "Maintenance (₹)", { visibleWhen: preset("showMaintenance") }),
        {
          id: "pricing.maintenancePaymentPeriod",
          label: "Maintenance frequency",
          type: "select",
          options: paymentFrequencyOptions,
          visibleWhen: preset("showMaintenance"),
        },
        money("pricing.bookingAmount", "Booking amount (₹)", { visibleWhen: preset("showBookingAmount") }),
        money("pricing.membershipCharge", "Membership charge (₹)", { visibleWhen: preset("showSocietyCharges") }),
        money("pricing.annualDuesPayable", "Annual dues payable (₹)", { visibleWhen: preset("showSocietyCharges") }),
        money("pricing.expectedRental", "Expected monthly rental (₹)", { visibleWhen: preset("showRentalYield") }),
      ],
    },
    {
      id: "brokerage",
      title: "Brokerage details",
      description: "Define your transaction fees for clients. Awasio does not charge any platform commission.",
      collapsible: false,
      visibleWhen: preset("showBrokerage"),
      fields: [
        {
          id: "pricing.brokerageBlock",
          label: "Brokerage terms",
          type: "brokerage",
        },
      ],
    },
    {
      id: "amenities",
      title: "Amenities & features",
      description: "Tap what applies. All optional.",
      fields: amenityGroups,
    },
  ],
};

export const pricingAmenitiesStep: StepConfig = {
  ...pricingAmenitiesBase,
  sections: hideForCoworking(pricingAmenitiesBase.sections ?? []),
};
