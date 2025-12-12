import type { ListingType, ResComType } from "@/types/propertyListing.types";

type VisibilityInput = {
  listingType?: ListingType;
  resCom?: ResComType;
  propertySubTypeSlug?: string;
  propertySubCategorySlug?: string;
  locatedInsideId?: string | null;
  projectId?: string | null;
  societyName?: string | null;
};

export type PropertyDetailsVisibility = {
  area: {
    showBuiltUp: boolean;
    showCarpet: boolean;
    carpetRequired: boolean;
    carpetUnitRequired: boolean;
    showSuperBuiltUp: boolean;
    showPlotArea: boolean;
    showPlotLength: boolean;
    showPlotBreadth: boolean;
    plotAreaRequired: boolean;
    plotUnitRequired: boolean;
  };
  rooms: {
    showBedrooms: boolean;
    bedroomsRequired: boolean;
    showBathrooms: boolean;
    bathroomsRequired: boolean;
    showBalconies: boolean;
    showKitchenType: boolean;
    showFloorNumber: boolean;
    floorNumberRequired: boolean;
    showTotalFloors: boolean;
    totalFloorsRequired: boolean;
    showFloorsAllowed: boolean;
    allowMultiFloorSelect: boolean;
    showStaircases: boolean;
    showOpenSides: boolean;
    showPropertyFacing: boolean;
    showWidthOfFacingRoad: boolean;
    showEntranceWidth: boolean;
    showCeilingWidth: boolean;
    showOtherRooms: boolean;
  };
  furnishing: {
    showSection: boolean;
    showOfficeFurnishing: boolean;
  };
  legal: {
    showSection: boolean;
    showAvailability: boolean;
    showConstructionType: boolean;
    showAgeOfProperty: boolean;
    showOwnershipType: boolean;
    showAuthority: boolean;
    showBoundaryWall: boolean;
    showFireSafety: boolean;
    showFireNoc: boolean;
    showBusinessApproval: boolean;
  };
  commercial: {
    showSection: boolean;
    showOfficeFields: boolean;
    showRetailFields: boolean;
    showWarehouseFields: boolean;
    showPantry: boolean;
    showCeilingHeight: boolean;
    showConferenceRoom: boolean;
    showTotalRooms: boolean;
    showMeetingRooms: boolean;
    showCabins: boolean;
    showWorkstations: boolean;
    showBusinessApproval: boolean;
    showOfficeSeats: boolean;
    showOfficeReception: boolean;
    showOfficeWashroomAvailability: boolean;
    showRetailWashroomType: boolean;
    showRetailLocatedNear: boolean;
    showRetailBusinessType: boolean;
    showShopFacade: boolean;
    showRetailEntranceWidth: boolean;
    showRetailCeilingHeight: boolean;
    showWarehouseWashrooms: boolean;
    showHospitalityQualityRating: boolean;
    showOfficeFacilities: boolean;
  };
  pg: {
    showSection: boolean;
    showBeds: boolean;
    showFood: boolean;
    showAc: boolean;
    showAttachedBathroom: boolean;
    showAttachedBalcony: boolean;
    showAvailableFor: boolean;
  };
  society: {
    showSocietyDetails: boolean;
  };
  building: {
    showSection: boolean;
    showParking: boolean;
    showParkingBreakdown: boolean;
    showMultilevelParking: boolean;
    showLifts: boolean;
    showLiftCounts: boolean;
  };
};

export const derivePropertyDetailsVisibility = ({
  listingType,
  resCom,
  propertySubTypeSlug,
  propertySubCategorySlug,
  locatedInsideId,
  projectId,
  societyName,
}: VisibilityInput): PropertyDetailsVisibility => {
  const isPG = listingType === "PG";
  const isPlot = !!propertySubTypeSlug?.includes("plot-land");
  const isResidential =
    [
      "apartment",
      "independent-house-villa",
      "independent-builder-floor",
      "1rk-studio-apartment",
      "serviced-apartment",
      "farmhouse",
      "residential-other",
    ].includes(propertySubTypeSlug ?? "") && resCom !== "COMMERCIAL" && !isPG && !isPlot;
  const isCommercial = resCom === "COMMERCIAL" && !isPlot && !isPG;
  const isApartmentOrBuilder = propertySubTypeSlug === "apartment" || propertySubTypeSlug === "independent-builder-floor";
  const isVilla = propertySubTypeSlug === "independent-house-villa";
  const isOffice = propertySubTypeSlug === "office";
  const isRetail = propertySubTypeSlug === "retail";
  const isWarehouse = propertySubTypeSlug === "storage";
  const isHospitality = propertySubTypeSlug === "hospitality";
  const isShopCategory = isRetail && propertySubCategorySlug === "commercial-shops";
  const insideComplex = Boolean(locatedInsideId);

  const showBuiltUp = (isResidential || isCommercial || isHospitality || isPG) && !isPlot && !isWarehouse;
  const showCarpet = (isResidential || isCommercial || isHospitality || isPG) && !isPlot;
  const showPlotArea = isPlot || isWarehouse;
  const showSuperBuiltUp = (isResidential || isHospitality || isCommercial) && !isPG && !isPlot && !isWarehouse;
  const showAreaUnit = showBuiltUp || showCarpet || showPlotArea || showSuperBuiltUp;

  const showBedrooms = (isResidential || isHospitality || isPG) && !isPlot;
  const showBathrooms = (isResidential || isHospitality || isPG) && !isPlot;
  const showBalconies = (isResidential || isHospitality || isPG) && !isPlot;
  const showKitchenType = isResidential && !isPlot && !isPG;
  const showFlooringMeta = (isResidential || isCommercial || isHospitality || isPG) && !isPlot;
  const floorNumberRequired = isApartmentOrBuilder;
  const totalFloorsRequired = isApartmentOrBuilder;

  const showOpenSides = isPlot || isVilla || isRetail;
  const showPropertyFacing = (isResidential || isHospitality || isPG) || isPlot;
  const showWidthOfFacingRoad = isPlot || isRetail;
  const showSocietyDetails =
    !isPlot &&
    (isResidential ? Boolean(insideComplex || projectId || societyName) : isCommercial ? insideComplex : false);
  const showAvailability = !isPlot;
  const showConstructionType = (isResidential || isCommercial || isPG || isHospitality) && !isPlot;
  const showAgeOfProperty = (isResidential || isCommercial || isPG || isHospitality) && !isPlot;
  const showOwnershipType = (isResidential || isCommercial || isHospitality || isPG) && !isPlot;
  const showAuthority = (isResidential || isCommercial || isHospitality) && !isPlot;
  const showBoundaryWall = isPlot;
  const showFireSafety = isCommercial;
  const showFireNoc = isCommercial;
  const showBusinessApproval = isCommercial;
  const showLegalSection =
    showAvailability ||
    showConstructionType ||
    showAgeOfProperty ||
    showOwnershipType ||
    showAuthority ||
    showBoundaryWall ||
    showFireSafety ||
    showFireNoc ||
    showBusinessApproval;

  const carpetAreaRequired = showCarpet && (isOffice || isRetail);
  const carpetUnitRequired = showCarpet;
  const plotAreaRequired = isPlot;
  const plotUnitRequired = showPlotArea && isPlot;
  const bedroomsRequired = showBedrooms && isResidential;
  const bathroomsRequired = showBathrooms && isResidential;
  const showParking = !isPlot;
  const showLiftCounts = isApartmentOrBuilder || isOffice || isRetail || isHospitality;

  return {
    area: {
      showBuiltUp,
      showCarpet,
      carpetRequired: carpetAreaRequired,
      carpetUnitRequired,
      showSuperBuiltUp,
      showPlotArea,
      showPlotLength: isPlot,
      showPlotBreadth: isPlot,
      plotAreaRequired,
      plotUnitRequired,
    },
    rooms: {
      showBedrooms,
      bedroomsRequired,
      showBathrooms,
      bathroomsRequired,
      showBalconies,
      showKitchenType,
      showFloorNumber: showFlooringMeta,
      floorNumberRequired,
      showTotalFloors: showFlooringMeta,
      totalFloorsRequired,
      showFloorsAllowed: isApartmentOrBuilder,
      allowMultiFloorSelect: isApartmentOrBuilder,
      showStaircases: isOffice,
      showOpenSides,
      showPropertyFacing,
      showWidthOfFacingRoad,
      showEntranceWidth: false,
      showCeilingWidth: false,
      showOtherRooms: (isResidential || isHospitality || isPG) && !isPlot,
    },
    furnishing: {
      showSection: (isResidential || isHospitality || isPG) && !isPlot,
      showOfficeFurnishing: isOffice,
    },
    legal: {
      showSection: showLegalSection,
      showAvailability,
      showConstructionType,
      showAgeOfProperty,
      showOwnershipType,
      showAuthority,
      showBoundaryWall,
      showFireSafety,
      showFireNoc,
      showBusinessApproval,
    },
    commercial: {
      showSection: isCommercial && !isPlot,
      showOfficeFields: isOffice,
      showRetailFields: isRetail,
      showWarehouseFields: isWarehouse,
      showPantry: isOffice,
      showCeilingHeight: isCommercial && !isPlot,
      showConferenceRoom: isOffice,
      showTotalRooms: isHospitality,
      showMeetingRooms: isOffice,
      showCabins: isOffice,
      showWorkstations: isOffice,
      showBusinessApproval,
      showOfficeSeats: isOffice,
      showOfficeReception: isOffice,
      showOfficeWashroomAvailability: isOffice,
      showRetailWashroomType: isRetail,
      showRetailLocatedNear: isRetail,
      showRetailBusinessType: isShopCategory,
      showShopFacade: isShopCategory,
      showRetailEntranceWidth: isRetail,
      showRetailCeilingHeight: isRetail,
      showWarehouseWashrooms: isWarehouse,
      showHospitalityQualityRating: isHospitality,
      showOfficeFacilities: isOffice,
    },
    pg: {
      showSection: isPG,
      showBeds: isPG,
      showFood: isPG,
      showAc: isPG,
      showAttachedBathroom: isPG,
      showAttachedBalcony: isPG,
      showAvailableFor: isPG,
    },
    society: {
      showSocietyDetails,
    },
    building: {
      showSection: showParking || showLiftCounts,
      showParking,
      showParkingBreakdown: showParking,
      showMultilevelParking: isShopCategory,
      showLifts: !isPlot,
      showLiftCounts,
    },
  };
};
