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
 * First-time setup asks only what a homeowner needs to find and contact the studio, so a designer
 * can go live in a few minutes (mobile included). Everything else (pitch, links, travel radius,
 * styles, in-house capabilities, packages, room pricing, consultations, materials, team,
 * documents, warranty, working hours, detailed projects) is added later from the dashboard, where
 * every section of `interiorSteps` stays editable. Those items are RECOMMENDED in readiness, so they
 * never block going live.
 */
const SETUP_SECTIONS: Record<string, string[]> = {
  identity: ["providerType", "individualBasics", "companyBasics", "branding"],
  location: ["primaryLocation", "branches"],
  services: ["offerings"],
  pricing: ["startingPrice"],
  portfolio: ["gallery"],
  contact: ["contactDetails", "readiness", "preview"],
};

export const interiorSetupSteps: StepConfig[] = interiorSteps
  .filter((s) => s.id in SETUP_SECTIONS)
  .map((s) => {
    const keep = SETUP_SECTIONS[s.id];
    const step: StepConfig = { ...s, sections: (s.sections ?? []).filter((sec) => keep.includes(sec.id)) };
    if (s.id === "portfolio") {
      return {
        ...step,
        label: "Work photos",
        title: "Photos of your work",
        description: "Optional, but profiles with photos get far more enquiries. Select many photos at once; detailed projects can be added from your dashboard later.",
      };
    }
    return step;
  });

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
