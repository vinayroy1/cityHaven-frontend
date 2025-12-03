import type { PropertyListingFormValues } from "@/types/propertyListing.types";

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
    cleaned[key] = value;
  });
  return cleaned as T;
};

export const mapFormToApiPayload = (form: PropertyListingFormValues) => {
  const { context, location, details, pricing, availability, amenities, meta, media, publishOptions } = form;

  const base = {
    title: meta.title,
    description: meta.description,
    listingType: context.listingType,
    resCom: context.resCom,
    postedAs: context.postedAs,
    propertyTypeId: toNumber(context.propertyTypeId),
    propertySubTypeId: toNumber(context.propertySubTypeId),
    propertySubCategoryId: toNumber(context.propertySubCategoryId),
    locatedInsideId: toNumber(context.locatedInsideId),
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
    pincode: location.pincode || undefined,
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,
    totalTowers: location.totalTowers ?? undefined,
    totalUnits: location.totalUnits ?? undefined,
    constructionStatus: location.constructionStatus || undefined,
    possessionDate: location.possessionDate || undefined,

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
    plotLength: details.plotLength ?? undefined,
    plotBreadth: details.plotBreadth ?? undefined,
    widthOfFacingRoad: details.widthOfFacingRoad ?? undefined,
    widthUnit: details.widthUnit || undefined,
    entranceWidth: details.entranceWidth ?? undefined,
    entranceWidthUnit: details.entranceWidthUnit || undefined,
    ceilingWidth: details.ceilingWidth ?? undefined,
    ceilingWidthUnit: details.ceilingWidthUnit || undefined,
    ceilingHeight: details.ceilingHeight ?? undefined,
    ceilingHeightUnit: details.ceilingHeightUnit || undefined,
    bedrooms: details.bedrooms ?? undefined,
    bathrooms: details.bathrooms ?? undefined,
    balconies: details.balconies ?? undefined,
    otherRooms: details.otherRooms,
    totalFloors: details.totalFloors ?? undefined,
    floorNumber: details.floorNumber || undefined,
    floorsAllowed: details.floorsAllowed ?? undefined,
    lift: details.lift ?? undefined,
    ageOfProperty: details.ageOfProperty || undefined,
    propertyFacing: details.propertyFacing || undefined,
    kitchenType: details.kitchenType || undefined,
    roomType: details.roomType || undefined,
    sharingCapacity: details.sharingCapacity ?? undefined,
    totalBeds: details.totalBeds ?? undefined,
    availableBeds: details.availableBeds ?? undefined,
    foodIncluded: details.foodIncluded ?? undefined,
    pgFor: details.pgFor || undefined,
    mealType: details.mealType || undefined,
    sharingType: details.sharingType || undefined,
    securityDeposit: details.securityDeposit ?? undefined,
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
    washroomType: details.washroomType || undefined,
    officeType: details.officeType || undefined,
    cabinCount: details.cabinCount ?? undefined,
    workstations: details.workstations ?? undefined,
    multiFloorSelect: details.multiFloorSelect ?? undefined,
    multiFloorNum: details.multiFloorNum ?? undefined,
    openSides: details.openSides ?? undefined,
    staircases: details.staircases ?? undefined,
    zoneType: details.zoneType || undefined,
    suitableForBussinessType: details.suitableForBussinessType,
    businessApproval: details.businessApproval || undefined,

    // pricing
    price: pricing.price ?? undefined,
    priceType: pricing.priceType || undefined,
    pricePerSqFt: pricing.pricePerSqFt ?? undefined,
    pricePerUnitArea: pricing.pricePerUnitArea ?? undefined,
    pricePerUnitAreaUnit: pricing.pricePerUnitAreaUnit || undefined,
    priceNegotiable: pricing.priceNegotiable ?? undefined,
    priceInWords: pricing.priceInWords || undefined,
    priceRangeText: pricing.priceRangeText || undefined,
    minPrice: pricing.minPrice ?? undefined,
    maxPrice: pricing.maxPrice ?? undefined,
    deposit: pricing.deposit ?? undefined,
    maintenance: pricing.maintenance ?? undefined,
    maintenancePaymentPeriod: pricing.maintenancePaymentPeriod || undefined,
    allInclusivePrice: pricing.allInclusivePrice ?? undefined,
    taxAndGovtExcluded: pricing.taxAndGovtExcluded ?? undefined,
    inclusive: pricing.inclusive || undefined,
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
    constructionType: availability.constructionType || undefined,
    ownershipType: amenities.ownershipType || undefined,
    approvedBy: amenities.approvedBy,
    boundaryWall: amenities.boundaryWall ?? undefined,
    fireNoc: amenities.fireNoc ?? undefined,
    authorityIds: amenities.authorityIds?.length ? amenities.authorityIds : undefined,
    ageOfProperty: availability.ageOfProperty || undefined,

    furnishing: amenities.furnishing || undefined,
    furnishingDetails: amenities.furnishingDetails,
    pantryType: amenities.pantryType || undefined,
    pantrySize: amenities.pantrySize ?? undefined,
    pantryUnit: amenities.pantryUnit || undefined,
    conferenceRoom: amenities.conferenceRoom ?? undefined,
    receptionArea: amenities.receptionArea ?? undefined,
    fireSafety: amenities.fireSafety,
    facilities: amenities.facilities,
    societyFeatures: amenities.societyFeatures,
    parkingAvailable: amenities.parkingAvailable ?? undefined,
    privateParkingBasement: amenities.privateParkingBasement ?? undefined,
    privateParkingOutside: amenities.privateParkingOutside ?? undefined,
    publicParking: amenities.publicParking ?? undefined,
    noOfParkings: amenities.noOfParkings ?? undefined,
    reservedParking: amenities.reservedParking,

    status: publishOptions.status,
    qcRequired: publishOptions.qcRequired,
    aiMetadata: meta.aiMetadata ?? undefined,
    draftState: meta.draftState ?? undefined,
    amenityIds: amenities.amenityIds,
    mediaIds: media.mediaIds,
    documentIds: media.documentIds,
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
