/**
 * Interior designer vertical — contract (full detail in ./CONTRACT.md).
 *
 * Custom components (registered by components/interiors/wizard/index.ts as
 * `interiorCustomComponents`). Every one receives
 *   CustomStepProps<InteriorWizardValues> = {
 *     values; form: UseFormReturn<InteriorWizardValues>; mode: "wizard" | "manage";
 *     section?; props?; field?; goToStep?(stepId, fieldPath?); readiness?
 *   }
 * and `props` = SectionConfig.props:
 *   ProviderTypeCards       identity.providerType (confirm via AlertDialog when changing with data)
 *   OrganizationLinker      identity.organizationId (POST /interiors/me/organization)
 *   PrimaryLocationEditor   props: cityField,stateField,localityField,addressField,pincodeField,latField,lngField,serviceCitiesField,serviceLocalitiesField
 *   BranchManager           location.branches (own endpoints; single HEAD_OFFICE)
 *   MaterialSpecTable       props.field = "materials.materialSpecs"
 *   PackageManager          props.field = "pricing.packages", materialSpecsField
 *   RoomPricingTable        props.field = "pricing.roomPricing"
 *   BranchPricingOverrides  props.field = "pricing.branchOverrides", branchesField, packagesField
 *   PortfolioManager        props.field = "portfolio.projects", materialSpecsField, branchesField, minImages
 *   TeamManager             props.field = "team.members", branchesField
 *   DocumentUploader        props.field = "team.credentials"
 *   WarrantyMatrix          props.field = "warranty.warranties"
 *   ServiceCards            services.servicesOffered (+ propertyTypesHandled, budgetSegments, areaCapacity in the inline panel)
 *   DesignStyleTiles        props.field = "services.designStyles", max
 *   ProcessTimeline         props.field = "warranty.support.afterSalesNote" (first line "Process: …")
 *   ReadinessChecklist      uses props.readiness + goToStep
 *   PublicPreview           uses values
 */
import type { ComponentType, ReactNode } from "react";
import type { ZodType } from "zod";
import type { CustomStepProps, ReadinessRule, VerticalConfig } from "@/lib/listingEngine/types";
import type { InteriorWizardSection, InteriorWizardValues } from "@/types/interior.types";
import { createInteriorInitialValues } from "./initialValues";
import { interiorPredicates } from "./predicates";
import { INTERIOR_PHASES, interiorSteps } from "./steps";

export const INTERIOR_STORAGE_KEY = "interiorWizardDraft:v2";

/**
 * Data-layer adapters (Chunk B wires these in useInteriorWizard.ts):
 *   load        <- useGetMyInteriorProfileQuery + profileToForm
 *   saveSection <- usePatchMyInteriorSectionMutation({ section, data: formToProfilePayload(section, values), wizardStep })
 *   submit      <- useSubmitMyInteriorProfileMutation   (POST /interiors/me/submit)
 *   publish     <- usePublishMyInteriorProfileMutation  (existing)
 */
export type InteriorVerticalDeps = {
  load: VerticalConfig<InteriorWizardValues>["load"];
  saveSection: (section: InteriorWizardSection, values: InteriorWizardValues) => Promise<void>;
  submit: (values: InteriorWizardValues) => Promise<void>;
  publish: (values: InteriorWizardValues) => Promise<void>;
  customComponents?: Record<string, ComponentType<CustomStepProps<InteriorWizardValues>>>;
  readinessRules?: ReadinessRule<InteriorWizardValues>[];
  stepSchemas?: Record<string, ZodType>;
  renderPreview?: (values: InteriorWizardValues) => ReactNode;
};

const notWired = (name: string) => async () => {
  throw new Error(`[interiorVertical] ${name} is not wired — use createInteriorVertical(deps)`);
};

export function createInteriorVertical(deps: Partial<InteriorVerticalDeps> = {}): VerticalConfig<InteriorWizardValues> {
  return {
    id: "interiors",
    steps: interiorSteps,
    phases: INTERIOR_PHASES,
    renderPreview: deps.renderPreview,
    initialValues: createInteriorInitialValues(),
    predicates: interiorPredicates,
    customComponents: deps.customComponents ?? {},
    stepSchemas: deps.stepSchemas,
    readinessRules: deps.readinessRules ?? [],
    storageKey: INTERIOR_STORAGE_KEY,
    load: deps.load ?? (() => ({ data: undefined, isLoading: false })),
    saveSection: deps.saveSection
      ? (stepId, values) => deps.saveSection!(stepId as InteriorWizardSection, values)
      : notWired("saveSection"),
    submit: deps.submit ?? notWired("submit"),
    publish: deps.publish ?? notWired("publish"),
  };
}

/** Static config (no data wiring) — for manage pages, tests and previews. */
export const interiorVertical = createInteriorVertical();
