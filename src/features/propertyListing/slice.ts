"use client";

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const mergeDraft = <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
  const output: Record<string, unknown> = Array.isArray(target) ? [...(target as unknown[])] : { ...target };
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined) return;
    const current = (output as Record<string, unknown>)[key];
    if (
      current &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      (output as Record<string, unknown>)[key] = mergeDraft(current as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      (output as Record<string, unknown>)[key] = value as unknown;
    }
  });
  return output as T;
};

export const initialPropertyListingFormValues: PropertyListingFormValues = {
  context: {
    listingType: "RENT",
    resCom: "RESIDENTIAL",
    postedAs: "OWNER",
    propertyTypeId: "",
    propertySubTypeId: "",
    propertySubCategoryId: "",
    locatedInsideId: "",
    organizationId: "",
    ownerId: null,
    createdById: null,
  },
  location: {
    cityId: "",
    cityName: "",
    localityId: "",
    locality: "",
    subLocality: "",
    projectId: "",
    societyOrProjectName: "",
    mall: "",
    address: "",
    houseNumber: "",
    plotNumber: "",
    latitude: null,
    longitude: null,
  },
  details: {
    areaSize: null,
    areaUnit: "SQ_FT",
    carpetArea: null,
    carpetAreaUnit: "SQ_FT",
    builtUpArea: null,
    builtUpAreaUnit: "SQ_FT",
    superBuiltUpArea: null,
    superBuiltUpAreaUnit: "SQ_FT",
    plotArea: null,
    plotAreaUnit: "SQ_FT",
    plotLength: null,
    plotBreadth: null,
    widthOfFacingRoad: null,
    widthUnit: "FEET",
    entranceWidth: null,
    entranceWidthUnit: "FEET",
    ceilingWidth: null,
    ceilingWidthUnit: "FEET",
    bedrooms: null,
    bathrooms: null,
    balconies: null,
    otherRooms: {},
    totalFloors: null,
    floorNumber: "",
    lift: false,
    ageOfProperty: "",
    propertyFacing: "",
    roomType: "",
    sharingCapacity: null,
    totalBeds: null,
    availableBeds: null,
    foodIncluded: false,
    acAvailable: false,
    attachedBathroom: false,
    attachedBalcony: false,
    availableFor: "",
    maxNoOfSeats: null,
    minNoOfSeats: null,
    noOfPrivateWashroom: null,
    noOfSharedWashroom: null,
    washRoomAvailable: false,
    totalRooms: null,
    meetingRooms: null,
    cabins: null,
    washrooms: null,
    multiFloorSelect: false,
    multiFloorNum: null,
    openSides: null,
    staircases: null,
    zoneType: "",
    suitableForBussinessType: {},
  },
  pricing: {
    price: null,
    priceType: "MONTHLY",
    pricePerSqFt: null,
    priceNegotiable: true,
    priceInWords: "",
    priceRangeText: "",
    minPrice: null,
    maxPrice: null,
    deposit: null,
    maintenance: null,
    maintenancePaymentPeriod: "",
    allInclusivePrice: false,
    taxAndGovtExcluded: false,
    inclusive: "",
    bookingAmount: null,
    membershipCharge: null,
    annualDuesPayable: null,
    expectedRental: null,
    expectedAnnualReturns: null,
    brokerage: null,
    brokerageType: "",
    brokerageNegotiable: true,
    taxGovtCharges: null,
  },
  availability: {
    availabilityStatus: "READY_TO_MOVE",
    availableFrom: "",
    possessionStatus: "READY_TO_MOVE",
    possessionType: "",
    possessionBy: "",
    possessionByMonth: null,
    constructionDone: true,
    constructionType: "",
    ageOfProperty: "",
  },
  amenities: {
    furnishing: "SEMI_FURNISHED",
    furnishingDetails: {},
    pantryType: "",
    pantrySize: null,
    pantryUnit: "SQ_FT",
    conferenceRoom: false,
    receptionArea: false,
    fireSafety: {},
    facilities: {},
    societyFeatures: {},
    parkingAvailable: true,
    privateParkingBasement: false,
    privateParkingOutside: false,
    publicParking: false,
    noOfParkings: 1,
    reservedParking: {},
    ownershipType: "FREEHOLD",
    authorityIds: [],
    approvedBy: {},
    boundaryWall: false,
    fireNoc: false,
    amenityIds: [],
  },
  meta: {
    title: "",
    description: "",
    aiMetadata: null,
    draftState: null,
  },
  media: {
    mediaIds: [],
    documentIds: [],
  },
  publishOptions: {
    status: "DRAFT",
    qcRequired: true,
  },
};

export interface PropertyListingState {
  draft: PropertyListingFormValues;
  status: "idle" | "saving" | "submitting" | "submitted" | "failed";
  error?: string | null;
  lastSubmittedAt?: string | null;
}

const initialState: PropertyListingState = {
  draft: initialPropertyListingFormValues,
  status: "idle",
  error: null,
  lastSubmittedAt: null,
};

export const submitProperty = createAsyncThunk<PropertyListingFormValues, PropertyListingFormValues>(
  "propertyListing/submitProperty",
  async (payload) => {
    // Replace with real API call; kept optimistic for now.
    await new Promise((resolve) => setTimeout(resolve, 650));
    return payload;
  },
);

const propertyListingSlice = createSlice({
  name: "propertyListing",
  initialState,
  reducers: {
    saveDraft: (state, action: PayloadAction<Partial<PropertyListingFormValues>>) => {
      state.draft = mergeDraft(state.draft, action.payload);
      state.status = "saving";
    },
    hydrateDraft: (state, action: PayloadAction<PropertyListingFormValues>) => {
      state.draft = action.payload;
      state.status = "idle";
    },
    resetDraft: (state) => {
      state.draft = initialPropertyListingFormValues;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitProperty.pending, (state) => {
        state.status = "submitting";
        state.error = null;
      })
      .addCase(submitProperty.fulfilled, (state, action) => {
        state.status = "submitted";
        state.draft = action.payload;
        state.lastSubmittedAt = new Date().toISOString();
      })
      .addCase(submitProperty.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.error.message as string) ?? "Submission failed";
      });
  },
});

export const { saveDraft, hydrateDraft, resetDraft } = propertyListingSlice.actions;
export default propertyListingSlice.reducer;
