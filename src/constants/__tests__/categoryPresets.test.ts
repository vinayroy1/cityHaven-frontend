import { PROPERTY_CATEGORY_PAGES } from "@/constants/propertyListingPages";
import { listingSteps } from "@/features/propertyListing/formConfig/steps";
import { evaluateCondition, getValue, predicates } from "@/features/propertyListing/formConfig/conditions";
import { initialPropertyListingFormValues } from "@/features/propertyListing/slice";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const formFor = (preset: object) =>
  ({
    ...initialPropertyListingFormValues,
    context: { ...initialPropertyListingFormValues.context, postedAs: "OWNER", ...preset },
  }) as PropertyListingFormValues;

const fields = listingSteps.flatMap((s) => (s.sections ?? []).flatMap((sec) => sec.fields ?? []));

describe.each(Object.entries(PROPERTY_CATEGORY_PAGES))("%s category page", (_key, page) => {
  const v = formFor(page.preset ?? {});

  test("every preset answer is a visible option, so the form keeps it", () => {
    for (const f of fields) {
      if (f.type !== "chip-radio" || !f.id.startsWith("context.")) continue;
      const chosen = getValue(v, f.id);
      if (chosen === undefined || chosen === null || chosen === "") continue;
      if (!evaluateCondition(v, f.visibleWhen)) continue;
      const offered = (f.options ?? []).some(
        (o) => evaluateCondition(v, o.visibleWhen) && String(o.value).toUpperCase() === String(chosen).toUpperCase(),
      );
      expect({ field: f.id, chosen, offered }).toEqual({ field: f.id, chosen, offered: true });
    }
  });

  test("co-working flow only on the co-working page", () => {
    expect(predicates.isCoworking(v)).toBe(page.path === "/list-coworking-space");
  });
});

describe("area is mandatory", () => {
  const { unmetAnySections } = jest.requireActual("@/features/propertyListing/formConfig/validation");
  const step = listingSteps.find((s) => (s.sections ?? []).some((sec) => sec.id === "area"))!;
  const farm = formFor(PROPERTY_CATEGORY_PAGES.farmhouse.preset ?? {});

  test("a farmhouse with no area cannot continue", () => {
    expect(unmetAnySections(step, farm)).toHaveLength(1);
  });

  test("a farmhouse can give just its land (plot) area", () => {
    const v = { ...farm, details: { ...farm.details, plotArea: 2, plotAreaUnit: "ACRE" } } as PropertyListingFormValues;
    expect(unmetAnySections(step, v)).toHaveLength(0);
  });
});
