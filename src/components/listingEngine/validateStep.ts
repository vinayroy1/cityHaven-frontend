// Step validation: config-required paths + optional zod schema (keyed by step id).

import type { ZodType } from "zod";
import type { FormValues, PredicateRegistry, StepConfig } from "@/lib/listingEngine/types";
import { missingRequiredForStep } from "@/lib/listingEngine/validation";

export type StepIssue = { path: string; message: string };

/**
 * Schemas may validate the whole form (issue paths are full dotted paths) or
 * just `values[stepId]` (paths relative to the slice). We try the whole form
 * first; if every issue points at a key the form doesn't have, we retry on the slice.
 */
export function zodIssues(schema: ZodType | undefined, values: FormValues, stepId: string): StepIssue[] {
  if (!schema) return [];
  const toIssues = (res: ReturnType<ZodType["safeParse"]>, prefix?: string): StepIssue[] =>
    res.success
      ? []
      : res.error.issues.map((i) => ({
          path: [prefix, ...i.path.map(String)].filter(Boolean).join(".") || stepId,
          message: i.message,
        }));
  const whole = schema.safeParse(values);
  if (whole.success) return [];
  const issues = toIssues(whole);
  const foreign = issues.every((i) => !(i.path.split(".")[0] in values));
  if (foreign && values[stepId] && typeof values[stepId] === "object") {
    return toIssues(schema.safeParse(values[stepId]), stepId);
  }
  return issues;
}

export function validateStep(
  step: StepConfig,
  values: FormValues,
  opts: { predicates?: PredicateRegistry; schema?: ZodType },
): StepIssue[] {
  const required = missingRequiredForStep(step, values, { predicates: opts.predicates }).map((f) => ({
    path: f.id,
    message: f.minItems && f.minItems > 1 ? `Add at least ${f.minItems}: ${f.label.toLowerCase()}` : `${f.label} is required`,
  }));
  const seen = new Set(required.map((r) => r.path));
  const schemaIssues = zodIssues(opts.schema, values, step.id).filter((i) => !seen.has(i.path));
  return [...required, ...schemaIssues];
}

/** Scroll a field (or the custom section that owns the path) into view and focus it. */
export function scrollToPath(path: string): boolean {
  if (typeof document === "undefined") return false;
  const esc = (s: string) => (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(s) : s.replace(/"/g, '\\"'));
  let el: Element | null = document.querySelector(`[data-field-path="${esc(path)}"]`);
  if (!el) el = document.querySelector(`[data-requires~="${esc(path)}"]`);
  if (!el) {
    // nested path (e.g. "pricing.packages.0.name") -> closest ancestor that is rendered
    const parts = path.split(".");
    while (!el && parts.length > 1) {
      parts.pop();
      const p = parts.join(".");
      el = document.querySelector(`[data-field-path="${esc(p)}"]`) ?? document.querySelector(`[data-requires~="${esc(p)}"]`);
    }
  }
  if (!el) return false;
  (el as HTMLElement).scrollIntoView?.({ behavior: "smooth", block: "center" });
  const focusable = el.querySelector<HTMLElement>("input:not([type=file]):not([disabled]), textarea, select, button:not([disabled])");
  focusable?.focus({ preventScroll: true });
  return true;
}
