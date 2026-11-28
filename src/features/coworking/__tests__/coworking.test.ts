import { mapFormToApiPayload } from "@/features/propertyListing/mapper";
import { initialPropertyListingFormValues } from "@/features/propertyListing/slice";
import { evaluateCondition } from "@/features/propertyListing/formConfig/conditions";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";
import { initialSearchState, toApiParams, buildSearchParams, parseSearchParams } from "@/components/search/searchQuery";
import { filterSectionsFor } from "@/components/search/searchConfig";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import { formatPlanPrice, hoursLine, summarizePlans } from "../model";

const coworkingForm = (details: Partial<PropertyListingFormValues["details"]> = {}): PropertyListingFormValues => ({
  ...initialPropertyListingFormValues,
  context: {
    ...initialPropertyListingFormValues.context,
    listingType: "RENT",
    resCom: "COMMERCIAL",
    propertySubTypeSlug: "office",
    propertySubCategorySlug: "co-working-office-space",
  },
  details: { ...initialPropertyListingFormValues.details, ...details },
});

describe("co-working posting form", () => {
  it("swaps the single rent field for plans and terms", () => {
    const v = coworkingForm();
    expect(evaluateCondition(v, { preset: "isCoworking" })).toBe(true);
    expect(evaluateCondition(v, { preset: "priceIsRent" })).toBe(false);
    expect(evaluateCondition(v, { preset: "showDeposit" })).toBe(false);
    expect(evaluateCondition(v, { preset: "isOfficeNotCoworking" })).toBe(false);

    const office = { ...v, context: { ...v.context, propertySubCategorySlug: "ready-to-move-office-space" } };
    expect(evaluateCondition(office, { preset: "isCoworking" })).toBe(false);
    expect(evaluateCondition(office, { preset: "priceIsRent" })).toBe(true);
  });

  it("sends plans and centre details, normalising times and dropping hours when open 24x7", () => {
    const payload = mapFormToApiPayload(
      coworkingForm({
        coworkingPlans: [
          { type: "DEDICATED_DESK", name: "  ", price: 9000, priceUnit: "PER_SEAT_MONTH" },
          { type: "DAY_PASS", price: 0, priceUnit: "PER_DAY", isAvailable: false },
        ],
        workspaceOperator: " Awfis ",
        openingTime: "9:00",
        closingTime: "20:30",
        openDays: ["MON", "TUE"],
        lockInMonths: 3,
      }),
    ) as Record<string, unknown>;
    expect(payload.officeType).toBe("CO_WORKING");
    expect(payload.coworkingPlans).toEqual([
      expect.objectContaining({ type: "DEDICATED_DESK", name: null, price: 9000, priceUnit: "PER_SEAT_MONTH", isAvailable: true }),
      expect.objectContaining({ type: "DAY_PASS", price: null, isAvailable: false }),
    ]);
    expect(payload.workspaceOperator).toBe("Awfis");
    expect(payload.openingTime).toBe("09:00");
    expect(payload.closingTime).toBe("20:30");
    expect(payload.lockInMonths).toBe(3);

    const allDay = mapFormToApiPayload(coworkingForm({ open24x7: true, openingTime: "09:00", openDays: ["MON"] })) as Record<string, unknown>;
    expect(allDay.openingTime).toBeNull();
    expect(allDay.openDays).toEqual([]);
  });

  it("clears plans when a listing stops being co-working", () => {
    const form = coworkingForm({ coworkingPlans: [{ type: "HOT_DESK", price: 5000 }] });
    const office = { ...form, context: { ...form.context, propertySubCategorySlug: "bare-shell-office-space" } };
    const payload = mapFormToApiPayload(office) as Record<string, unknown>;
    expect(payload.coworkingPlans).toEqual([]);
    expect(payload.officeType).not.toBe("CO_WORKING");
  });
});

describe("co-working result card", () => {
  const item = {
    id: 1141,
    title: "Office for Rent in Sree Gururaya Mansion, JP Nagar, Bengaluru",
    listingType: "RENT",
    resCom: "COMMERCIAL",
    price: 9000,
    priceUnit: "PER_SEAT_MONTH",
    currencyCode: "INR",
    maxNoOfSeats: 150,
    seatsAvailable: 40,
    open24x7: true,
    propertySubCategory: { slug: "co-working-office-space", name: "Co-working office space" },
    coworkingPlans: [
      { type: "DEDICATED_DESK", price: 9000, priceUnit: "PER_SEAT_MONTH" },
      { type: "PRIVATE_CABIN", price: 48000, priceUnit: "PER_CABIN_MONTH", capacity: 6 },
      { type: "PRIVATE_CABIN", price: 70000, priceUnit: "PER_CABIN_MONTH", capacity: 10 },
    ],
  } as unknown as PropertySearchItem;

  it("shows a per-seat starting price and what the centre sells", () => {
    const props = toResultCardProps(item);
    expect(props.price).toBe("From ₹9,000/seat/mo");
    expect(props.decisionDetails).toEqual(["Dedicated desk · Cabins 6–10 seats", "40 seats available", "Open 24×7"]);
  });

  it("keeps whole-listing rents unchanged", () => {
    const props = toResultCardProps({ ...item, priceUnit: null, coworkingPlans: null, propertySubCategory: null, price: 20000 } as PropertySearchItem);
    expect(props.price).toBe("₹20,000/month");
  });
});

describe("co-working search", () => {
  const state = () => {
    const s = initialSearchState("Bengaluru");
    s.intent = "COMMERCIAL";
    s.transaction = "RENT";
    s.priceMax = 10000;
    s.refine.subType = ["co-working-office-space"];
    s.refine.workspacePlan = ["PRIVATE_CABIN"];
    s.refine.teamSize = ["11", "6"];
    s.refine.open24x7 = ["YES"];
    return s;
  };

  it("sends the co-working filters to the API and reads the budget per seat", () => {
    expect(toApiParams(state(), 20)).toEqual(
      expect.objectContaining({
        listingType: "RENT",
        resCom: "COMMERCIAL",
        priceMax: 10000,
        propertySubCategorySlug: "co-working-office-space",
        workspacePlanType: "PRIVATE_CABIN",
        seatsNeeded: 6,
        open24x7: "true",
      }),
    );
    const sections = filterSectionsFor("COMMERCIAL", state().refine).map((s) => s.key);
    expect(sections).toEqual(expect.arrayContaining(["workspacePlan", "teamSize", "open24x7"]));
    expect(filterSectionsFor("COMMERCIAL", state().refine)[0].title).toBe("Budget (per seat / month)");
  });

  it("leaves other commercial searches untouched and round-trips through the URL", () => {
    const plain = state();
    plain.refine.subType = ["office"];
    expect(toApiParams(plain, 20)).not.toHaveProperty("propertySubCategorySlug");
    expect(filterSectionsFor("COMMERCIAL", plain.refine).map((s) => s.key)).not.toContain("workspacePlan");

    const back = parseSearchParams(buildSearchParams(state()));
    expect(back.refine.workspacePlan).toEqual(["PRIVATE_CABIN"]);
    expect(back.refine.teamSize).toEqual(["11", "6"]);
    expect(back.refine.open24x7).toEqual(["YES"]);
  });
});

describe("co-working labels", () => {
  it("formats prices, plan summaries and hours", () => {
    expect(formatPlanPrice(500, "PER_DAY")).toBe("₹500/day");
    expect(formatPlanPrice(null, "PER_DAY")).toBe("Price on request");
    expect(summarizePlans([{ type: "HOT_DESK" }, { type: "DAY_PASS", isAvailable: false }])).toBe("Hot desk");
    expect(hoursLine({ openDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"], openingTime: "09:00", closingTime: "20:00" })).toBe(
      "Mon–Sat · 09:00–20:00",
    );
    expect(hoursLine({ open24x7: true })).toBe("Open 24×7");
  });
});

describe("extra plan types", () => {
  it("sends a flexi pass with its days and drops days on other plans", () => {
    const payload = mapFormToApiPayload(
      coworkingForm({
        coworkingPlans: [
          { type: "FLEXI_PASS", price: 4500, priceUnit: "PER_MONTH", daysIncluded: 10 },
          { type: "EVENT_SPACE", price: 15000, priceUnit: "PER_DAY", capacity: 80, daysIncluded: 3 },
          { type: "OTHER", name: "Locker rental", price: 500, priceUnit: "PER_MONTH" },
        ],
      }),
    ) as Record<string, unknown>;
    expect(payload.coworkingPlans).toEqual([
      expect.objectContaining({ type: "FLEXI_PASS", daysIncluded: 10 }),
      expect.objectContaining({ type: "EVENT_SPACE", capacity: 80, daysIncluded: null }),
      expect.objectContaining({ type: "OTHER", name: "Locker rental" }),
    ]);
    expect(summarizePlans([{ type: "FLEXI_PASS" }, { type: "STUDIO" }])).toBe("Flexi pass · Studio / phone booth");
  });
});

describe("co-working listing flow is short", () => {
  it("skips office-lease and residential fields, keeps the centre section", async () => {
    const { listingSteps } = await import("@/features/propertyListing/formConfig/steps");
    const v = coworkingForm();
    const visible = listingSteps.flatMap((s) =>
      (s.sections ?? [])
        .filter((sec) => evaluateCondition(v, sec.visibleWhen))
        .flatMap((sec) => sec.fields.filter((f) => evaluateCondition(v, f.visibleWhen)).map((f) => f.id)),
    );
    expect(visible).toEqual(expect.arrayContaining(["details.maxNoOfSeats", "details.workspaceInclusions", "details.coworkingPlans"]));
    for (const gone of ["details.cabins", "details.builtUpArea", "amenities.amenityIds", "amenities.noOfParkings", "details.ageOfProperty", "pricing.price"]) {
      expect(visible).not.toContain(gone);
    }
  });
});

describe("co-working wording", () => {
  it("renames home-oriented steps, sections and labels, leaving ids alone", async () => {
    const { listingSteps } = await import("@/features/propertyListing/formConfig/steps");
    const { withCoworkingText } = await import("@/features/propertyListing/formConfig/coworkingScope");
    const steps = withCoworkingText(listingSteps);
    expect(steps.map((s) => s.id)).toEqual(listingSteps.map((s) => s.id));
    expect(steps.find((s) => s.id === "profile")?.title).toBe("Tell us about your centre");
    const fields = steps.flatMap((s) => s.sections ?? []).flatMap((sec) => sec.fields);
    expect(fields.find((f) => f.id === "location.societyOrProjectName")?.label).toBe("Building / tech park name");
    const postedAs = fields.find((f) => f.id === "context.postedAs");
    const v = coworkingForm();
    expect(postedAs?.options?.filter((o) => evaluateCondition(v, o.visibleWhen)).map((o) => o.value)).toContain("OPERATOR");
    // other listing types keep the original text
    expect(listingSteps.find((s) => s.id === "profile")?.title).toBe("Tell us about your property");
  });
});
