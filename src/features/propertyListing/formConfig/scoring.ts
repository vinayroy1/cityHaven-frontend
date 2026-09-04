// Listing completeness score — feeds the "Property Score" meter.
// Walks every config step, keeps only currently-visible fields, and returns
// the share of weighted fields that have a value.

import { evaluateCondition, getValue } from "./conditions";
import type { FieldConfig, FormValues, StepConfig } from "./types";

const isFilled = (value: unknown): boolean => {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(isFilled);
  return true;
};

const fieldWeight = (field: FieldConfig, values: FormValues): number => {
  if (typeof field.weight === "number") return field.weight;
  const required =
    field.required || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen) : false);
  return required ? 3 : 1;
};

export type ListingScore = {
  pct: number;
  filledWeight: number;
  totalWeight: number;
};

export function computeListingScore(steps: StepConfig[], values: FormValues): ListingScore {
  let filledWeight = 0;
  let totalWeight = 0;

  for (const step of steps) {
    if (step.kind === "custom") {
      // Location step: score its two key fields directly.
      totalWeight += 4;
      if (isFilled(getValue(values, "location.cityName"))) filledWeight += 2;
      if (isFilled(getValue(values, "location.locality"))) filledWeight += 2;
      continue;
    }
    for (const section of step.sections ?? []) {
      if (!evaluateCondition(values, section.visibleWhen)) continue;
      for (const field of section.fields) {
        if (!evaluateCondition(values, field.visibleWhen)) continue;
        const weight = fieldWeight(field, values);
        totalWeight += weight;
        if (isFilled(getValue(values, field.id))) filledWeight += weight;
      }
    }
  }

  const pct = totalWeight === 0 ? 0 : Math.round((filledWeight / totalWeight) * 100);
  return { pct, filledWeight, totalWeight };
}
