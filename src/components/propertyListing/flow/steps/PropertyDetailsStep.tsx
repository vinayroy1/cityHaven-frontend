import React, { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { propertyTypeCatalog } from "@/features/propertyListing";
import { MediaSelector } from "../MediaSelector";
import type { StepProps } from "./StepCommon";
import { TitleDescriptionSection } from "./propertyDetails/TitleDescriptionSection";
import { AreaSection } from "./propertyDetails/AreaSection";
import { RoomsLayoutSection } from "./propertyDetails/RoomsLayoutSection";
import { OtherRoomsSection } from "./propertyDetails/OtherRoomsSection";
import { FurnishingSection } from "./propertyDetails/FurnishingSection";
import { ConstructionLegalSection } from "./propertyDetails/ConstructionLegalSection";
import { PgSection } from "./propertyDetails/PgSection";
import { CommercialSection } from "./propertyDetails/CommercialSection";
import { SocietySection } from "./propertyDetails/SocietySection";
import { furnishingItems } from "./propertyDetails/constants";
import { derivePropertyDetailsVisibility } from "./propertyDetails/visibility";
import { Card } from "@/components/ui/card";
import { LiftsParkingSection } from "./propertyDetails/LiftsParkingSection";

export function PropertyDetailsStep({ form }: StepProps) {
  const listingType = useWatch({ control: form.control, name: "context.listingType" });
  const resCom = useWatch({ control: form.control, name: "context.resCom" });
  const propertyTypeId = `${useWatch({ control: form.control, name: "context.propertyTypeId" }) ?? ""}`;
  const propertySubTypeId = `${useWatch({ control: form.control, name: "context.propertySubTypeId" }) ?? ""}`;
  const propertySubCategoryId = `${useWatch({ control: form.control, name: "context.propertySubCategoryId" }) ?? ""}`;
  const locatedInsideId = useWatch({ control: form.control, name: "context.locatedInsideId" });
  const projectId = useWatch({ control: form.control, name: "location.projectId" });
  const societyName = useWatch({ control: form.control, name: "location.societyOrProjectName" });
  const constructionStatus = useWatch({ control: form.control, name: "location.constructionStatus" });
  const floorsAllowed = useWatch({ control: form.control, name: "details.floorsAllowed" });
  const furnishingMode = useWatch({ control: form.control, name: "amenities.furnishing" }) ?? "UNFURNISHED";

  const propertyType = useMemo(() => propertyTypeCatalog.find((p) => p.id === propertyTypeId), [propertyTypeId]);
  const propertySubType = useMemo(
    () => propertyType?.subTypes.find((s) => s.id === propertySubTypeId),
    [propertyType, propertySubTypeId],
  );
  const propertySubCategory = useMemo(
    () => propertySubType?.categories?.find((c) => c.id === propertySubCategoryId),
    [propertySubCategoryId, propertySubType?.categories],
  );

  const showPossessionDate = constructionStatus === "UNDER_CONSTRUCTION";
  const allowedFurnishingItems = useMemo(() => furnishingItems.filter((item) => item.modes.includes(furnishingMode)), [furnishingMode]);
  const visibility = useMemo(
    () =>
      derivePropertyDetailsVisibility({
        listingType,
        resCom,
        propertySubTypeSlug: propertySubType?.slug,
        propertySubCategorySlug: propertySubCategory?.slug,
        locatedInsideId,
        projectId,
        societyName,
      }),
    [listingType, locatedInsideId, projectId, propertySubCategory?.slug, propertySubType?.slug, resCom, societyName],
  );
  const canShowMultiFloorSelect = visibility.rooms.allowMultiFloorSelect && Number(floorsAllowed ?? 0) > 1;

  return (
    <div className="space-y-6">
      <TitleDescriptionSection form={form} />

      <div className="grid gap-5 lg:grid-cols-2">
        <AreaSection
          form={form}
          showBuiltUp={visibility.area.showBuiltUp}
          showCarpet={visibility.area.showCarpet}
          carpetAreaRequired={visibility.area.carpetRequired}
          showPlotArea={visibility.area.showPlotArea}
          showPlotLength={visibility.area.showPlotLength}
          showPlotBreadth={visibility.area.showPlotBreadth}
          showSuperBuiltUp={visibility.area.showSuperBuiltUp}
          showAreaUnit={visibility.area.showAreaUnit}
        />
        <RoomsLayoutSection form={form} visibility={visibility.rooms} canShowMultiFloorSelect={canShowMultiFloorSelect} />
      </div>

      <OtherRoomsSection form={form} show={visibility.rooms.showOtherRooms} />

      {visibility.furnishing.showSection && (
        <FurnishingSection form={form} furnishingMode={furnishingMode} allowedItems={allowedFurnishingItems} />
      )}

      <div className={visibility.pg.showSection ? "grid gap-5 lg:grid-cols-2" : "grid gap-5"}>
        <ConstructionLegalSection form={form} visibility={visibility.legal} useDateForPossession={propertySubType?.slug === "hospitality"} />
        {visibility.pg.showSection && <PgSection form={form} visibility={visibility.pg} />}
      </div>

      <CommercialSection form={form} visibility={visibility.commercial} />

      <LiftsParkingSection form={form} visibility={visibility.building} />

      <SocietySection form={form} showSocietyDetails={visibility.society.showSocietyDetails} showPossessionDate={showPossessionDate} />

      <Card className="border border-slate-100 bg-white p-5 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-800">Photos & videos</p>
        <MediaSelector form={form} />
      </Card>
    </div>
  );
}
