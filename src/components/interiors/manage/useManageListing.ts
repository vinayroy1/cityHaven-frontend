"use client";
import { useMemo } from "react";
import { useGetMyInteriorProfileQuery } from "@/features/interiors/api";
import { profileToForm } from "@/features/interiors/wizard/mapper";
import { interiorReadinessRules } from "@/features/interiors/wizard/readiness";
import { interiorPredicates } from "@/features/interiors/wizard/predicates";
import { interiorSteps } from "@/features/interiors/wizard/steps";
import { createInteriorInitialValues } from "@/features/interiors/wizard/initialValues";
import { computeReadiness, computeScore, isStepVisible, missingRequiredForStep } from "@/lib/listingEngine";
import type { InteriorWizardValues } from "@/types/interior.types";

export type StepHealth = "done" | "todo" | "hidden";

/** Profile + derived form values, readiness, score and per-step health for the manage area. */
export function useManageListing() {
  const query = useGetMyInteriorProfileQuery();
  const profile = query.data ?? null;

  const values: InteriorWizardValues = useMemo(
    () => (profile ? profileToForm(profile) : createInteriorInitialValues()),
    [profile],
  );

  const readiness = useMemo(() => computeReadiness(interiorReadinessRules, values), [values]);
  const score = useMemo(() => computeScore(interiorSteps, values, { predicates: interiorPredicates }), [values]);

  const stepHealth = useMemo(() => {
    const out: Record<string, StepHealth> = {};
    for (const step of interiorSteps) {
      if (!isStepVisible(step, values, { predicates: interiorPredicates })) {
        out[step.id] = "hidden";
        continue;
      }
      const missingFields = missingRequiredForStep(step, values, { predicates: interiorPredicates }).length;
      const missingRules = readiness.items.some((i) => i.stepId === step.id && !i.done);
      out[step.id] = missingFields || missingRules ? "todo" : "done";
    }
    return out;
  }, [values, readiness]);

  return { ...query, profile, values, readiness, score, stepHealth };
}
