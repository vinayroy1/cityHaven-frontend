import { mapFormToApiPayload } from "../mapper";
import { initialPropertyListingFormValues } from "../slice";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

describe("mapFormToApiPayload", () => {
  it("never includes bedrooms or balconies in top-level or structure for PG listings even if draft contains them", () => {
    const form: PropertyListingFormValues = {
      ...initialPropertyListingFormValues,
      context: {
        ...initialPropertyListingFormValues.context,
        listingType: "PG",
        propertySubTypeSlug: "pg-shared-room",
      },
      details: {
        ...initialPropertyListingFormValues.details,
        bedrooms: 0.5, // e.g. Leftover draft from 1 RK
        balconies: 1,
        sharingType: "DOUBLE",
        foodOption: "INCLUDED",
      },
    };

    const payload = mapFormToApiPayload(form);

    expect(payload.bedrooms).toBeUndefined();
    expect(payload.balconies).toBeUndefined();
    expect(payload.structure?.bedrooms).toBeUndefined();
    expect(payload.structure?.balconies).toBeUndefined();
  });

  it("rounds decimal bedroom values to safe integers for residential listings", () => {
    const form: PropertyListingFormValues = {
      ...initialPropertyListingFormValues,
      context: {
        ...initialPropertyListingFormValues.context,
        listingType: "RENT",
        propertySubTypeSlug: "apartment",
      },
      details: {
        ...initialPropertyListingFormValues.details,
        bedrooms: 1.5,
        bathrooms: 2,
        balconies: 1.2,
      },
    };

    const payload = mapFormToApiPayload(form);

    expect(payload.bedrooms).toBe(2);
    expect(payload.structure?.bedrooms).toBe(2);
    expect(payload.balconies).toBe(1);
    expect(payload.structure?.balconies).toBe(1);
  });
});
