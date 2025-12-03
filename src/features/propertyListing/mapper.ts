import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { propertyTypes, propertySubTypeCatalog } from "./constants";

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const stripEmpty = <T extends Record<string, unknown>>(obj: T): T => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return;
    cleaned[key] = value;
  });
  return cleaned as T;
};

const floorEnumFromValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return undefined;
  const allowed = [
    "LOWER_BASEMENT",
    "BASEMENT",
    "LOWER_GROUND",
    "GROUND",
    "ROOFTOP_TERRACE",
    ...Array.from({ length: 20 }, (_, i) => `FLOOR_${i + 1}`),
  ];
  const asString = typeof value === "number" ? value.toString() : `${value}`.toUpperCase();
  if (asString.startsWith("FLOOR_") && allowed.includes(asString)) return asString;
  const num = Number(asString.replace(/[^0-9]/g, ""));
  if (Number.isFinite(num) && allowed.includes(`FLOOR_${num}`)) return `FLOOR_${num}`;
  if (allowed.includes(asString)) return asString;
  return undefined;
};

export const mapFormToApiPayload = (form: PropertyListingFormValues) => {
  const { context, location, details, pricing, availability, amenities, meta, publishOptions } = form;

  const baseTitle = meta.title?.trim() || location.societyOrProjectName || location.address || "Property listing";

  const selectedType = propertyTypes.find((p) => p.id === `${context.propertyTypeId ?? ""}`);
  const selectedSubType = selectedType
    ? (propertySubTypeCatalog[selectedType.subTypeGroupSlug] ?? []).find((s) => s.id === `${context.propertySubTypeId ?? ""}`)
    : undefined;
  const selectedSubCategory = selectedSubType?.categories?.find((c) => c.id === `${context.propertySubCategoryId ?? ""}`);
  const selectedLocatedInside = selectedSubType?.locatedInsideOptions?.find((l) => l.id === `${context.locatedInsideId ?? ""}`);

  const safeConstructionType =
    availability.constructionType && typeof availability.constructionType === "object" ? availability.constructionType : undefined;
  const safeApprovedBy = amenities.approvedBy && typeof amenities.approvedBy === "object" ? amenities.approvedBy : undefined;
  const safeFireSafety = amenities.fireSafety && typeof amenities.fireSafety === "object" ? amenities.fireSafety : undefined;
  const safeFacilities = amenities.facilities && typeof amenities.facilities === "object" ? amenities.facilities : undefined;
  const safeSocietyFeatures =
    amenities.societyFeatures && typeof amenities.societyFeatures === "object" ? amenities.societyFeatures : undefined;
  const safeReservedParking =
    amenities.reservedParking && typeof amenities.reservedParking === "object" ? amenities.reservedParking : undefined;
  const safeOtherRooms = details.otherRooms && typeof details.otherRooms === "object" ? details.otherRooms : undefined;

  const base = {
    title: baseTitle,
    description: meta.description?.trim() || undefined,
    listingType: context.listingType,
    resCom: context.resCom,
    postedAs: context.postedAs,
    propertyTypeSlug: selectedType?.slug,
    propertySubTypeSlug: selectedSubType?.slug,
    propertySubCategorySlug: selectedSubCategory?.slug,
    locatedInsideSlug: selectedLocatedInside?.slug,
    organizationId: toNumber(context.organizationId),
    ownerId: context.ownerId ?? undefined,
    createdById: context.createdById ?? undefined,

    // location
    cityId: toNumber(location.cityId),
    cityName: location.cityName || undefined,
    localityId: toNumber(location.localityId),
    locality: location.locality || undefined,
    subLocality: location.subLocality || undefined,
    projectId: toNumber(location.projectId),
    societyOrProjectName: location.societyOrProjectName || undefined,
    mall: location.mall || undefined,
    address: location.address || undefined,
    houseNumber: location.houseNumber || undefined,
    plotNumber: location.plotNumber || undefined,
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,

    // details (structure)
    areaSize: details.areaSize ?? undefined,
    areaUnit: details.areaUnit || undefined,
    carpetArea: details.carpetArea ?? undefined,
    carpetAreaUnit: details.carpetAreaUnit || undefined,
    builtUpArea: details.builtUpArea ?? undefined,
    builtUpAreaUnit: details.builtUpAreaUnit || undefined,
    superBuiltUpArea: details.superBuiltUpArea ?? undefined,
    superBuiltUpAreaUnit: details.superBuiltUpAreaUnit || undefined,
    plotArea: details.plotArea ?? undefined,
    plotAreaUnit: details.plotAreaUnit || undefined,
    // superArea/minArea/maxArea not present in PropertyDetailsBlock; keep omitted
    plotLength: details.plotLength ?? undefined,
    plotBreadth: details.plotBreadth ?? undefined,
    widthOfFacingRoad: details.widthOfFacingRoad ?? undefined,
    widthUnit: details.widthUnit || undefined,
    entranceWidth: details.entranceWidth ?? undefined,
    entranceWidthUnit: details.entranceWidthUnit || undefined,
    ceilingWidth: details.ceilingWidth ?? undefined,
    ceilingWidthUnit: details.ceilingWidthUnit || undefined,
    bedrooms: details.bedrooms ?? undefined,
    bathrooms: details.bathrooms ?? undefined,
    balconies: details.balconies ?? undefined,
    otherRooms: safeOtherRooms,
    totalFloors: details.totalFloors ?? undefined,
    floorNumber: floorEnumFromValue(details.floorNumber),
    floorsAllowed: details.floorsAllowed ?? undefined,
    lift: details.lift ?? undefined,
    propertyFacing: details.propertyFacing || undefined,
    roomType: details.roomType || undefined,
    sharingCapacity: details.sharingCapacity ?? undefined,
    totalBeds: details.totalBeds ?? undefined,
    availableBeds: details.availableBeds ?? undefined,
    foodIncluded: details.foodIncluded ?? undefined,
    acAvailable: details.acAvailable ?? undefined,
    attachedBathroom: details.attachedBathroom ?? undefined,
    attachedBalcony: details.attachedBalcony ?? undefined,
    availableFor: details.availableFor || undefined,
    maxNoOfSeats: details.maxNoOfSeats ?? undefined,
    minNoOfSeats: details.minNoOfSeats ?? undefined,
    noOfPrivateWashroom: details.noOfPrivateWashroom ?? undefined,
    noOfSharedWashroom: details.noOfSharedWashroom ?? undefined,
    washRoomAvailable: details.washRoomAvailable ?? undefined,
    totalRooms: details.totalRooms ?? undefined,
    meetingRooms: details.meetingRooms ?? undefined,
    cabins: details.cabins ?? undefined,
    washrooms: details.washrooms ?? undefined,
    multiFloorSelect: details.multiFloorSelect ?? undefined,
    multiFloorNum: details.multiFloorNum ?? undefined,
    openSides: details.openSides ?? undefined,
    staircases: details.staircases ?? undefined,
    zoneType: details.zoneType || undefined,
    suitableForBussinessType: details.suitableForBussinessType || undefined,

    // pricing
    price: pricing.price ?? undefined,
    priceType: pricing.priceType || undefined,
    pricePerSqFt: pricing.pricePerSqFt ?? undefined,
    pricePerUnitArea: pricing.pricePerUnitArea ?? undefined,
    pricePerUnitAreaUnit: pricing.pricePerUnitAreaUnit || undefined,
    priceNegotiable: typeof pricing.priceNegotiable === "boolean" ? pricing.priceNegotiable : undefined,
    priceInWords: pricing.priceInWords || undefined,
    deposit: pricing.deposit ?? undefined,
    maintenance: pricing.maintenance ?? undefined,
    maintenancePaymentPeriod: pricing.maintenancePaymentPeriod || undefined,
    allInclusivePrice: typeof pricing.allInclusivePrice === "boolean" ? pricing.allInclusivePrice : undefined,
    taxAndGovtExcluded: typeof pricing.taxAndGovtExcluded === "boolean" ? pricing.taxAndGovtExcluded : undefined,
    inclusive: typeof pricing.inclusive === "boolean" ? pricing.inclusive : undefined,
    bookingAmount: pricing.bookingAmount ?? undefined,
    membershipCharge: pricing.membershipCharge ?? undefined,
    annualDuesPayable: pricing.annualDuesPayable ?? undefined,
    expectedRental: pricing.expectedRental ?? undefined,
    expectedAnnualReturns: pricing.expectedAnnualReturns ?? undefined,
    brokerage: pricing.brokerage ?? undefined,
    brokerageType: pricing.brokerageType || undefined,
    brokerageNegotiable: pricing.brokerageNegotiable ?? undefined,
    taxGovtCharges: pricing.taxGovtCharges ?? undefined,

    // availability / legal
    availabilityStatus: availability.availabilityStatus || undefined,
    availableFrom: availability.availableFrom || undefined,
    possessionStatus: availability.possessionStatus || undefined,
    possessionType: availability.possessionType || undefined,
    possessionBy: availability.possessionBy || undefined,
    possessionByMonth: availability.possessionByMonth ?? undefined,
    constructionDone: availability.constructionDone ?? undefined,
    constructionType: safeConstructionType,
    ownershipType: amenities.ownershipType || undefined,
    approvedBy: safeApprovedBy,
    boundaryWall: amenities.boundaryWall ?? undefined,
    fireNoc: amenities.fireNoc ?? undefined,
    authorityIds: amenities.authorityIds?.length ? amenities.authorityIds : undefined,
    ageOfProperty: availability.ageOfProperty || undefined,
    pantryType: amenities.pantryType || undefined,
    pantrySize: amenities.pantrySize ?? undefined,
    pantryUnit: amenities.pantryUnit || undefined,
    conferenceRoom: amenities.conferenceRoom ?? undefined,
    receptionArea: amenities.receptionArea ?? undefined,
    fireSafety: safeFireSafety,
    facilities: safeFacilities,
    societyFeatures: safeSocietyFeatures,
    parkingAvailable: amenities.parkingAvailable ?? undefined,
    privateParkingBasement: amenities.privateParkingBasement ?? undefined,
    privateParkingOutside: amenities.privateParkingOutside ?? undefined,
    publicParking: amenities.publicParking ?? undefined,
    noOfParkings: amenities.noOfParkings ?? undefined,
    reservedParking: safeReservedParking,

    status: publishOptions.status,
    aiMetadata: meta.aiMetadata ?? undefined,
    draftState: meta.draftState ?? undefined,
    structure: stripEmpty({
      bedrooms: details.bedrooms ?? undefined,
      bathrooms: details.bathrooms ?? undefined,
      balconies: details.balconies ?? undefined,
      washrooms: details.washrooms ?? undefined,
      meetingRooms: details.meetingRooms ?? undefined,
      cabins: details.cabins ?? undefined,
      totalRooms: details.totalRooms ?? undefined,
      totalFloors: details.totalFloors ?? undefined,
      floorsAllowed: details.floorsAllowed ?? undefined,
      openSides: details.openSides ?? undefined,
      staircases: details.staircases ?? undefined,
      multiFloorSelect: details.multiFloorSelect ?? undefined,
      multiFloorNum: details.multiFloorNum ?? undefined,
      areaSize: details.areaSize ?? undefined,
      builtUpArea: details.builtUpArea ?? undefined,
      carpetArea: details.carpetArea ?? undefined,
      superBuiltUpArea: details.superBuiltUpArea ?? undefined,
      plotArea: details.plotArea ?? undefined,
      plotLength: details.plotLength ?? undefined,
      plotBreadth: details.plotBreadth ?? undefined,
      widthOfFacingRoad: details.widthOfFacingRoad ?? undefined,
      widthUnit: details.widthUnit || undefined,
      // superArea/minArea/maxArea not captured in frontend form; omit
      areaUnit: details.areaUnit || undefined,
      roomType: details.roomType || undefined,
      sharingCapacity: details.sharingCapacity ?? undefined,
      availableBeds: details.availableBeds ?? undefined,
      foodIncluded: details.foodIncluded ?? undefined,
      acAvailable: details.acAvailable ?? undefined,
      attachedBathroom: details.attachedBathroom ?? undefined,
      attachedBalcony: details.attachedBalcony ?? undefined,
      pantryType: amenities.pantryType || undefined,
      pantrySize: amenities.pantrySize ?? undefined,
      pantryUnit: amenities.pantryUnit || undefined,
      furnishing: amenities.furnishing || undefined,
      furnishingDetails: amenities.furnishingDetails,
      conferenceRoom: amenities.conferenceRoom ?? undefined,
      receptionArea: amenities.receptionArea ?? undefined,
      // centralAirConditioning / ups / oxygenDuct not present in PropertyDetailsBlock typing; omit
      fireSafety: safeFireSafety,
      facilities: safeFacilities,
      societyFeatures: safeSocietyFeatures,
      parkingAvailable: amenities.parkingAvailable ?? undefined,
      privateParkingBasement: amenities.privateParkingBasement ?? undefined,
      privateParkingOutside: amenities.privateParkingOutside ?? undefined,
      publicParking: amenities.publicParking ?? undefined,
      noOfParkings: amenities.noOfParkings ?? undefined,
      reservedParking: safeReservedParking,
      totalBeds: details.totalBeds ?? undefined,
      lift: details.lift ?? undefined,
      maxNoOfSeats: details.maxNoOfSeats ?? undefined,
      minNoOfSeats: details.minNoOfSeats ?? undefined,
      noOfPrivateWashroom: details.noOfPrivateWashroom ?? undefined,
      noOfSharedWashroom: details.noOfSharedWashroom ?? undefined,
      washRoomAvailable: details.washRoomAvailable ?? undefined,
      ceilingWidth: details.ceilingWidth ?? undefined,
      ceilingWidthUnit: details.ceilingWidthUnit || undefined,
      entranceWidth: details.entranceWidth ?? undefined,
      entranceWidthUnit: details.entranceWidthUnit || undefined,
      floorNumber: floorEnumFromValue(details.floorNumber),
    }),
  };

  // API expects amenity objects; convert if present
  const amenityPayload = amenities.amenityIds?.length
    ? {
        amenities: amenities.amenityIds.map((id) => ({ amenityId: id, value: true })),
      }
    : {};

  return {
    ...stripEmpty(base),
    ...amenityPayload,
  };
};
