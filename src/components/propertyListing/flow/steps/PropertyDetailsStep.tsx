import React, { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { propertyTypeCatalog } from "@/features/propertyListing";
import { MediaSelector } from "../MediaSelector";
import type { StepProps } from "./StepCommon";
import { TitleDescriptionSection } from "./propertyDetails/TitleDescriptionSection";
import { AreaSection } from "./propertyDetails/AreaSection";
import { RoomsLayoutSection } from "./propertyDetails/RoomsLayoutSection";
import { FurnishingSection } from "./propertyDetails/FurnishingSection";
import { ConstructionLegalSection } from "./propertyDetails/ConstructionLegalSection";
import { PgSection } from "./propertyDetails/PgSection";
import { CommercialSection } from "./propertyDetails/CommercialSection";
import { SocietySection } from "./propertyDetails/SocietySection";
import { furnishingItems } from "./propertyDetails/constants";
import { Card } from "@/components/ui/card";

export function PropertyDetailsStep({ form }: StepProps) {
  const listingType = useWatch({ control: form.control, name: "context.listingType" });
  const resCom = useWatch({ control: form.control, name: "context.resCom" });
  const propertyTypeId = `${useWatch({ control: form.control, name: "context.propertyTypeId" }) ?? ""}`;
  const propertySubTypeId = `${useWatch({ control: form.control, name: "context.propertySubTypeId" }) ?? ""}`;
  const locatedInsideId = useWatch({ control: form.control, name: "context.locatedInsideId" });
  const projectId = useWatch({ control: form.control, name: "location.projectId" });
  const societyName = useWatch({ control: form.control, name: "location.societyOrProjectName" });
  const constructionStatus = useWatch({ control: form.control, name: "location.constructionStatus" });
  const furnishingMode = useWatch({ control: form.control, name: "amenities.furnishing" }) ?? "UNFURNISHED";

  const propertyType = useMemo(() => propertyTypeCatalog.find((p) => p.id === propertyTypeId), [propertyTypeId]);
  const propertySubType = useMemo(
    () => propertyType?.subTypes.find((s) => s.id === propertySubTypeId),
    [propertyType, propertySubTypeId],
  );

  const isResidential = resCom === "RESIDENTIAL";
  const isCommercial = resCom === "COMMERCIAL";
  const isPG = listingType === "PG";
  const isPlot = Boolean(propertySubType?.slug?.includes("plot-land"));
  const isApartment = propertySubType?.slug === "apartment";
  const isOffice = propertySubType?.slug === "office";

  const showBuiltUp = (isResidential || isCommercial) && !isPG && !isPlot;
  const showCarpet = (isResidential || isCommercial) && !isPG && !isPlot;
  const showPlotArea = isPlot;
  const showSuperBuiltUp = isResidential && !isPG && !isPlot;
  const showAreaUnit = showBuiltUp || showCarpet || showPlotArea || showSuperBuiltUp;
  const showSocietyDetails = Boolean(locatedInsideId || projectId || societyName);
  const showPossessionDate = constructionStatus === "UNDER_CONSTRUCTION";
  const allowedFurnishingItems = useMemo(() => furnishingItems.filter((item) => item.modes.includes(furnishingMode)), [furnishingMode]);

  return (
    <div className="space-y-6">
      <TitleDescriptionSection form={form} />

      <div className="grid gap-5 lg:grid-cols-2">
        <AreaSection
          form={form}
          showBuiltUp={showBuiltUp}
          showCarpet={showCarpet}
          showPlotArea={showPlotArea}
          showSuperBuiltUp={showSuperBuiltUp}
          showAreaUnit={showAreaUnit}
        />
        <RoomsLayoutSection form={form} isResidential={isResidential} isCommercial={isCommercial} isPG={isPG} isPlot={isPlot} />
      </div>

      {!isPlot && <FurnishingSection form={form} furnishingMode={furnishingMode} allowedItems={allowedFurnishingItems} />}

      <div className={isPG ? "grid gap-5 lg:grid-cols-2" : "grid gap-5"}>
        <ConstructionLegalSection form={form} isResidential={isResidential} isCommercial={isCommercial} isPlot={isPlot} />
        {isPG && <PgSection form={form} isPG={isPG} />}
      </div>

      <CommercialSection form={form} isCommercial={isCommercial} isPlot={isPlot} isOffice={isOffice} />

      <SocietySection form={form} showSocietyDetails={showSocietyDetails} showPossessionDate={showPossessionDate} />

      <Card className="border border-slate-100 bg-white p-5 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-800">Photos & videos</p>
        <MediaSelector form={form} />
      </Card>
    </div>
  );
}
