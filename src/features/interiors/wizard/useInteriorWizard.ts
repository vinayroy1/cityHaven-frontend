"use client";

// Wires RTK Query (server truth) into the generic VerticalConfig the
// ListingWizardShell / ManageSectionPage consume. RHF lives in the shell.

import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";
import { computeReadiness } from "@/lib/listingEngine/readiness";
import type { CustomStepProps, ReadinessReport, VerticalConfig } from "@/lib/listingEngine/types";
import type { InteriorProfile, InteriorWizardSection, InteriorWizardValues } from "@/types/interior.types";
import {
  parseInteriorApiError,
  useGetMyInteriorProfileQuery,
  useGetMyInteriorReadinessQuery,
  usePatchMyInteriorSectionMutation,
  usePublishMyInteriorProfileMutation,
  useSubmitMyInteriorProfileMutation,
} from "../api";
import { formToProfilePayload, profileToForm, sectionToWizardStep } from "./mapper";
import { interiorReadinessRules } from "./readiness";
import { interiorStepSchemas, validateInteriorAll } from "./schema";
import { createInteriorVertical } from "./vertical";

/** Thrown by save/submit/publish; `fieldErrors` keys are form paths → `form.setError`. */
export class InteriorSaveError extends Error {
  status?: number | string;
  fieldErrors: Record<string, string>;
  constructor(message: string, fieldErrors: Record<string, string> = {}, status?: number | string) {
    super(message);
    this.name = "InteriorSaveError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

const toSaveError = (err: unknown) => {
  if (err instanceof InteriorSaveError) return err;
  const { message, fieldErrors, status } = parseInteriorApiError(err);
  return new InteriorSaveError(message, fieldErrors, status);
};

export type UseInteriorWizardOptions = {
  /** Chunk C's `interiorCustomComponents` (passed in to keep features/ free of component imports). */
  customComponents?: Record<string, ComponentType<CustomStepProps<InteriorWizardValues>>>;
};

export type UseInteriorWizardResult = {
  vertical: VerticalConfig<InteriorWizardValues>;
  profile: InteriorProfile | null | undefined;
  /** hydrated form values (empty defaults when there is no profile yet). */
  values: InteriorWizardValues;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** client readiness for arbitrary (live) values — server report preferred when available. */
  getReadiness: (values: InteriorWizardValues) => ReadinessReport;
  serverReadiness: ReadinessReport | undefined;
  isSaving: boolean;
  isSubmitting: boolean;
  isPublishing: boolean;
};

export function useInteriorWizard(opts: UseInteriorWizardOptions = {}): UseInteriorWizardResult {
  const { data: profile, isLoading, isError, refetch } = useGetMyInteriorProfileQuery();
  const { data: serverReadiness } = useGetMyInteriorReadinessQuery(undefined, { skip: !profile });
  const [patchSection, { isLoading: isSaving }] = usePatchMyInteriorSectionMutation();
  const [submitProfile, { isLoading: isSubmitting }] = useSubmitMyInteriorProfileMutation();
  const [publishProfile, { isLoading: isPublishing }] = usePublishMyInteriorProfileMutation();

  const values = useMemo(() => profileToForm(profile), [profile]);

  const serverStep = profile?.wizardStep ?? 1;

  const saveSection = useCallback(
    async (section: InteriorWizardSection, v: InteriorWizardValues) => {
      const stepNo = sectionToWizardStep(section);
      const wizardStep = Math.max(v.wizardStep || 1, stepNo, serverStep);
      try {
        await patchSection({ section, data: formToProfilePayload(section, v), wizardStep }).unwrap();
      } catch (err) {
        throw toSaveError(err);
      }
    },
    [patchSection, serverStep],
  );

  const submit = useCallback(
    async (v: InteriorWizardValues) => {
      const local = validateInteriorAll(v);
      if (Object.keys(local).length) throw new InteriorSaveError("Please fix the highlighted fields before submitting.", local);
      const report = computeReadiness(interiorReadinessRules, v);
      if (!report.canSubmit) throw new InteriorSaveError("Complete the items marked “Required to submit” first.");
      try {
        await submitProfile().unwrap();
      } catch (err) {
        throw toSaveError(err);
      }
    },
    [submitProfile],
  );

  const publish = useCallback(
    async (v: InteriorWizardValues) => {
      const report = computeReadiness(interiorReadinessRules, v);
      if (!report.canPublish) throw new InteriorSaveError("Complete the items marked “Required to publish” first.");
      try {
        await publishProfile().unwrap();
      } catch (err) {
        throw toSaveError(err);
      }
    },
    [publishProfile],
  );

  const { customComponents } = opts;
  const vertical = useMemo(
    () =>
      createInteriorVertical({
        load: () => ({
          data: profile ? values : undefined,
          isLoading,
          updatedAt: profile?.updatedAt ?? null,
          // server wizardStep is 1-based (furthest saved section); the shell wants a 0-based index
          wizardStep: profile?.wizardStep ? profile.wizardStep - 1 : null,
        }),
        saveSection,
        submit,
        publish,
        customComponents,
        readinessRules: interiorReadinessRules,
        stepSchemas: interiorStepSchemas,
      }),
    [profile, values, isLoading, saveSection, submit, publish, customComponents],
  );

  const getReadiness = useCallback((v: InteriorWizardValues) => computeReadiness(interiorReadinessRules, v), []);

  return {
    vertical,
    profile,
    values,
    isLoading,
    isError,
    refetch,
    getReadiness,
    serverReadiness,
    isSaving,
    isSubmitting,
    isPublishing,
  };
}
