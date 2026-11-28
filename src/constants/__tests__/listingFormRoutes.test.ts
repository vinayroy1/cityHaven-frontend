import { LISTING_FORM_ROUTES } from "@/constants/listingFormRoutes";
import { PROPERTY_CATEGORY_PAGES } from "@/constants/propertyListingPages";

test("every property category page hides the mobile bottom nav", () => {
  for (const page of Object.values(PROPERTY_CATEGORY_PAGES)) {
    expect(LISTING_FORM_ROUTES).toContain(page.path);
  }
});
