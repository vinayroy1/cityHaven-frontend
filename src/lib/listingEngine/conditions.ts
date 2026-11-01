// Condition evaluator. Predicates are injected per vertical (no global registry).

import type { Condition, FormValues, PredicateRegistry } from "./types";

export function getValue(obj: FormValues, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function evaluateCondition(
  values: FormValues,
  condition?: Condition,
  predicates: PredicateRegistry = {},
): boolean {
  if (!condition) return true;

  if ("preset" in condition) {
    const fn = predicates[condition.preset];
    if (!fn) {
      if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
        console.warn(`[listingEngine] unknown predicate preset: ${condition.preset}`);
      }
      return true;
    }
    return fn(values);
  }
  if ("not" in condition) return !evaluateCondition(values, condition.not, predicates);
  if ("and" in condition) return condition.and.every((c) => evaluateCondition(values, c, predicates));
  if ("or" in condition) return condition.or.some((c) => evaluateCondition(values, c, predicates));

  const actual = getValue(values, condition.field);
  if ("equals" in condition) return actual === condition.equals;
  if ("notEquals" in condition) return actual !== condition.notEquals;
  if ("in" in condition) return condition.in.includes(actual as never);
  if ("exists" in condition) {
    const present =
      actual !== undefined && actual !== null && actual !== "" && !(Array.isArray(actual) && actual.length === 0);
    return condition.exists ? present : !present;
  }
  if ("minItems" in condition) return (Array.isArray(actual) ? actual.length : 0) >= condition.minItems;
  const num = typeof actual === "number" ? actual : Number(actual);
  if (actual === null || actual === undefined || actual === "") return false;
  if ("gt" in condition) return Number.isFinite(num) && num > condition.gt;
  if ("gte" in condition) return Number.isFinite(num) && num >= condition.gte;
  if ("lt" in condition) return Number.isFinite(num) && num < condition.lt;
  if ("lte" in condition) return Number.isFinite(num) && num <= condition.lte;
  return true;
}

/** Convenience for configs: `preset("isCompany")`. */
export const preset = (name: string): Condition => ({ preset: name });
