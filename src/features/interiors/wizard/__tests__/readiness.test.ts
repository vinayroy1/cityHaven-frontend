import { computeReadiness } from "@/lib/listingEngine/readiness";
import type { InteriorWizardValues } from "@/types/interior.types";
import { createInteriorInitialValues } from "../initialValues";
import { DOCUMENTS_REQUIRED, interiorReadinessRules } from "../readiness";
import { completeValues } from "./fixtures";

const run = (v: InteriorWizardValues) => computeReadiness(interiorReadinessRules, v);
const item = (v: InteriorWizardValues, id: string, level: "SUBMIT" | "PUBLISH") =>
  run(v).items.find((i) => i.id === `${id}:${level}`);

describe.each(["INDIVIDUAL", "COMPANY"] as const)("interior readiness (%s)", (kind) => {
  it("complete listing can submit and publish", () => {
    const r = run(completeValues(kind));
    expect(r.items.filter((i) => !i.done)).toEqual([]);
    expect(r.canSubmit).toBe(true);
    expect(r.canPublish).toBe(true);
    expect(r.pct).toBe(100);
  });

  type Case = [id: string, levels: ("SUBMIT" | "PUBLISH")[], breakIt: (v: InteriorWizardValues) => void];
  const docCases: Case[] = [
    ["idDocument", ["SUBMIT"], (v) => void (v.team.credentials = [])],
    ["documentVerified", ["PUBLISH"], (v) => void (v.team.credentials[0].status = "PENDING")],
  ];
  const cases: Case[] = [
    ["providerType", ["SUBMIT", "PUBLISH"], (v) => void (v.identity.providerType = "")],
    ["name", ["SUBMIT", "PUBLISH"], (v) => void (kind === "COMPANY" ? (v.identity.businessName = "") : (v.identity.displayName = " "))],
    ["logo", ["PUBLISH"], (v) => void (v.identity.logo = "")],
    ["primaryLocation", ["SUBMIT", "PUBLISH"], (v) => void (v.location.primaryLocality = "")],
    ["services", ["SUBMIT", "PUBLISH"], (v) => void (v.services.servicesOffered = [])],
    ["propertyTypes", ["SUBMIT", "PUBLISH"], (v) => void (v.services.propertyTypesHandled = [])],
    ["designStyles", ["PUBLISH"], (v) => void (v.services.designStyles = [])],
    ["materialsBoardHardware", ["PUBLISH"], (v) => void (v.materials.materialSpecs = v.materials.materialSpecs.filter((m) => m.category !== "HARDWARE"))],
    ["startingPrice", ["SUBMIT", "PUBLISH"], (v) => void (v.pricing.startingRateMin = null)],
    ["activePackage", ["PUBLISH"], (v) => void (v.pricing.packages[0].isActive = false)],
    ["woodworkWarranty", ["PUBLISH"], (v) => void (v.warranty.warranties = v.warranty.warranties.map((w) => ({ ...w, years: null })))],
    ["contactPhone", ["SUBMIT", "PUBLISH"], (v) => void (v.contact.phone = "12345")],
  ];
  if (DOCUMENTS_REQUIRED) cases.push(...docCases);
  if (kind === "COMPANY") {
    cases.push(["headOffice", ["SUBMIT", "PUBLISH"], (v) => void (v.location.branches[0].branchType = "BRANCH")]);
  }

  it("goes live without any portfolio project (projects are added after listing)", () => {
    const v = completeValues(kind);
    v.portfolio.projects = [];
    v.portfolio.workGallery = [];
    expect(run(v).canPublish).toBe(true);
  });

  it("ID / GST documents don't block submit or going live while optional", () => {
    if (DOCUMENTS_REQUIRED) return;
    const v = completeValues(kind);
    v.team.credentials = [];
    const r = run(v);
    expect(r.canSubmit).toBe(true);
    expect(r.canPublish).toBe(true);
  });

  it.each(cases)("%s gates %j", (id, levels, breakIt) => {
    const v = completeValues(kind);
    breakIt(v);
    if (id === "providerType") {
      expect(item(v, id, "SUBMIT")?.done).toBe(false);
      return;
    }
    for (const level of ["SUBMIT", "PUBLISH"] as const) {
      const it_ = item(v, id, level);
      if (levels.includes(level)) expect(it_?.done).toBe(false);
      else expect(it_).toBeUndefined();
    }
    const r = run(v);
    expect(r.canPublish).toBe(false);
    expect(r.canSubmit).toBe(!levels.includes("SUBMIT"));
  });
});

describe("interior readiness specifics", () => {
  it("company listings never require a property organization", () => {
    const ids = run(completeValues("COMPANY")).items.map((i) => i.id);
    expect(ids.some((id) => id.startsWith("organization"))).toBe(false);
  });

  it("company-only rules do not apply to individuals", () => {
    const ids = run(completeValues("INDIVIDUAL")).items.map((i) => i.id);
    expect(ids).not.toContain("headOffice:SUBMIT");
  });

  it("quote-only satisfies pricing and drops the package rule", () => {
    const v = completeValues("INDIVIDUAL");
    v.pricing.priceMode = "QUOTE_ONLY";
    v.pricing.startingRateMin = null;
    v.pricing.packages = [];
    const r = run(v);
    expect(item(v, "startingPrice", "SUBMIT")?.done).toBe(true);
    expect(r.items.find((i) => i.id.startsWith("activePackage"))).toBeUndefined();
    expect(r.canPublish).toBe(true);
  });

  (DOCUMENTS_REQUIRED ? it : it.skip)("individual needs ID proof, company needs GST or COI", () => {
    const ind = completeValues("INDIVIDUAL");
    ind.team.credentials[0].type = "GST_CERT";
    expect(item(ind, "idDocument", "SUBMIT")?.done).toBe(false);
    const co = completeValues("COMPANY");
    co.team.credentials[0].type = "COI";
    expect(item(co, "idDocument", "SUBMIT")?.done).toBe(true);
    co.team.credentials[0].type = "ID_PROOF";
    expect(item(co, "idDocument", "SUBMIT")?.done).toBe(false);
  });

  it("accepts +91 formatted phones", () => {
    const v = completeValues("INDIVIDUAL");
    v.contact.phone = "+91 98765-43210";
    expect(item(v, "contactPhone", "SUBMIT")?.done).toBe(true);
  });

  it("empty form cannot submit", () => {
    const r = run(createInteriorInitialValues());
    expect(r.canSubmit).toBe(false);
    expect(r.canPublish).toBe(false);
  });
});
