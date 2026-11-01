import { evaluateCondition, getValue, preset } from "../conditions";
import { computeReadiness, stepReadinessStatus } from "../readiness";
import { computeScore } from "../scoring";
import { createDraftStorage, isLocalNewer } from "../storage";
import type { ReadinessRule, StepConfig } from "../types";
import { allRequiredPaths, isFieldFilled, missingRequiredForStep, requiredPathsForStep } from "../validation";

const predicates = { isCo: (v: Record<string, unknown>) => getValue(v, "a.type") === "CO" };

describe("conditions", () => {
  const v = { a: { type: "CO", n: 5, list: [1, 2], empty: "" } };
  test("getValue", () => {
    expect(getValue(v, "a.n")).toBe(5);
    expect(getValue(v, "a.x.y")).toBeUndefined();
  });
  test.each([
    [{ field: "a.type", equals: "CO" }, true],
    [{ field: "a.type", notEquals: "CO" }, false],
    [{ field: "a.type", in: ["X", "CO"] }, true],
    [{ field: "a.n", gt: 4 }, true],
    [{ field: "a.n", gte: 5 }, true],
    [{ field: "a.n", lt: 5 }, false],
    [{ field: "a.n", lte: 5 }, true],
    [{ field: "a.empty", exists: true }, false],
    [{ field: "a.list", minItems: 2 }, true],
    [{ field: "a.missing", gt: 0 }, false],
    [{ and: [{ field: "a.n", gt: 1 }, { field: "a.type", equals: "CO" }] }, true],
    [{ or: [{ field: "a.n", gt: 10 }, { field: "a.type", equals: "CO" }] }, true],
    [{ not: { field: "a.type", equals: "CO" } }, false],
  ])("%j -> %s", (c, expected) => {
    expect(evaluateCondition(v, c as never, predicates)).toBe(expected);
  });
  test("presets", () => {
    expect(evaluateCondition(v, preset("isCo"), predicates)).toBe(true);
    expect(evaluateCondition(v, preset("unknown"), predicates)).toBe(true);
    expect(evaluateCondition(v, undefined)).toBe(true);
  });
});

const steps: StepConfig[] = [
  {
    id: "s1",
    label: "S1",
    sections: [
      {
        id: "x",
        fields: [
          { id: "a.type", label: "Type", type: "radio", required: true },
          { id: "a.name", label: "Name", type: "text", requiredWhen: preset("isCo") },
          { id: "a.hidden", label: "Hidden", type: "text", required: true, visibleWhen: { field: "a.type", equals: "IND" } },
          { id: "a.opt", label: "Opt", type: "text" },
        ],
      },
      {
        id: "c",
        kind: "custom",
        component: "Thing",
        fields: [],
        requires: [{ path: "a.list", label: "List", minItems: 2, when: preset("isCo") }],
        scorePaths: ["a.list"],
        weight: 4,
      },
    ],
  },
  { id: "s2", label: "S2", visibleWhen: { field: "a.type", equals: "IND" }, sections: [{ id: "y", fields: [{ id: "b.z", label: "Z", type: "text", required: true }] }] },
];

describe("validation", () => {
  test("required paths respect visibility, requiredWhen and custom requires", () => {
    const v = { a: { type: "CO", list: [1] } };
    expect(requiredPathsForStep(steps[0], v, { predicates })).toEqual(["a.type", "a.name", "a.list"]);
    expect(requiredPathsForStep(steps[1], v, { predicates })).toEqual([]);
    expect(allRequiredPaths(steps, { a: { type: "IND" } }, { predicates })).toEqual(["a.type", "a.hidden", "b.z"]);
  });
  test("filled checks incl. minItems", () => {
    expect(isFieldFilled({ a: { s: "  " } }, "a.s")).toBe(false);
    expect(isFieldFilled({ a: { n: 0 } }, "a.n")).toBe(true);
    const missing = missingRequiredForStep(steps[0], { a: { type: "CO", name: "x", list: [1] } }, { predicates });
    expect(missing.map((m) => m.id)).toEqual(["a.list"]);
  });
});

describe("scoring", () => {
  test("weights required 3, optional 1, custom by weight", () => {
    const empty = computeScore(steps, { a: { type: "CO" } }, { predicates });
    // type(3, filled) + name(3) + opt(1) + custom(4)
    expect(empty.totalWeight).toBe(11);
    expect(empty.filledWeight).toBe(3);
    const full = computeScore(steps, { a: { type: "CO", name: "n", opt: "o", list: [1, 2] } }, { predicates });
    expect(full.pct).toBe(100);
  });
});

describe("readiness", () => {
  type V = { n?: string; p?: string };
  const rules: ReadinessRule<V>[] = [
    { id: "name", stepId: "s1", label: "Name", levels: ["SUBMIT", "PUBLISH"], check: (v) => !!v.n },
    { id: "pic", stepId: "s1", label: "Pic", levels: ["PUBLISH"], check: (v) => !!v.p },
    { id: "co", stepId: "s2", label: "Co", levels: ["SUBMIT"], appliesWhen: () => false, check: () => false },
  ];
  test("submit vs publish", () => {
    const r1 = computeReadiness(rules, { n: "x" });
    expect(r1.canSubmit).toBe(true);
    expect(r1.canPublish).toBe(false);
    expect(r1.pct).toBe(50);
    expect(stepReadinessStatus(r1, "s1")).toBe("todo");
    expect(stepReadinessStatus(r1, "s2")).toBe("none");
    const r2 = computeReadiness(rules, { n: "x", p: "y" });
    expect(r2.canPublish).toBe(true);
  });
});

describe("storage", () => {
  test("persist / load / clear", () => {
    const s = createDraftStorage<{ a: number }>("t:key");
    s.persist({ a: 1 }, 2);
    expect(s.load()?.values).toEqual({ a: 1 });
    expect(s.load()?.step).toBe(2);
    s.clear();
    expect(s.load()).toBeNull();
  });
  test("isLocalNewer", () => {
    expect(isLocalNewer(null, "2020")).toBe(false);
    expect(isLocalNewer({ updatedAt: "2026-01-02" }, "2026-01-01")).toBe(true);
    expect(isLocalNewer({ updatedAt: "2026-01-01" }, null)).toBe(true);
  });
});
