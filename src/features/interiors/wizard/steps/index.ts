import type { StepConfig } from "@/lib/listingEngine/types";
import { identityStep } from "./identity";
import { locationStep } from "./location";
import { servicesStep } from "./services";
import { materialsStep } from "./materials";
import { pricingStep } from "./pricing";
import { portfolioStep } from "./portfolio";
import { teamStep } from "./team";
import { warrantyStep } from "./warranty";
import { contactStep } from "./publish";

export { identityStep, locationStep, servicesStep, materialsStep, pricingStep, portfolioStep, teamStep, warrantyStep, contactStep };

/** Phases shown on the step rail (competitor research: 3 phases, not 9 equal steps). */
export const INTERIOR_PHASES = ["About your studio", "Show your work", "Trust & publish"] as const;

/** Wizard order. Step ids equal InteriorWizardSection keys and PATCH /interiors/me/sections/:section. */
export const interiorSteps: StepConfig[] = [
  identityStep,
  locationStep,
  servicesStep,
  pricingStep,
  portfolioStep,
  materialsStep,
  teamStep,
  warrantyStep,
  contactStep,
];

/**
 * First-time setup skips portfolio projects so a studio (or staff listing for one) can go live quickly;
 * projects and the work gallery are added afterwards from the dashboard (manage → Portfolio).
 */
export const interiorSetupSteps: StepConfig[] = interiorSteps.map((s) =>
  s.id !== "portfolio"
    ? s
    : {
        // Setup keeps only the work gallery (quick multi-photo upload, staff can do it too); projects come later.
        ...s,
        label: "Work photos",
        title: "Photos of your work",
        description: "Optional. Select many photos at once. Detailed projects can be added from the dashboard later.",
        sections: (s.sections ?? []).filter((sec) => sec.id === "gallery"),
      },
);

/** Every custom component name referenced by the step config. */
export const INTERIOR_CUSTOM_COMPONENT_NAMES = [
  "ProviderTypeCards",
  "PrimaryLocationEditor",
  "BranchManager",
  "MaterialSpecTable",
  "PackageManager",
  "RoomPricingTable",
  "ConsultationPicker",
  "BranchPricingOverrides",
  "PortfolioManager",
  "TeamManager",
  "DocumentUploader",
  "WarrantyMatrix",
  "ServiceCards",
  "DesignStyleTiles",
  "ProcessTimeline",
  "ReadinessChecklist",
  "PublicPreview",
] as const;
export type InteriorCustomComponentName = (typeof INTERIOR_CUSTOM_COMPONENT_NAMES)[number];
