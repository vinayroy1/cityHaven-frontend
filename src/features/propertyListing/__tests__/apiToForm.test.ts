import { mapApiToForm } from "../apiToForm";

describe("mapApiToForm hydration & prefill tests", () => {
  test("correctly infers resCom=COMMERCIAL and populates subtype & subcategory when resCom is null in DB", () => {
    // Exact shape returned by backend for property id=1
    const backendProperty1 = {
      id: 1,
      title: "Bright coworking space in IT park",
      description: "Plug-and-play desks with meeting rooms and pantry.",
      slug: "office-for-rent-440588",
      countryCode: "IN",
      currencyCode: "INR",
      postedAs: null,
      resCom: null, // Null in DB!
      listingType: "RENT",
      propertyTypeId: 2,
      propertySubTypeId: 9,
      propertySubCategoryId: 3,
      locatedInsideId: null,
      propertyType: {
        id: 2,
        name: "Commercial",
        slug: "commercial",
      },
      propertySubType: {
        id: 9,
        name: "Office",
        slug: "office",
        propertyTypeId: 2,
      },
      propertySubCategory: {
        id: 3,
        name: "Co-working office space",
        slug: "co-working-office-space",
        propertySubTypeId: 9,
      },
      areaSize: 2500,
    };

    const formValues = mapApiToForm(backendProperty1);

    expect(formValues.context.listingType).toBe("RENT");
    expect(formValues.context.resCom).toBe("COMMERCIAL");
    expect(formValues.context.propertyTypeSlug).toBe("commercial");
    expect(formValues.context.propertySubTypeSlug).toBe("office");
    expect(formValues.context.propertySubCategorySlug).toBe("co-working-office-space");
    expect(formValues.context.propertySubTypeId).toBe("9");
    expect(formValues.context.propertySubCategoryId).toBe("3");
  });

  test("correctly handles residential property with null resCom", () => {
    const residentialProperty = {
      id: 10,
      resCom: null,
      listingType: "SELL",
      propertyTypeId: 1,
      propertySubType: {
        id: 1,
        slug: "apartment",
        name: "Apartment",
      },
    };

    const formValues = mapApiToForm(residentialProperty);
    expect(formValues.context.resCom).toBe("RESIDENTIAL");
    expect(formValues.context.propertySubTypeSlug).toBe("apartment");
  });

  test("correctly hydrates from draftState nested form context", () => {
    const draftProperty = {
      id: 5,
      resCom: null,
      listingType: null,
      draftState: {
        form: {
          context: {
            listingType: "RENT",
            resCom: "COMMERCIAL",
            propertySubTypeSlug: "retail",
            propertySubCategorySlug: "commercial-shops",
          },
        },
      },
    };

    const formValues = mapApiToForm(draftProperty);
    expect(formValues.context.listingType).toBe("RENT");
    expect(formValues.context.resCom).toBe("COMMERCIAL");
    expect(formValues.context.propertySubTypeSlug).toBe("retail");
    expect(formValues.context.propertySubCategorySlug).toBe("commercial-shops");
  });

  test("correctly normalizes locatedInside slug from backend object with subtype suffix", () => {
    const commercialProperty = {
      id: 2,
      listingType: "RENT",
      resCom: "COMMERCIAL",
      propertySubTypeSlug: "office",
      locatedInside: {
        id: 15,
        name: "IT Park",
        slug: "it-park-office",
      },
    };

    const formValues = mapApiToForm(commercialProperty);
    expect(formValues.context.locatedInsideSlug).toBe("it-park");
    expect(formValues.context.locatedInsideId).toBe("15");
  });

  test("correctly normalizes locatedInside slug from draftState", () => {
    const draftProperty = {
      id: 3,
      draftState: {
        form: {
          context: {
            listingType: "RENT",
            resCom: "COMMERCIAL",
            propertySubTypeSlug: "retail",
            locatedInsideSlug: "retail-complex-building-retail",
          },
        },
      },
    };

    const formValues = mapApiToForm(draftProperty);
    expect(formValues.context.locatedInsideSlug).toBe("retail-complex");
  });

  test("correctly derives propertySubTypeSlug and propertySubCategorySlug from IDs when slugs missing", () => {
    const rawIdProperty = {
      id: 42,
      listingType: "RENT",
      resCom: "COMMERCIAL",
      propertyTypeId: 2,
      propertySubTypeId: 9, // office
      propertySubCategoryId: 3, // co-working-office-space
    };

    const formValues = mapApiToForm(rawIdProperty);
    expect(formValues.context.propertySubTypeSlug).toBe("office");
    expect(formValues.context.propertySubCategorySlug).toBe("co-working-office-space");
  });
});
