import { createInteriorInitialValues } from "../initialValues";
import { validateInteriorAll, validateInteriorStep } from "../schema";
import { completeValues } from "./fixtures";

describe("interior zod step schemas", () => {
  it("accepts empty initial values (requiredness is the config's job)", () => {
    expect(validateInteriorAll(createInteriorInitialValues())).toEqual({});
  });

  it.each(["INDIVIDUAL", "COMPANY"] as const)("accepts a complete %s listing", (k) => {
    expect(validateInteriorAll(completeValues(k))).toEqual({});
  });

  it("min <= max on starting price, area, packages, rooms", () => {
    const v = completeValues("COMPANY");
    v.pricing.startingRateMax = 1000;
    v.services.areaCapacity.maxSqft = 100;
    v.pricing.packages[0].priceMax = 1;
    v.pricing.roomPricing = [{ id: "r", room: "KITCHEN", priceMin: 500, priceMax: 100, unit: "PER_ROOM" }];
    expect(Object.keys(validateInteriorStep("pricing", v))).toEqual(
      expect.arrayContaining(["pricing.startingRateMax", "pricing.packages.0.priceMax", "pricing.roomPricing.0.priceMax"]),
    );
    expect(validateInteriorStep("services", v)).toHaveProperty(["services.areaCapacity.maxSqft"]);
  });

  it("GSTIN / PAN / CIN formats", () => {
    const v = completeValues("COMPANY");
    v.team.gstin = "29ABCDE1234F1X5";
    v.team.panNumber = "abcde1234f"; // lowercase is normalised
    v.team.cinNumber = "bad";
    const e = validateInteriorStep("team", v);
    expect(e).toHaveProperty(["team.gstin"]);
    expect(e).not.toHaveProperty(["team.panNumber"]);
    expect(e).toHaveProperty(["team.cinNumber"]);
  });

  it("phone, whatsapp, email and hours", () => {
    const v = completeValues("INDIVIDUAL");
    v.contact.phone = "12345";
    v.contact.whatsapp = "555";
    v.contact.email = "nope";
    v.contact.workingHours = { open: "18:00", close: "09:00" };
    const e = validateInteriorStep("contact", v);
    expect(Object.keys(e)).toEqual(
      expect.arrayContaining(["contact.phone", "contact.whatsapp", "contact.email", "contact.workingHours.close"]),
    );
  });

  it("URLs", () => {
    const v = completeValues("INDIVIDUAL");
    v.identity.website = "not a url";
    v.identity.instagram = "instagram.com/studio";
    const e = validateInteriorStep("identity", v);
    expect(e).toHaveProperty(["identity.website"]);
    expect(e).not.toHaveProperty(["identity.instagram"]);
  });

  it("only one HEAD_OFFICE", () => {
    const v = completeValues("COMPANY");
    v.location.branches.push({ ...v.location.branches[0], id: "b2", serverId: 12 });
    expect(validateInteriorStep("location", v)).toHaveProperty(["location.branches.1.branchType"]);
  });

  it("paid consultation needs a fee", () => {
    const v = completeValues("INDIVIDUAL");
    v.pricing.consultationOptions = [{ id: "c", type: "SITE_VISIT", isFree: false, fee: null }];
    expect(validateInteriorStep("pricing", v)).toHaveProperty(["pricing.consultationOptions.0.fee"]);
  });

  it("empty material rows are flagged", () => {
    const v = completeValues("INDIVIDUAL");
    v.materials.materialSpecs.push({ id: "x", category: "BOARD", material: "" });
    expect(validateInteriorStep("materials", v)).toHaveProperty(["materials.materialSpecs.2.material"]);
  });
});
