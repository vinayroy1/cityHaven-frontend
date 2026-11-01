import type { PredicateRegistry } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";

type P = (v: InteriorWizardValues) => boolean;

const isIndividual: P = (v) => v.identity?.providerType === "INDIVIDUAL";
const isCompany: P = (v) => v.identity?.providerType === "COMPANY";
const hasProviderType: P = (v) => isIndividual(v) || isCompany(v);
const isQuoteOnly: P = (v) => v.pricing?.priceMode === "QUOTE_ONLY";
const showsStartingPrice: P = (v) => v.pricing?.priceMode === "STARTING_PRICE";
const hasBranches: P = (v) => isCompany(v) && (v.location?.branches?.length ?? 0) > 0;
const hasBranchOverrides: P = (v) => isCompany(v) && (v.location?.branches ?? []).some((b) => b.overridesCompanyPricing);
const offersConsultation: P = (v) =>
  (v.services?.servicesOffered ?? []).includes("Design Consultation Only") || (v.pricing?.consultationOptions?.length ?? 0) > 0;
const whatsappDifferent: P = (v) => !v.contact?.whatsappSameAsPhone;
const notAcceptingProjects: P = (v) => v.contact?.acceptingNewProjects === false;

export const interiorPredicates: PredicateRegistry<InteriorWizardValues> = {
  isIndividual,
  isCompany,
  hasProviderType,
  isQuoteOnly,
  showsStartingPrice,
  hasBranches,
  hasBranchOverrides,
  offersConsultation,
  whatsappDifferent,
  notAcceptingProjects,
};

export type InteriorPredicateName = keyof typeof interiorPredicates;
