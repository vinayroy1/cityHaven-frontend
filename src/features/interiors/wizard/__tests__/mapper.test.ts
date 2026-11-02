import type { InteriorProfile } from "@/types/interior.types";
import { createInteriorInitialValues } from "../initialValues";
import {
  INTERIOR_SECTIONS,
  formToFullProfile,
  formToProfilePayload,
  profileToForm,
  projectImageCount,
} from "../mapper";
import { completeValues } from "./fixtures";

describe("interior mapper", () => {
  it.each(["INDIVIDUAL", "COMPANY"] as const)("round-trips profileToForm(formToFullProfile(x)) for %s", (kind) => {
    const v = completeValues(kind);
    expect(profileToForm(formToFullProfile(v) as InteriorProfile)).toEqual(v);
  });

  it("round-trips empty initial values without inventing data", () => {
    const v = createInteriorInitialValues();
    expect(profileToForm(formToFullProfile(v) as InteriorProfile)).toEqual(v);
    expect(profileToForm(null)).toEqual(v);
  });

  it("derives legacy material columns", () => {
    const p = formToProfilePayload("materials", completeValues("INDIVIDUAL"));
    expect(p.boardMaterials).toEqual(["BWP Plywood"]);
    expect(p.boardBrands).toEqual(["Century"]);
    expect(p.hardwareBrands).toEqual(["Hettich"]);
    expect(p.countertops).toEqual([]);
  });

  it("never sends an empty string for acceptingNewProjects (deselected radio)", () => {
    const v = completeValues("INDIVIDUAL");
    (v.contact as { acceptingNewProjects: unknown }).acceptingNewProjects = "";
    const c = formToProfilePayload("contact", v) as { contact: { acceptingNewProjects: unknown }; isAcceptingProjects?: unknown };
    expect(c.contact.acceptingNewProjects).toBeNull();
    expect("isAcceptingProjects" in c).toBe(false);
  });

  it("derives legacy warranty + contact columns", () => {
    const v = completeValues("INDIVIDUAL");
    const w = formToProfilePayload("warranty", v);
    expect(w.woodworkWarrantyYears).toBe(10);
    expect(w.hardwareWarrantyYears).toBeNull();
    expect(w.freeMaintenanceMonths).toBe(12);
    const c = formToProfilePayload("contact", v);
    expect(c.primaryPhone).toBe("9876543210");
    expect(c.whatsappPhone).toBe("9876543210");
    expect(c.isAcceptingProjects).toBe(true);
    expect(c.preferredContactMethod).toBe("CALL");
  });

  it("does not send isAcceptingProjects / lead pref when unanswered", () => {
    const c = formToProfilePayload("contact", createInteriorInitialValues());
    expect("isAcceptingProjects" in c).toBe(false);
    expect("preferredContactMethod" in c).toBe(false);
  });

  it("quote-only clears starting rates", () => {
    const v = completeValues("INDIVIDUAL");
    v.pricing.priceMode = "QUOTE_ONLY";
    const p = formToProfilePayload("pricing", v);
    expect(p.isCustomQuotationOnly).toBe(true);
    expect(p.startingRateMin).toBeNull();
    expect(profileToForm({ ...p } as InteriorProfile).pricing.priceMode).toBe("QUOTE_ONLY");
  });

  it("never sends server-controlled fields", () => {
    const v = completeValues("COMPANY");
    const forbidden = ["isVerified", "verificationStatus", "isPublished", "status", "isFeatured", "rating", "reviewCount", "userId"];
    for (const s of INTERIOR_SECTIONS) {
      const keys = Object.keys(formToProfilePayload(s, v));
      for (const f of forbidden) expect(keys).not.toContain(f);
    }
    expect(formToProfilePayload("portfolio", v)).toEqual({});
  });

  it("hydrates legacy-only profiles", () => {
    const legacy = {
      providerType: "INDIVIDUAL",
      boardMaterials: ["MR Plywood"],
      boardBrands: ["Greenply"],
      woodworkWarrantyYears: 5,
      primaryPhone: "9876543210",
      whatsappPhone: "9123456780",
      isAcceptingProjects: false,
      consultationType: "PAID_SITE_VISIT",
      consultationFee: 2000,
      startingRateMin: 1200,
      pricingUnit: "PER_SQFT",
      isCustomQuotationOnly: false,
    } as unknown as InteriorProfile;
    const f = profileToForm(legacy);
    expect(f.materials.materialSpecs[0]).toMatchObject({ category: "BOARD", material: "MR Plywood", brand: "Greenply" });
    expect(f.warranty.warranties.find((w) => w.category === "WOODWORK")?.years).toBe(5);
    expect(f.warranty.warranties).toHaveLength(3);
    expect(f.contact.whatsappSameAsPhone).toBe(false);
    expect(f.contact.whatsapp).toBe("9123456780");
    expect(f.contact.acceptingNewProjects).toBe(false);
    expect(f.pricing.priceMode).toBe("STARTING_PRICE");
    expect(f.pricing.consultationOptions[0]).toMatchObject({ type: "SITE_VISIT", isFree: false, fee: 2000 });
  });

  it("counts unique project images", () => {
    expect(projectImageCount(completeValues("INDIVIDUAL").portfolio.projects[0])).toBe(3);
  });
});
