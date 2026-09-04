/**
 * @jest-environment node
 *
 * Live integration check — only runs when LIVE_API_BASE + LIVE_API_TOKEN are set:
 *   LIVE_API_BASE=https://.../api/v1 LIVE_API_TOKEN=eyJ... npx jest apiLive
 * Builds the real API payload via the mapper and POSTs a listing.
 */
import { mapFormToApiPayload } from "./mapper";
import { initialPropertyListingFormValues } from "./slice";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const BASE = process.env.LIVE_API_BASE;
const TOKEN = process.env.LIVE_API_TOKEN;
const maybe = BASE && TOKEN ? describe : describe.skip;

maybe("live propertyListing API", () => {
  const form: PropertyListingFormValues = {
    ...initialPropertyListingFormValues,
    context: {
      ...initialPropertyListingFormValues.context,
      listingType: "RENT",
      resCom: "RESIDENTIAL",
      postedAs: "OWNER",
      propertyTypeSlug: "residential",
      propertySubTypeSlug: "apartment",
    },
    location: {
      ...initialPropertyListingFormValues.location,
      cityName: "Bengaluru",
      locality: "Whitefield",
      subLocality: "Palm Meadows",
      address: "Palm Meadows, Whitefield, Bengaluru",
    },
    details: {
      ...initialPropertyListingFormValues.details,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      carpetArea: 980,
      carpetAreaUnit: "SQ_FT",
      floorNumber: "FLOOR_4",
      totalFloors: 12,
      propertyFacing: "EAST",
    },
    pricing: { ...initialPropertyListingFormValues.pricing, price: 42000, priceType: "MONTHLY", deposit: 200000 },
    availability: { ...initialPropertyListingFormValues.availability, availabilityStatus: "READY_TO_MOVE" },
    amenities: {
      ...initialPropertyListingFormValues.amenities,
      furnishing: "SEMI_FURNISHED",
      ownershipType: "FREEHOLD",
      amenityIds: [1, 5, 10],
      parkingAvailable: true,
      noOfParkings: 1,
    },
    meta: { ...initialPropertyListingFormValues.meta, title: "2 BHK Apartment for Rent in Whitefield, Bengaluru" },
    publishOptions: { status: "DRAFT", qcRequired: true },
  };

  it("accepts a mapper-built payload", async () => {
    const payload = mapFormToApiPayload(form);
    // eslint-disable-next-line no-console
    console.log("PAYLOAD >>>", JSON.stringify(payload, null, 2));

    const res = await fetch(`${BASE}/propertyListing`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    // eslint-disable-next-line no-console
    console.log(`RESPONSE ${res.status} >>>`, text);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  }, 60000);
});
