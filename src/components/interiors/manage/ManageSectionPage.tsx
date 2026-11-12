"use client";
/**
 * Edit-in-place for one wizard step. Reuses the wizard step config (Chunk 0), the
 * generic SectionRenderer + useAutosave (Chunk A), the interior custom components
 * (Chunk C) and the section PATCH + mapper (Chunk B) — all imported by name.
 */
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Info, Loader2 } from "lucide-react";
import { ManageSectionSkeleton } from "@/components/interiors/skeletons";
import { PresignUploadProvider, SectionRenderer } from "@/components/listingEngine";
import { useAutosave } from "@/lib/listingEngine/useAutosave";
import { interiorCustomComponents } from "@/components/interiors/wizard";
import { usePatchMyInteriorSectionMutation } from "@/features/interiors/api";
import { formToProfilePayload } from "@/features/interiors/wizard/mapper";
import { interiorPredicates } from "@/features/interiors/wizard/predicates";
import { interiorSteps } from "@/features/interiors/wizard/steps";
import { evaluateCondition } from "@/lib/listingEngine";
import type { InteriorWizardSection, InteriorWizardValues } from "@/types/interior.types";
import { manageHref, type ManageSectionId } from "./sections";
import { useManageListing } from "./useManageListing";

const SAVE_LABEL: Record<string, string> = {
  idle: "All changes saved",
  saved: "All changes saved",
  saving: "Saving…",
  error: "Couldn’t save — will retry",
  offline: "Offline — will retry",
  dirty: "Unsaved changes",
};

export function ManageSectionPage({ section }: { section: InteriorWizardSection }) {
  const router = useRouter();
  const { profile, values: serverValues, readiness, isLoading } = useManageListing();
  const step = useMemo(() => interiorSteps.find((s) => s.id === section)!, [section]);
  const stepIndex = interiorSteps.findIndex((s) => s.id === section) + 1;
  const [patchSection] = usePatchMyInteriorSectionMutation();

  const form = useForm<InteriorWizardValues>({ defaultValues: serverValues, mode: "onChange" });
  const values = useWatch({ control: form.control }) as InteriorWizardValues;

  // Seed once from the server; later refetches must not clobber in-progress edits.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && profile) {
      form.reset(serverValues);
      seeded.current = true;
    }
  }, [profile, serverValues, form]);

  const { status } = useAutosave({
    form,
    sectionKey: section,
    save: async (_key: string, v: InteriorWizardValues) => {
      await patchSection({
        section,
        data: formToProfilePayload(section, v),
        // Never move wizardStep backwards from manage mode.
        wizardStep: Math.max(profile?.wizardStep ?? 0, stepIndex),
      }).unwrap();
    },
  });

  const goToStep = (stepId: string) => router.push(manageHref(stepId as ManageSectionId));

  if (isLoading || !profile) {
    return <ManageSectionSkeleton />;
  }

  const sections = (step.sections ?? []).filter((s) => evaluateCondition(values, s.visibleWhen, interiorPredicates));

  // Upload fields (logo, cover, work gallery) need an uploader; the wizard shell provides one, this page must too.
  return (
    <PresignUploadProvider>
      <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{step.title ?? step.label}</h2>
          {step.description && <p className="text-xs text-slate-500">{step.description}</p>}
        </div>
        <span aria-live="polite" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {status === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
          {SAVE_LABEL[String(status)] ?? String(status)}
        </span>
      </div>

      {sections.map((sec) => {
        const Custom = sec.kind === "custom" && sec.component ? interiorCustomComponents[sec.component] : null;
        return (
          <section key={sec.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            {sec.moderated && (
              <p className="mb-3 flex items-start gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Changes here go live after a quick review.
              </p>
            )}
            {sec.kind === "custom" ? (
              <>
                {sec.title && <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">{sec.title}</h3>}
                {sec.description && <p className="mb-3 text-xs text-slate-500">{sec.description}</p>}
                {Custom ? (
                  <Custom values={values} form={form} mode="manage" section={sec} props={sec.props} goToStep={goToStep} readiness={readiness} />
                ) : (
                  <p className="text-xs text-slate-500">This section is not available yet.</p>
                )}
              </>
            ) : (
              <SectionRenderer
                section={sec}
                form={form}
                values={values}
                mode="manage"
                predicates={interiorPredicates}
                customComponents={interiorCustomComponents}
              />
            )}
          </section>
        );
      })}
      </div>
    </PresignUploadProvider>
  );
}
