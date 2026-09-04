// "Tell us about your property" — one scrollable step whose sections/fields are
// gated by the predicate registry. Every field is tied to a Basic-Details
// selection (listing type + category + sub-type); nothing generic is asked.

import { preset } from "../conditions";
import {
  ageOfPropertyOptions,
  areaUnitOptions,
  businessUseOptions,
  constructionStatusOptions,
  constructionTypeOptions,
  facingOptions,
  fireSafetyOptions,
  floorOptions,
  furnishingItems,
  furnishingOptions,
  kitchenTypeOptions,
  lengthUnitOptions,
  locatedNearOptions,
  mealTypeOptions,
  officeTypeOptions,
  otherRoomsOptions,
  ownershipOptions,
  pantryTypeOptions,
  pgForOptions,
  possessionByOptions,
  qualityRatingOptions,
  sharingTypeOptions,
  washroomTypeOptions,
} from "../options";
import type { FieldConfig, Option, StepConfig } from "../types";

const measure = (id: string, label: string, extra?: Partial<FieldConfig>): FieldConfig => ({
  id,
  label,
  type: "measure",
  unitField: `${id}Unit`,
  unitOptions: areaUnitOptions,
  ...extra,
});

const counter = (id: string, label: string, extra?: Partial<FieldConfig>): FieldConfig => ({
  id,
  label,
  type: "counter",
  min: 0,
  max: 20,
  ...extra,
});

const num = (id: string, label: string, extra?: Partial<FieldConfig>): FieldConfig => ({
  id,
  label,
  type: "number",
  min: 0,
  ...extra,
});

// BHK quick-select — the primary residential descriptor.
const bhkOptions: Option[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  value: n,
  label: n === 6 ? "6+ BHK" : `${n} BHK`,
}));

export const propertyProfileStep: StepConfig = {
  id: "profile",
  label: "Property Profile",
  title: "Tell us about your property",
  caption: "Structure, layout & legal",
  kind: "config",
  sections: [
    {
      id: "titleDesc",
      title: "Title & description",
      fields: [
        {
          id: "meta.title",
          label: "Property title",
          type: "text",
          required: true,
          placeholder: "e.g. Spacious 3 BHK in Green View Residency",
          helpText: "A clear title with configuration + locality gets more views.",
        },
        {
          id: "meta.description",
          label: "Description",
          type: "textarea",
          placeholder: "Describe the property, connectivity, nearby landmarks and what makes it special.",
        },
      ],
    },

    {
      id: "config",
      title: "Configuration",
      visibleWhen: { or: [preset("hasBhkConfig"), preset("isStudio"), preset("isPG"), preset("isHospitality")] },
      fields: [
        {
          id: "details.bedrooms",
          label: "Bedrooms",
          type: "chip-radio",
          options: bhkOptions,
          visibleWhen: preset("showBedrooms"),
          requiredWhen: { and: [preset("isResidential"), preset("isSellOrRent")] },
        },
        counter("details.bathrooms", "Bathrooms", {
          visibleWhen: preset("showBathrooms"),
          requiredWhen: { and: [preset("isResidential"), preset("isSellOrRent")] },
          max: 10,
        }),
        counter("details.balconies", "Balconies", { visibleWhen: preset("showBalconies"), max: 10 }),
      ],
    },

    {
      id: "area",
      title: "Area details",
      requiredHint: "Enter at least one area",
      visibleWhen: preset("showAreaSection"),
      fields: [
        measure("details.carpetArea", "Carpet area", { visibleWhen: preset("showCarpetArea") }),
        measure("details.builtUpArea", "Built-up area", { visibleWhen: preset("showBuiltUpArea") }),
        measure("details.superBuiltUpArea", "Super built-up area", {
          visibleWhen: preset("showSuperBuiltUpArea"),
        }),
        measure("details.plotArea", "Plot area", {
          visibleWhen: preset("showPlotArea"),
          requiredWhen: preset("isPlot"),
        }),
        num("details.plotLength", "Plot length (ft.)", { visibleWhen: preset("isPlot") }),
        num("details.plotBreadth", "Plot breadth (ft.)", { visibleWhen: preset("isPlot") }),
      ],
    },

    {
      id: "layout",
      title: "Layout & floor",
      visibleWhen: {
        or: [
          preset("showKitchenType"),
          preset("showFloorNumber"),
          preset("showTotalFloors"),
          preset("showFloorsAllowed"),
          preset("showOpenSides"),
          preset("showPropertyFacing"),
        ],
      },
      fields: [
        {
          id: "details.kitchenType",
          label: "Kitchen type",
          type: "select",
          options: kitchenTypeOptions,
          visibleWhen: preset("showKitchenType"),
        },
        {
          id: "details.floorNumber",
          label: "Property on floor",
          type: "select",
          options: floorOptions,
          visibleWhen: preset("showFloorNumber"),
          requiredWhen: preset("isApartmentOrBuilder"),
        },
        num("details.totalFloors", "Total floors", {
          visibleWhen: preset("showTotalFloors"),
          requiredWhen: preset("isApartmentOrBuilder"),
        }),
        num("details.floorsAllowed", "Floors allowed for construction", {
          visibleWhen: preset("showFloorsAllowed"),
        }),
        {
          id: "details.multiFloorSelect",
          label: "Unit spans multiple floors",
          type: "toggle",
          visibleWhen: preset("showMultiFloor"),
        },
        num("details.multiFloorNum", "Number of floors in this unit", {
          visibleWhen: { field: "details.multiFloorSelect", equals: true },
        }),
        counter("details.openSides", "Open sides", { visibleWhen: preset("showOpenSides"), max: 4 }),
        num("details.staircases", "Staircases", { visibleWhen: preset("showStaircases") }),
        {
          id: "details.propertyFacing",
          label: "Property facing",
          type: "select",
          options: facingOptions,
          visibleWhen: preset("showPropertyFacing"),
        },
        {
          id: "details.widthOfFacingRoad",
          label: "Width of facing road",
          type: "measure",
          unitField: "details.widthUnit",
          unitOptions: lengthUnitOptions,
          visibleWhen: preset("showWidthOfFacingRoad"),
        },
      ],
    },

    {
      id: "otherRooms",
      title: "Other rooms",
      description: "Optional",
      visibleWhen: preset("showOtherRooms"),
      fields: [
        { id: "details.otherRooms", label: "Additional rooms", type: "chip-add", options: otherRoomsOptions },
      ],
    },

    {
      id: "furnishing",
      title: "Furnishing",
      visibleWhen: preset("showFurnishing"),
      fields: [
        {
          id: "amenities.furnishing",
          label: "Furnishing status",
          type: "chip-radio",
          required: true,
          options: furnishingOptions,
        },
        ...furnishingItems.map<FieldConfig>((item) => ({
          id: `amenities.furnishingDetails.${item.key}`,
          label: item.label,
          type: "counter",
          min: 0,
          max: 20,
          visibleWhen: { field: "amenities.furnishing", in: item.modes },
        })),
      ],
    },

    {
      id: "pg",
      title: "PG details",
      visibleWhen: preset("isPG"),
      fields: [
        { id: "details.pgFor", label: "Allowed for", type: "chip-radio", options: pgForOptions, required: true },
        {
          id: "details.availableFor",
          label: "Suitable for",
          type: "chip-radio",
          options: [
            { value: "STUDENTS", label: "Students" },
            { value: "WORKING_PROFESSIONALS", label: "Working professionals" },
            { value: "ANY", label: "Anyone" },
          ],
        },
        { id: "details.sharingType", label: "Room sharing", type: "select", options: sharingTypeOptions },
        counter("details.totalBeds", "Total beds", { max: 60 }),
        counter("details.availableBeds", "Beds available", { max: 60 }),
        { id: "details.foodIncluded", label: "Food included", type: "toggle" },
        {
          id: "details.mealType",
          label: "Meals provided",
          type: "select",
          options: mealTypeOptions,
          visibleWhen: { field: "details.foodIncluded", equals: true },
        },
        { id: "details.acAvailable", label: "AC available", type: "toggle" },
        { id: "details.attachedBathroom", label: "Attached bathroom", type: "toggle" },
        { id: "details.attachedBalcony", label: "Attached balcony", type: "toggle" },
      ],
    },

    {
      id: "commercial",
      title: "Commercial details",
      visibleWhen: preset("isCommercial"),
      fields: [
        { id: "details.officeType", label: "Office type", type: "select", options: officeTypeOptions, visibleWhen: preset("isOffice") },
        num("details.minNoOfSeats", "Min. seats", { visibleWhen: preset("isOffice") }),
        num("details.maxNoOfSeats", "Max. seats", { visibleWhen: preset("isOffice") }),
        counter("details.meetingRooms", "Meeting rooms", { visibleWhen: preset("isOffice") }),
        counter("details.cabins", "Cabins", { visibleWhen: preset("isOffice") }),
        num("details.workstations", "Workstations", { visibleWhen: preset("isOffice") }),
        { id: "details.washRoomAvailable", label: "Washrooms available", type: "toggle", visibleWhen: preset("isOffice") },
        { id: "amenities.conferenceRoom", label: "Conference room", type: "toggle", visibleWhen: preset("isOffice") },
        { id: "amenities.receptionArea", label: "Reception area", type: "toggle", visibleWhen: preset("isOffice") },
        { id: "amenities.pantryType", label: "Pantry", type: "select", options: pantryTypeOptions, visibleWhen: preset("isOffice") },
        measure("details.shopFacadeSize", "Shop frontage", {
          unitOptions: lengthUnitOptions,
          unitField: "details.shopFacadeSizeUnit",
          visibleWhen: preset("isShopCategory"),
        }),
        {
          id: "details.entranceWidth",
          label: "Entrance width",
          type: "measure",
          unitField: "details.entranceWidthUnit",
          unitOptions: lengthUnitOptions,
          visibleWhen: preset("isRetail"),
        },
        {
          id: "details.washroomType",
          label: "Washroom",
          type: "select",
          options: washroomTypeOptions,
          visibleWhen: preset("isRetail"),
        },
        {
          id: "details.locatedNear",
          label: "Located near",
          type: "chip-multi",
          options: locatedNearOptions,
          visibleWhen: preset("isRetail"),
        },
        {
          id: "details.suitableForBussinessType",
          label: "Suitable for business",
          type: "chip-multi",
          options: businessUseOptions,
          visibleWhen: preset("isShopCategory"),
        },
        counter("details.washrooms", "Washrooms", { visibleWhen: preset("isWarehouse") }),
        num("details.totalRooms", "Total rooms", { visibleWhen: preset("isHospitality") }),
        {
          id: "details.qualityRating",
          label: "Quality / star rating",
          type: "select",
          options: qualityRatingOptions,
          visibleWhen: preset("isHospitality"),
        },
        {
          id: "details.ceilingHeight",
          label: "Ceiling height",
          type: "measure",
          unitField: "details.ceilingHeightUnit",
          unitOptions: lengthUnitOptions,
          visibleWhen: { not: preset("isWarehouse") },
        },
      ],
    },

    {
      id: "legal",
      title: "Construction & legal",
      visibleWhen: preset("showLegalOrPlot"),
      fields: [
        {
          id: "availability.availabilityStatus",
          label: "Availability status",
          type: "chip-radio",
          required: true,
          visibleWhen: preset("showAvailabilityStatus"),
          options: constructionStatusOptions.concat(
            { value: "POSSESSION_SOON", label: "Possession soon" },
            { value: "NEW_LAUNCH", label: "New launch" },
          ),
        },
        {
          id: "availability.availableFrom",
          label: "Available from",
          type: "date",
          visibleWhen: preset("showAvailableFrom"),
        },
        {
          id: "availability.possessionBy",
          label: "Possession by",
          type: "select",
          options: possessionByOptions,
          visibleWhen: { field: "availability.availabilityStatus", equals: "UNDER_CONSTRUCTION" },
        },
        {
          id: "availability.constructionType",
          label: "Construction type",
          type: "select",
          options: constructionTypeOptions,
          visibleWhen: preset("showConstructionType"),
        },
        {
          id: "details.ageOfProperty",
          label: "Age of property",
          type: "chip-radio",
          options: ageOfPropertyOptions,
          visibleWhen: preset("showAgeOfProperty"),
        },
        {
          id: "amenities.ownershipType",
          label: "Ownership",
          type: "chip-radio",
          requiredWhen: preset("isSell"),
          options: ownershipOptions.concat({ value: "POWER_OF_ATTORNEY", label: "Power of attorney" }),
          visibleWhen: preset("showOwnership"),
        },
        {
          id: "amenities.approvedBy",
          label: "Approved by",
          type: "chip-add",
          visibleWhen: preset("showAuthority"),
          options: [
            { value: "DDA", label: "DDA" },
            { value: "MCD", label: "MCD" },
            { value: "NDMC", label: "NDMC" },
            { value: "RERA", label: "RERA" },
            { value: "OTHER", label: "Other" },
          ],
        },
        { id: "amenities.boundaryWall", label: "Boundary wall", type: "toggle", visibleWhen: preset("showBoundaryWall") },
        {
          id: "amenities.fireSafety",
          label: "Fire safety",
          type: "chip-add",
          options: fireSafetyOptions,
          visibleWhen: preset("showFireSafety"),
        },
        { id: "amenities.fireNoc", label: "Fire NOC obtained", type: "toggle", visibleWhen: preset("showFireSafety") },
      ],
    },

    {
      id: "society",
      title: "Society / project",
      visibleWhen: preset("showSociety"),
      fields: [
        { id: "location.societyOrProjectName", label: "Society / project name", type: "text" },
        num("location.totalTowers", "Total towers", { visibleWhen: preset("isApartmentOrBuilder") }),
        num("location.totalUnits", "Total units", { visibleWhen: preset("isApartmentOrBuilder") }),
        {
          id: "location.constructionStatus",
          label: "Construction status",
          type: "chip-radio",
          options: constructionStatusOptions,
          visibleWhen: preset("isSell"),
        },
        {
          id: "location.possessionDate",
          label: "Possession date",
          type: "date",
          visibleWhen: { field: "location.constructionStatus", equals: "UNDER_CONSTRUCTION" },
        },
      ],
    },

    {
      id: "liftsParking",
      title: "Lifts & parking",
      visibleWhen: preset("showLiftsAndParking"),
      fields: [
        { id: "details.lift", label: "Lift available", type: "toggle", visibleWhen: preset("showLift") },
        num("details.passengerLifts", "Passenger lifts", {
          visibleWhen: { and: [{ field: "details.lift", equals: true }, preset("showLiftCounts")] },
        }),
        num("details.serviceLifts", "Service lifts", {
          visibleWhen: { and: [{ field: "details.lift", equals: true }, preset("showLiftCounts")] },
        }),
        { id: "amenities.parkingAvailable", label: "Parking available", type: "toggle", visibleWhen: preset("showParking") },
        num("amenities.noOfParkings", "Number of parkings", {
          visibleWhen: { field: "amenities.parkingAvailable", equals: true },
        }),
        {
          id: "amenities.privateParkingBasement",
          label: "Private parking (basement)",
          type: "toggle",
          visibleWhen: { field: "amenities.parkingAvailable", equals: true },
        },
        {
          id: "amenities.privateParkingOutside",
          label: "Private parking (outside)",
          type: "toggle",
          visibleWhen: { field: "amenities.parkingAvailable", equals: true },
        },
        {
          id: "amenities.publicParking",
          label: "Public parking",
          type: "toggle",
          visibleWhen: { field: "amenities.parkingAvailable", equals: true },
        },
        {
          id: "amenities.multilevelParking",
          label: "Multilevel parking",
          type: "toggle",
          visibleWhen: preset("isShopCategory"),
        },
      ],
    },
  ],
};
