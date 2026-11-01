// Derives required field paths from config + current values.

import { evaluateCondition, getValue } from "./conditions";
import type { CustomRequirement, FieldConfig, FormValues, PredicateRegistry, SectionConfig, StepConfig } from "./types";

export type ValidationCtx = { predicates?: PredicateRegistry };

export type RequiredFieldMeta = {
  id: string;
  label: string;
  sectionTitle?: string;
  minItems?: number;
};

const isRequired = (field: FieldConfig, values: FormValues, p: PredicateRegistry) =>
  Boolean(field.required) || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen, p) : false);

const customReqs = (
  reqs: CustomRequirement[] | undefined,
  values: FormValues,
  p: PredicateRegistry,
  sectionTitle?: string,
): RequiredFieldMeta[] =>
  (reqs ?? [])
    .filter((r) => evaluateCondition(values, r.when, p))
    .map((r) => ({ id: r.path, label: r.label, sectionTitle, minItems: r.minItems }));

export function isSectionVisible(section: SectionConfig, values: FormValues, ctx: ValidationCtx = {}): boolean {
  return evaluateCondition(values, section.visibleWhen, ctx.predicates);
}

export function isStepVisible(step: StepConfig, values: FormValues, ctx: ValidationCtx = {}): boolean {
  return evaluateCondition(values, step.visibleWhen, ctx.predicates);
}

export function getRequiredFieldsForStep(
  step: StepConfig,
  values: FormValues,
  ctx: ValidationCtx = {},
): RequiredFieldMeta[] {
  const p = ctx.predicates ?? {};
  if (!isStepVisible(step, values, ctx)) return [];
  if (step.kind === "custom") return customReqs(step.requires, values, p, step.title);
  const result: RequiredFieldMeta[] = [];
  for (const section of step.sections ?? []) {
    if (!evaluateCondition(values, section.visibleWhen, p)) continue;
    if (section.kind === "custom") {
      result.push(...customReqs(section.requires, values, p, section.title));
      continue;
    }
    for (const field of section.fields) {
      if (!evaluateCondition(values, field.visibleWhen, p)) continue;
      if (isRequired(field, values, p)) result.push({ id: field.id, label: field.label, sectionTitle: section.title });
    }
  }
  return result;
}

export function requiredPathsForStep(step: StepConfig, values: FormValues, ctx: ValidationCtx = {}): string[] {
  return getRequiredFieldsForStep(step, values, ctx).map((f) => f.id);
}

export function allRequiredPaths(steps: StepConfig[], values: FormValues, ctx: ValidationCtx = {}): string[] {
  return steps.flatMap((s) => requiredPathsForStep(s, values, ctx));
}

export function isValueFilled(cur: unknown, minItems?: number): boolean {
  if (cur === undefined || cur === null || cur === "") return false;
  if (typeof cur === "string") return cur.trim().length > 0;
  if (typeof cur === "number") return Number.isFinite(cur);
  if (Array.isArray(cur)) return cur.length >= (minItems ?? 1);
  return true;
}

export function isFieldFilled(values: FormValues, path: string, minItems?: number): boolean {
  return isValueFilled(getValue(values, path), minItems);
}

/** Required fields of a step that are still empty. */
export function missingRequiredForStep(
  step: StepConfig,
  values: FormValues,
  ctx: ValidationCtx = {},
): RequiredFieldMeta[] {
  return getRequiredFieldsForStep(step, values, ctx).filter((f) => !isFieldFilled(values, f.id, f.minItems));
}
