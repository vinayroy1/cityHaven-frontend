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

export function allRequiredPaths(steps: StepConfig[], values: FormValues): string[] {
  return steps.flatMap((s) => requiredPathsForStep(s, values));
}
