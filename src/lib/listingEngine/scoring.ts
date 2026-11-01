// Completeness score: share of weighted, currently-visible fields that hold a value.

import { evaluateCondition, getValue } from "./conditions";
import type { FieldConfig, FormValues, PredicateRegistry, StepConfig } from "./types";

export const isFilledDeep = (value: unknown): boolean => {
  if (value === undefined || value === null || value === "") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(isFilledDeep);
  return true;
};

const fieldWeight = (field: FieldConfig, values: FormValues, p: PredicateRegistry): number => {
  if (typeof field.weight === "number") return field.weight;
  const required = field.required || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen, p) : false);
  return required ? 3 : 1;
};

export type ListingScore = { pct: number; filledWeight: number; totalWeight: number };

function scoreCustom(paths: string[] | undefined, weight: number | undefined, values: FormValues) {
  const list = paths ?? [];
  if (!list.length) return { filled: 0, total: 0 };
  const w = weight ?? list.length * 2;
  const filledCount = list.filter((p) => isFilledDeep(getValue(values, p))).length;
  return { filled: (w * filledCount) / list.length, total: w };
}

export function computeScore(
  steps: StepConfig[],
  values: FormValues,
  ctx: { predicates?: PredicateRegistry } = {},
): ListingScore {
  const p = ctx.predicates ?? {};
  let filledWeight = 0;
  let totalWeight = 0;
  for (const step of steps) {
    if (!evaluateCondition(values, step.visibleWhen, p)) continue;
    if (step.kind === "custom") {
      const s = scoreCustom(step.scorePaths, step.weight, values);
      filledWeight += s.filled;
      totalWeight += s.total;
      continue;
    }
    for (const section of step.sections ?? []) {
      if (!evaluateCondition(values, section.visibleWhen, p)) continue;
      if (section.kind === "custom") {
        const s = scoreCustom(section.scorePaths, section.weight, values);
        filledWeight += s.filled;
        totalWeight += s.total;
        continue;
      }
      for (const field of section.fields) {
        if (!evaluateCondition(values, field.visibleWhen, p)) continue;
        if (field.weight === 0) continue;
        const weight = fieldWeight(field, values, p);
        totalWeight += weight;
        if (isFilledDeep(getValue(values, field.id))) filledWeight += weight;
      }
    }
  }
  const pct = totalWeight === 0 ? 0 : Math.round((filledWeight / totalWeight) * 100);
  return { pct, filledWeight, totalWeight };
}
