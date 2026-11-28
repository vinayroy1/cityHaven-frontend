// What a co-working centre is NOT asked. Its plans (desks, cabins, passes) and the "Included in the
// price" list already cover these, or they are lease / residential questions that do not apply.
// One list here instead of a condition on every field, so the co-working flow stays short.

import { preset } from "./conditions";
import type { Condition, SectionConfig, StepConfig } from "./types";

/** Whole sections skipped for co-working. */
const HIDDEN_SECTIONS = new Set([
  "commercial", // meeting rooms, cabins, workstations, pantry, reception -> plans + inclusions
  "amenities", // residential amenity list (pool, servant room, flooring...) -> inclusions; "Nearby" is automatic
]);

/** Single fields skipped for co-working. */
const HIDDEN_FIELDS = new Set([
  "details.builtUpArea",
  "details.superBuiltUpArea",
  "details.staircases",
  "availability.availableFrom", // centres are open now; seats free is per plan
  "details.ageOfProperty",
  "amenities.fireNoc",
  "amenities.noOfParkings", // "Parking" is an inclusion
  "amenities.parkingAvailable",
  "amenities.privateParkingBasement",
  "amenities.privateParkingOutside",
  "amenities.publicParking",
  "amenities.multilevelParking",
]);

const notCoworking: Condition = { not: preset("isCoworking") };
const andNotCoworking = (c?: Condition): Condition => (c ? { and: [c, notCoworking] } : notCoworking);

export function hideForCoworking(sections: SectionConfig[]): SectionConfig[] {
  return sections.map((section) => ({
    ...section,
    visibleWhen: HIDDEN_SECTIONS.has(section.id) ? andNotCoworking(section.visibleWhen) : section.visibleWhen,
    fields: section.fields.map((field) =>
      HIDDEN_FIELDS.has(field.id) ? { ...field, visibleWhen: andNotCoworking(field.visibleWhen) } : field,
    ),
  }));
}

// ---- Wording: shared step / section / field text is written for homes; co-working gets its own. ----

const STEP_TEXT: Record<string, { title?: string; caption?: string }> = {
  profile: { title: "Tell us about your centre", caption: "Seats, hours & what's included" },
  features: { title: "Building details", caption: "Building, safety & lift" },
  pricing: { title: "Plans & pricing", caption: "Plans, prices & terms" },
};

const SECTION_TITLE: Record<string, string> = {
  society: "Building",
  legal: "Safety",
  liftsParking: "Lift",
  price: "Price terms",
};

const FIELD_LABEL: Record<string, string> = {
  "location.societyOrProjectName": "Building / tech park name",
  "pricing.taxAndGovtExcluded": "Prices exclude GST / taxes",
  "context.postedAs": "Who is listing this centre?",
};

/** Co-working copies of the steps with their own wording (ids and logic unchanged). */
export function withCoworkingText(steps: StepConfig[]): StepConfig[] {
  return steps.map((step) => ({
    ...step,
    ...(STEP_TEXT[step.id] ?? {}),
    sections: step.sections?.map((section) => ({
      ...section,
      title: SECTION_TITLE[section.id] ?? section.title,
      fields: section.fields.map((field) => (FIELD_LABEL[field.id] ? { ...field, label: FIELD_LABEL[field.id] } : field)),
    })),
  }));
}
