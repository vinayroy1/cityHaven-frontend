import type { InteriorWizardSection } from "@/types/interior.types";
import { INTERIOR_PHASES, interiorSteps } from "@/features/interiors/wizard/steps";

export type ManageSectionId = "overview" | InteriorWizardSection | "leads";

export type ManageSection = { id: ManageSectionId; label: string; stepId?: InteriorWizardSection; group: string };

/** Overview, then the SAME 9 wizard steps grouped by phase, then Leads. */
export const MANAGE_SECTIONS: ManageSection[] = [
  { id: "overview", label: "Overview", group: "" },
  ...INTERIOR_PHASES.flatMap((phase) =>
    interiorSteps
      .filter((s) => s.phase === phase)
      .map((s) => ({ id: s.id as InteriorWizardSection, label: s.label, stepId: s.id as InteriorWizardSection, group: phase })),
  ),
  { id: "leads", label: "Leads", group: "Enquiries" },
];

/** Route segments valid under /dashboard/interior-profile/manage/[section]. */
export const MANAGE_ROUTE_SECTIONS = MANAGE_SECTIONS.filter((s) => s.id !== "overview").map((s) => s.id);

export const isManageRouteSection = (s: string): s is Exclude<ManageSectionId, "overview"> =>
  (MANAGE_ROUTE_SECTIONS as string[]).includes(s);

export const manageHref = (id: ManageSectionId, profileId?: number | null) => {
  const base = id === "overview" ? "/dashboard/interior-profile/manage" : `/dashboard/interior-profile/manage/${id}`;
  return profileId ? `${base}?profileId=${profileId}` : base;
};
