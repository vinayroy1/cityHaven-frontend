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

  // In database responses, relations may be populated as objects or raw IDs/slugs:
  // e.g. propertySubType: { slug: 'office' }, propertySubCategory: { slug: 'co-working-office-space' }, locatedInside: { slug: 'it-park' }
  const subTypeObj = flat.propertySubType as Record<string, unknown> | undefined;
  const subCatObj = flat.propertySubCategory as Record<string, unknown> | undefined;
  const typeObj = flat.propertyType as Record<string, unknown> | undefined;
  const locatedObj = flat.locatedInside as Record<string, unknown> | undefined;
  const draftContext = ((flat.draftState as Record<string, unknown>)?.form as Record<string, unknown>)?.context as Record<string, unknown> | undefined;

  const resolvedPropertyTypeSlug =
    s(flat.propertyTypeSlug) ||
    s(typeObj?.slug) ||
    s(draftContext?.propertyTypeSlug);

  // Map of known database IDs to frontend slugs as a fallback
  const SUBTYPE_ID_TO_SLUG: Record<number, string> = {
    1: "apartment", 2: "independent-house-villa", 3: "independent-builder-floor", 4: "1rk-studio-apartment",
    5: "serviced-apartment", 6: "plot-land-res", 7: "farmhouse", 8: "residential-other",
    9: "office", 10: "retail", 11: "plot-land-com", 12: "storage",
    13: "industry", 14: "hospitality", 15: "commercial-other",
    16: "pg-private-room", 17: "pg-shared-room", 18: "pg-bed",
  };

  const SUB_CATEGORY_ID_TO_SLUG: Record<number, string> = {
    1: "ready-to-move-office-space", 2: "bare-shell-office-space", 3: "co-working-office-space",
    4: "commercial-shops", 5: "commercial-showrooms", 6: "commercial-land-inst-land",
    7: "agricultural-farm-land", 8: "industrial-lands-plots", 9: "warehouse",
    10: "cold-storage", 11: "godown", 12: "factory", 13: "manufacturing",
    14: "hotel-resorts", 15: "guest-house-banquet-halls",
  };

  const subTypeIdNum = n(flat.propertySubTypeId) ?? n(subTypeObj?.id) ?? n(draftContext?.propertySubTypeId);
  const subCatIdNum = n(flat.propertySubCategoryId) ?? n(subCatObj?.id) ?? n(draftContext?.propertySubCategoryId);

  const resolvedPropertySubTypeSlug =
    s(flat.propertySubTypeSlug) ||
    s(subTypeObj?.slug) ||
    s(draftContext?.propertySubTypeSlug) ||
    (subTypeIdNum ? SUBTYPE_ID_TO_SLUG[subTypeIdNum] : undefined);

  const resolvedPropertySubCategorySlug =
    s(flat.propertySubCategorySlug) ||
    s(subCatObj?.slug) ||
    s(draftContext?.propertySubCategorySlug) ||
    (subCatIdNum ? SUB_CATEGORY_ID_TO_SLUG[subCatIdNum] : undefined);

  const LOCATED_INSIDE_ID_TO_SLUG: Record<number, string> = {
    1: "mall", 2: "commercial-project", 3: "retail-complex", 4: "market-high-street", 5: "it-park",
    6: "business-park", 7: "business-center", 8: "corporate-tower", 9: "commercial-complex", 10: "others",
    11: "mall", 12: "commercial-project", 13: "retail-complex", 14: "market-high-street", 15: "it-park",
    16: "business-park", 17: "business-center", 18: "corporate-tower", 19: "commercial-complex", 20: "others",
  };

  const locatedIdNum = n(flat.locatedInsideId) ?? n(locatedObj?.id) ?? n(draftContext?.locatedInsideId);

  const rawLocatedInsideSlug =
    s(flat.locatedInsideSlug) ||
    s(locatedObj?.slug) ||
    s(draftContext?.locatedInsideSlug) ||
    (locatedIdNum ? LOCATED_INSIDE_ID_TO_SLUG[locatedIdNum] : undefined);

  // Normalize locatedInsideSlug: backend seeds slug as e.g. 'it-park-office' or 'retail-complex-building-office',
  // whereas the frontend radio chip values use base slugs ('it-park', 'retail-complex', etc.).
  const normalizeLocatedSlug = (raw?: string | null): string | undefined => {
    if (!raw) return undefined;
    const stripped = raw.replace(/-(office|retail|commercial)$/, "");
    if (stripped === "retail-complex-building") return "retail-complex";
    return stripped;
  };

  const resolvedLocatedInsideSlug = normalizeLocatedSlug(rawLocatedInsideSlug);

  // Derive resCom reliably if missing or null in flat data (e.g. legacy DB rows or partial drafts).
  // In the DB, propertyTypeId 1 = Residential, 2 = Commercial, 3 = PG.
  // Also office/retail/commercial subtypes belong to Commercial.
  const resolvedResCom =
    (s(flat.resCom) as PropertyListingFormValues["context"]["resCom"]) ||
    (s(draftContext?.resCom) as PropertyListingFormValues["context"]["resCom"]) ||
    (resolvedPropertyTypeSlug === "commercial" ||
    subTypeObj?.propertyTypeSlug === "commercial" ||
    flat.propertyTypeId === 2 ||
    flat.propertyTypeId === "2" ||
    (resolvedPropertySubTypeSlug && ["office", "retail", "plot-land-com", "storage", "industry", "hospitality", "commercial-other"].includes(resolvedPropertySubTypeSlug))
      ? "COMMERCIAL"
      : resolvedPropertyTypeSlug === "residential" ||
        subTypeObj?.propertyTypeSlug === "residential" ||
        flat.propertyTypeId === 1 ||
        flat.propertyTypeId === "1" ||
        (resolvedPropertySubTypeSlug && ["apartment", "independent-house-villa", "independent-builder-floor", "1rk-studio-apartment", "serviced-apartment", "plot-land-res", "farmhouse", "residential-other"].includes(resolvedPropertySubTypeSlug))
      ? "RESIDENTIAL"
      : undefined);

  const partial = prune({
    context: {
      listingType: s(flat.listingType) as PropertyListingFormValues["context"]["listingType"],
      resCom: resolvedResCom,
      postedAs: s(flat.postedAs) || s(draftContext?.postedAs),
      propertyTypeId: s(flat.propertyTypeId) || s(draftContext?.propertyTypeId),
      propertySubTypeId: s(flat.propertySubTypeId) || s(draftContext?.propertySubTypeId),
      propertySubCategoryId: s(flat.propertySubCategoryId) || s(draftContext?.propertySubCategoryId),
      locatedInsideId: s(flat.locatedInsideId) || s(locatedObj?.id) || s(draftContext?.locatedInsideId),
      propertyTypeSlug: resolvedPropertyTypeSlug,
      propertySubTypeSlug: resolvedPropertySubTypeSlug,
      propertySubCategorySlug: resolvedPropertySubCategorySlug,
      locatedInsideSlug: resolvedLocatedInsideSlug,
      organizationId: s(flat.organizationId) || s(draftContext?.organizationId),
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
