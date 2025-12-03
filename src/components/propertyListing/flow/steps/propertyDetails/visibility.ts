import type { ListingType, ResComType } from "@/types/propertyListing.types";

type VisibilityInput = {
  listingType?: ListingType;
  resCom?: ResComType;
  propertySubTypeSlug?: string;
  locatedInsideId?: string | null;
  projectId?: string | null;
  societyName?: string | null;
};

export type PropertyDetailsVisibility = {
  area: {
    showBuiltUp: boolean;
    showCarpet: boolean;
    carpetRequired: boolean;
    showSuperBuiltUp: boolean;
    showPlotArea: boolean;
    showPlotLength: boolean;
    showPlotBreadth: boolean;
    showAreaUnit: boolean;
  };
  rooms: {
    showBedrooms: boolean;
    showBathrooms: boolean;
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
  };
  furnishing: {
    showSection: boolean;
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
};

export const derivePropertyDetailsVisibility = ({
  listingType,
  resCom,
  propertySubTypeSlug,
  locatedInsideId,
  projectId,
  societyName,
}: VisibilityInput): PropertyDetailsVisibility => {
  const isPG = listingType === "PG";
  const isPlot = !!propertySubTypeSlug?.includes("plot-land");
  const isResidential = resCom === "RESIDENTIAL" && !isPlot && !isPG;
  const isCommercial = resCom === "COMMERCIAL" && !isPlot;
  const isApartmentOrBuilder = propertySubTypeSlug === "apartment" || propertySubTypeSlug === "independent-builder-floor";
  const isVilla = propertySubTypeSlug === "independent-house-villa";
  const isOffice = propertySubTypeSlug === "office";
  const isRetail = propertySubTypeSlug === "retail";
  const isWarehouse = propertySubTypeSlug === "storage";
  const insideComplex = Boolean(locatedInsideId);

  const showBuiltUp = (isResidential || isCommercial) && !isPG && !isPlot;
  const showCarpet = (isResidential || isCommercial) && !isPG && !isPlot;
  const showPlotArea = isPlot;
  const showSuperBuiltUp = isResidential && !isPG && !isPlot;
  const showAreaUnit = showBuiltUp || showCarpet || showPlotArea || showSuperBuiltUp;

  const showBedrooms = isResidential && !isPlot && !isPG;
  const showBathrooms = isResidential && !isPlot && !isPG;
  const showBalconies = isResidential && !isPlot && !isPG;
  const showKitchenType = isResidential && !isPlot && !isPG;
  const showFlooringMeta = (isResidential || isCommercial) && !isPlot && !isPG;
  const floorNumberRequired = isApartmentOrBuilder;
  const totalFloorsRequired = isApartmentOrBuilder;

  const showOpenSides = isPlot || isVilla || isRetail;
  const showPropertyFacing = (isResidential && !isPG) || isPlot;
  const showWidthOfFacingRoad = isPlot || isRetail;
  const showEntranceWidth = isCommercial && (isRetail || isOffice);
  const showSocietyDetails =
    !isPG &&
    !isPlot &&
    (isResidential ? Boolean(insideComplex || projectId || societyName) : isCommercial ? insideComplex : false);
  const showAvailability = !isPlot;
  const showConstructionType = (isResidential || isCommercial) && !isPlot && !isPG;
  const showAgeOfProperty = (isResidential || isCommercial) && !isPlot && !isPG;
  const showOwnershipType = (isResidential || isCommercial) && !isPlot;
  const showAuthority = (isResidential || isCommercial) && !isPlot;
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

  return {
    area: {
      showBuiltUp,
      showCarpet,
      carpetRequired: showCarpet && !(isCommercial && isOffice),
      showSuperBuiltUp,
      showPlotArea,
      showPlotLength: isPlot,
      showPlotBreadth: isPlot,
      showAreaUnit,
    },
    rooms: {
      showBedrooms,
      showBathrooms,
      showBalconies,
      showKitchenType,
      showFloorNumber: showFlooringMeta,
      floorNumberRequired,
      showTotalFloors: showFlooringMeta,
      totalFloorsRequired,
      showFloorsAllowed: isApartmentOrBuilder,
      allowMultiFloorSelect: isApartmentOrBuilder,
      showStaircases: isVilla,
      showOpenSides,
      showPropertyFacing,
      showWidthOfFacingRoad,
      showEntranceWidth,
      showCeilingWidth: isCommercial && isWarehouse,
    },
    furnishing: {
      showSection: isResidential && !isPlot && !isPG,
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
      showPantry: isCommercial && !isRetail,
      showCeilingHeight: isCommercial,
      showConferenceRoom: isOffice,
      showTotalRooms: isCommercial,
      showMeetingRooms: isOffice,
      showCabins: isOffice,
      showWorkstations: isOffice,
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
  };
};
