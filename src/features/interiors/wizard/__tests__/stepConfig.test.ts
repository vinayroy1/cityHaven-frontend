import { getValue } from "@/lib/listingEngine/conditions";
import { createInteriorInitialValues } from "../initialValues";
import { interiorPredicates } from "../predicates";
import { INTERIOR_CUSTOM_COMPONENT_NAMES, interiorSteps } from "../steps";
import { requiredPathsForStep } from "@/lib/listingEngine/validation";

const init = createInteriorInitialValues();
const resolves = (path: string) => getValue(init, path) !== undefined;

const stepById = (id: string) => interiorSteps.find((s) => s.id === id)!;

describe("interior step config", () => {
  test("9 steps with ids matching InteriorWizardValues sections", () => {
    // order is a UX choice (phases); the set of ids is the contract
    expect(interiorSteps.map((s) => s.id).sort()).toEqual(
      ["identity", "location", "services", "materials", "pricing", "portfolio", "team", "warranty", "contact"].sort(),
    );
    for (const s of interiorSteps) expect(init).toHaveProperty(s.id);
  });

  test("every field id, requires path and scorePath resolves in initialValues", () => {
    const missing: string[] = [];
    for (const step of interiorSteps)
      for (const section of step.sections ?? []) {
        for (const f of section.fields) if (!resolves(f.id)) missing.push(f.id);
        for (const r of section.requires ?? []) if (!resolves(r.path)) missing.push(r.path);
        for (const p of section.scorePaths ?? []) if (!resolves(p)) missing.push(p);
        for (const v of Object.values(section.props ?? {}))
          if (typeof v === "string" && v.includes(".") && !resolves(v)) missing.push(v);
      }
    expect(missing).toEqual([]);
  });

  test("custom component names are declared", () => {
    const used = new Set<string>();
    for (const step of interiorSteps)
      for (const section of step.sections ?? []) if (section.kind === "custom") used.add(section.component!);
    expect([...used].sort()).toEqual([...INTERIOR_CUSTOM_COMPONENT_NAMES].sort());
  });

  test("unique section ids per step", () => {
    for (const step of interiorSteps) {
      const ids = (step.sections ?? []).map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test("individual vs company required paths", () => {
    const ind = { ...init, identity: { ...init.identity, providerType: "INDIVIDUAL" as const } };
    const co = { ...init, identity: { ...init.identity, providerType: "COMPANY" as const } };
    const ctx = { predicates: interiorPredicates };
    expect(requiredPathsForStep(stepById("identity"), ind, ctx)).toEqual(
      expect.arrayContaining(["identity.providerType", "identity.fullName", "identity.displayName"]),
    );
    expect(requiredPathsForStep(stepById("identity"), co, ctx)).toEqual(
      expect.arrayContaining(["identity.organizationId", "identity.businessName"]),
    );
    expect(requiredPathsForStep(stepById("identity"), co, ctx)).not.toContain("identity.fullName");
    // Branches are "add later" in the wizard (readiness still gates submit on a head office).
    expect(requiredPathsForStep(stepById("location"), co, ctx)).not.toContain("location.branches");
    expect(requiredPathsForStep(stepById("location"), ind, ctx)).not.toContain("location.branches");
  });

  test("starting price fields required only in STARTING_PRICE mode", () => {
    const ctx = { predicates: interiorPredicates };
    const base = { ...init, identity: { ...init.identity, providerType: "INDIVIDUAL" as const } };
    const sp = { ...base, pricing: { ...base.pricing, priceMode: "STARTING_PRICE" as const } };
    const q = { ...base, pricing: { ...base.pricing, priceMode: "QUOTE_ONLY" as const } };
    expect(requiredPathsForStep(stepById("pricing"), sp, ctx)).toContain("pricing.startingRateMin");
    expect(requiredPathsForStep(stepById("pricing"), q, ctx)).not.toContain("pricing.startingRateMin");
  });

  test("no invented defaults", () => {
    expect(init.identity.providerType).toBe("");
    expect(init.contact.phone).toBe("");
    expect(init.warranty.warranties.every((w) => w.years === null)).toBe(true);
  });
});
