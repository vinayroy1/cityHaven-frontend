import type { ComponentType } from "react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import ProviderTypeCards from "./custom/ProviderTypeCards";
import PrimaryLocationEditor from "./custom/PrimaryLocationEditor";
import BranchManager from "./custom/BranchManager";
import ServiceCards from "./custom/ServiceCards";
import DesignStyleTiles from "./custom/DesignStyleTiles";
import MaterialSpecTable from "./custom/MaterialSpecTable";
import PackageManager from "./custom/PackageManager";
import RoomPricingTable from "./custom/RoomPricingTable";
import ConsultationPicker from "./custom/ConsultationPicker";
import BranchPricingOverrides from "./custom/BranchPricingOverrides";
import PortfolioManager from "./custom/PortfolioManager";
import TeamManager from "./custom/TeamManager";
import DocumentUploader from "./custom/DocumentUploader";
import WarrantyMatrix from "./custom/WarrantyMatrix";
import ProcessTimeline from "./custom/ProcessTimeline";
import ReadinessChecklist from "./custom/ReadinessChecklist";
import PublicPreview from "./custom/PublicPreview";
import type { InteriorCustomComponentName } from "@/features/interiors/wizard/steps";

/** Every custom component referenced by the interior step config (works in "wizard" and "manage" mode). */
export const interiorCustomComponents: Record<InteriorCustomComponentName, ComponentType<CustomStepProps<InteriorWizardValues>>> & Record<string, ComponentType<CustomStepProps<InteriorWizardValues>>> = {
  ProviderTypeCards,
  PrimaryLocationEditor,
  BranchManager,
  ServiceCards,
  DesignStyleTiles,
  MaterialSpecTable,
  PackageManager,
  RoomPricingTable,
  ConsultationPicker,
  BranchPricingOverrides,
  PortfolioManager,
  TeamManager,
  DocumentUploader,
  WarrantyMatrix,
  ProcessTimeline,
  ReadinessChecklist,
  PublicPreview,
};

export { InteriorWizard } from "./InteriorWizard";
export { SubmissionStatus } from "./SubmissionStatus";
export { InteriorDirectoryCard, InteriorProfilePreview, renderInteriorPreview } from "./InteriorPreview";
