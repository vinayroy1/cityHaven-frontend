// Derives the list of field paths to validate for a given step, based on which
// sections/fields are currently visible and required. Replaces the old static
// `stepValidations` map (which drifted out of sync with the rendered fields).

import { evaluateCondition } from "./conditions";
import type { FormValues, StepConfig } from "./types";

export function requiredPathsForStep(step: StepConfig, values: FormValues): string[] {
  if (step.kind === "custom") {
    // Location step — enforced by the bespoke component, but gate on the essentials.
    return ["location.cityName", "location.locality"];
  }
  const paths: string[] = [];
  for (const section of step.sections ?? []) {
    if (!evaluateCondition(values, section.visibleWhen)) continue;
    for (const field of section.fields) {
      if (!evaluateCondition(values, field.visibleWhen)) continue;
      const required =
        field.required || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen) : false);
      if (required) paths.push(field.id);
    }
  }
  return paths;
}

/** Visible `requireAny` sections with none of their visible fields filled; returns their first field (to focus). */
export function unmetAnySections(step: StepConfig, values: FormValues): RequiredFieldMeta[] {
  if (step.kind === "custom") return [];
  const result: RequiredFieldMeta[] = [];
  for (const section of step.sections ?? []) {
    if (!section.requireAny || !evaluateCondition(values, section.visibleWhen)) continue;
    const visible = section.fields.filter((f) => evaluateCondition(values, f.visibleWhen));
    if (visible.length && !visible.some((f) => isFieldFilled(values, f.id))) {
      result.push({ id: visible[0].id, label: section.requiredHint ?? `Fill one of: ${section.title ?? section.id}`, sectionTitle: section.title });
    }
  }
  return result;
}

export function allRequiredPaths(steps: StepConfig[], values: FormValues): string[] {
  return steps.flatMap((s) => requiredPathsForStep(s, values));
}

export type RequiredFieldMeta = {
  id: string;
  label: string;
  sectionTitle?: string;
};

export function getRequiredFieldsForStep(step: StepConfig, values: FormValues): RequiredFieldMeta[] {
  if (step.kind === "custom") {
    return [
      { id: "location.cityName", label: "City" },
      { id: "location.locality", label: "Locality" },
    ];
  }
  const result: RequiredFieldMeta[] = [];
  for (const section of step.sections ?? []) {
    if (!evaluateCondition(values, section.visibleWhen)) continue;
    for (const field of section.fields) {
      if (!evaluateCondition(values, field.visibleWhen)) continue;
      const required =
        field.required || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen) : false);
      if (required) {
        result.push({
          id: field.id,
          label: field.label,
          sectionTitle: section.title,
        });
      }
    }
  }
  return result;
}

export function isFieldFilled(values: FormValues, path: string): boolean {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = values;
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return false;
    cur = cur[part];
  }
  if (cur === undefined || cur === null || cur === "") return false;
  if (typeof cur === "string") return cur.trim().length > 0;
  if (Array.isArray(cur)) return cur.length > 0;
  return true;
}
