import { Condition, FormValues } from "../config/types";

export function evaluateCondition(values: FormValues, condition?: Condition): boolean {
  if (!condition) return true;

  if ("field" in condition && "equals" in condition) {
    return getValue(values, condition.field) === condition.equals;
  }
  if ("field" in condition && "notEquals" in condition) {
    return getValue(values, condition.field) !== condition.notEquals;
  }
  if ("field" in condition && "in" in condition) {
    return condition.in.includes(getValue(values, condition.field));
  }
  if ("and" in condition) {
    return condition.and.every((c) => evaluateCondition(values, c));
  }
  if ("or" in condition) {
    return condition.or.some((c) => evaluateCondition(values, c));
  }
  return true;
}

function getValue(obj: FormValues, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
