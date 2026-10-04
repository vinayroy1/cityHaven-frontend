// Reverse of mapFormToApiPayload — hydrates the nested form from a flat
// listing object returned by GET /propertyListing/{id}, for the edit flow.

import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { initialPropertyListingFormValues } from "./slice";

type Flat = Record<string, unknown>;

const s = (v: unknown): string | undefined => (v === null || v === undefined ? undefined : String(v));
const n = (v: unknown): number | null | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const num = Number(v);
  return Number.isFinite(num) ? num : undefined;
};
const b = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);

const prune = <T extends object>(obj: T): Partial<T> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = prune(v as object);
      if (Object.keys(inner).length) out[k] = inner;
    } else {
      out[k] = v;
    }
  }
  return out as Partial<T>;
};

export function mapApiToForm(flat: Flat): PropertyListingFormValues {
  const structure = (flat.structure as Flat) ?? {};
  const g = (key: string) => flat[key] ?? structure[key];

  const partial = prune({
    context: {
      listingType: s(flat.listingType) as PropertyListingFormValues["context"]["listingType"],
      resCom: s(flat.resCom) as PropertyListingFormValues["context"]["resCom"],
      postedAs: s(flat.postedAs),
      propertyTypeSlug: s(flat.propertyTypeSlug),
      propertySubTypeSlug: s(flat.propertySubTypeSlug),
      propertySubCategorySlug: s(flat.propertySubCategorySlug),
      locatedInsideSlug: s(flat.locatedInsideSlug),
      organizationId: s(flat.organizationId),
    },
    location: {
      cityId: s(flat.cityId),
      cityName: s(flat.cityName),
      localityId: s(flat.localityId),
      locality: s(flat.locality),
      subLocality: s(flat.subLocality),
      sectorNumber: s(flat.sectorNumber),
      societyOrProjectName: s(flat.societyOrProjectName),
      buildingName: s(flat.buildingName),
      address: s(flat.address),
      flatNumber: s(flat.flatNumber),
      houseNumber: s(flat.houseNumber),
      towerNumber: s(flat.towerNumber),
      plotNumber: s(flat.plotNumber),
      pincode: s(flat.pincode),
      latitude: n(flat.latitude),
      longitude: n(flat.longitude),
    },
    details: {
      carpetArea: n(g("carpetArea")),
      carpetAreaUnit: s(g("carpetAreaUnit")),
      builtUpArea: n(g("builtUpArea")),
      builtUpAreaUnit: s(g("builtUpAreaUnit")),
      superBuiltUpArea: n(g("superBuiltUpArea")),
      superBuiltUpAreaUnit: s(g("superBuiltUpAreaUnit")),
      plotArea: n(g("plotArea")),
      plotAreaUnit: s(g("plotAreaUnit")),
      plotLength: n(g("plotLength")),
      plotBreadth: n(g("plotBreadth")),
      bedrooms: n(g("bedrooms")),
      bathrooms: n(g("bathrooms")),
      balconies: n(g("balconies")),
      otherRooms: (g("otherRooms") as Record<string, boolean>) ?? undefined,
      totalFloors: n(g("totalFloors")),
      floorNumber: s(g("floorNumber")),
      floorsAllowed: n(g("floorsAllowed")),
      lift: b(g("lift")),
      propertyFacing: s(g("propertyFacing")),
      kitchenType: s(g("kitchenType")),
      ageOfProperty: s(g("ageOfProperty")),
      pgFor: s(g("pgFor")),
      foodIncluded: b(g("foodIncluded")),
      sharingType: s(g("sharingType")),
      totalBeds: n(g("totalBeds")),
      availableBeds: n(g("availableBeds")),
      qualityRating: s(g("qualityRating")),
      totalRooms: n(g("totalRooms")),
      officeType: s(g("officeType")),
      washroomType: s(g("washroomType")),
      suitableForBussinessType: (g("suitableForBussinessType") as string[]) ?? undefined,
      locatedNear: (g("locatedNear") as string[]) ?? undefined,
    },
    pricing: {
      price: n(flat.price),
      pricePerSqFt: n(flat.pricePerSqFt),
      priceNegotiable: b(flat.priceNegotiable),
      priceInWords: s(flat.priceInWords),
      deposit: n(flat.deposit),
      maintenance: n(flat.maintenance),
      maintenancePaymentPeriod: s(flat.maintenancePaymentPeriod),
      allInclusivePrice: b(flat.allInclusivePrice),
      taxAndGovtExcluded: b(flat.taxAndGovtExcluded),
      bookingAmount: n(flat.bookingAmount),
      brokerage: n(flat.brokerage),
      brokerageType: s(flat.brokerageType),
    },
    availability: {
      availabilityStatus: s(flat.availabilityStatus) as PropertyListingFormValues["availability"]["availabilityStatus"],
      availableFrom: s(flat.availableFrom),
      possessionBy: s(flat.possessionBy),
      constructionType: typeof flat.constructionType === "string" ? (flat.constructionType as string) : undefined,
      ageOfProperty: s(flat.ageOfProperty),
    },
    amenities: {
      furnishing: s(g("furnishing")),
      furnishingDetails: (g("furnishingDetails") as Record<string, number>) ?? undefined,
      ownershipType: s(flat.ownershipType),
      boundaryWall: b(flat.boundaryWall),
      fireNoc: b(flat.fireNoc),
      fireSafety: (flat.fireSafety as Record<string, boolean>) ?? undefined,
      approvedBy: (flat.approvedBy as Record<string, boolean>) ?? undefined,
      parkingAvailable: b(flat.parkingAvailable),
      noOfParkings: n(flat.noOfParkings),
      amenityIds: Array.isArray(flat.amenities)
        ? (flat.amenities as { amenityId: number }[]).map((a) => a.amenityId)
        : undefined,
    },
    meta: {
      title: s(flat.title),
      description: s(flat.description),
      draftState: Array.isArray(flat.media) && flat.media.length
        ? {
            mediaUploads: (flat.media as Array<any>).map((m) => ({
              localId: String(m.id || crypto.randomUUID()),
              id: m.id,
              name: m.meta?.name || `photo_${m.id}.webp`,
              size: m.meta?.size || 0,
              type: m.type === "VIDEO" ? "video/mp4" : "image/webp",
              preview: m.url,
              uploadedUrl: m.url,
              uploaded: true,
              wasCompressed: Boolean(m.meta?.savedPercentage),
              savedPercentage: m.meta?.savedPercentage,
            })),
          }
        : undefined,
    },
    media: {
      mediaIds: Array.isArray(flat.mediaIds) ? (flat.mediaIds as number[]) : undefined,
    },
    publishOptions: {
      status: s(flat.status) as PropertyListingFormValues["publishOptions"]["status"],
    },
  });

  // deep-merge partial over defaults
  const merge = <T,>(base: T, over: Partial<T>): T => {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(over ?? {})) {
      if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object") {
        out[k] = merge(out[k], v as Partial<unknown>);
      } else if (v !== undefined) {
        out[k] = v;
      }
    }
    return out as T;
  };

  return merge(initialPropertyListingFormValues, partial as Partial<PropertyListingFormValues>);
}
