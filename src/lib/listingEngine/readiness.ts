// Submission vs publication readiness from declarative rules.

import type { FormValues, ReadinessItem, ReadinessReport, ReadinessRule } from "./types";

export function computeReadiness<V extends FormValues>(rules: ReadinessRule<V>[], values: V): ReadinessReport {
  const items: ReadinessItem[] = [];
  let applicable = 0;
  let passed = 0;
  for (const rule of rules) {
    if (rule.appliesWhen && !rule.appliesWhen(values)) continue;
    let done = false;
    try {
      done = Boolean(rule.check(values));
    } catch {
      done = false;
    }
    applicable += 1;
    if (done) passed += 1;
    for (const level of rule.levels) {
      items.push({ id: `${rule.id}:${level}`, stepId: rule.stepId, label: rule.label, level, done, fieldPath: rule.fieldPath });
    }
  }
  const canSubmit = items.filter((i) => i.level === "SUBMIT").every((i) => i.done);
  // Publishing implies everything required to submit, plus the publish-only items.
  const canPublish = canSubmit && items.filter((i) => i.level === "PUBLISH").every((i) => i.done);
  const pct = applicable === 0 ? 0 : Math.round((passed / applicable) * 100);
  return { canSubmit, canPublish, items, pct };
}

/** Per-step status for the step rail: "done" | "todo" | "none" (no rules). */
export function stepReadinessStatus(report: ReadinessReport, stepId: string, level?: "SUBMIT" | "PUBLISH") {
  const own = report.items.filter((i) => i.stepId === stepId && (!level || i.level === level));
  if (!own.length) return "none" as const;
  return own.every((i) => i.done) ? ("done" as const) : ("todo" as const);
}
