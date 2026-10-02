"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPropertyListing } from "@/store/store";
import {
  hydrateDraft,
  initialPropertyListingFormValues,
  saveDraft,
} from "@/features/propertyListing/slice";
import {
  useSubmitPropertyMutation,
  useUpdatePropertyMutation,
  useGetPropertyQuery,
} from "@/features/propertyListing/api";
import {
  clearPersistedDraft,
  loadPersistedDraft,
  persistDraft,
} from "@/features/propertyListing/storage";
import { mapApiToForm } from "@/features/propertyListing/apiToForm";
import { listingSteps } from "@/features/propertyListing/formConfig/steps";
import { computeListingScore } from "@/features/propertyListing/formConfig/scoring";
import { requiredPathsForStep } from "@/features/propertyListing/formConfig/validation";
import { suggestTitle } from "@/features/propertyListing/formConfig/derive";
import { APP_CONFIG } from "@/constants/app-config";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import type { FieldPath } from "react-hook-form";
import { Stepper } from "./Stepper";
import { MobileStepBar } from "./MobileStepBar";
import { PropertyScore } from "./PropertyScore";
import { SectionRenderer } from "./SectionRenderer";
import { LocationStep } from "./LocationStep";
import { ReviewSummary } from "./ReviewSummary";
import { WorkspacePicker } from "./WorkspacePicker";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import { panel } from "./theme";

const PG_SUBTYPES = ["pg-private-room", "pg-shared-room", "pg-bed"];

export function PropertyListingFlow({ propertyId: propIdOverride }: { propertyId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = propIdOverride ?? searchParams.get("id") ?? undefined;
  const organizationIdFromQuery = searchParams.get("orgId") ?? undefined;
  const dispatch = useAppDispatch();
  const { draft } = useAppSelector(selectPropertyListing);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) {
        const redirectUrl = propertyId ? `/propertyListing?id=${propertyId}` : "/propertyListing";
        router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      }
    }
  }, [router, propertyId]);

  const [submitProperty, submitState] = useSubmitPropertyMutation();
  const [updateProperty, updateState] = useUpdatePropertyMutation();
  const { data: existing } = useGetPropertyQuery(propertyId as string, { skip: !propertyId });
  const { data: myOrganizations = [] } = useMyOrganizationsQuery();

  const [stepIndex, setStepIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [resume, setResume] = useState<{ form: PropertyListingFormValues; step?: number } | null>(null);
  const hydratedRef = useRef(false);

  const form = useForm<PropertyListingFormValues>({
    mode: "onChange",
    defaultValues: draft ?? initialPropertyListingFormValues,
  });

  const values = useWatch({ control: form.control }) as PropertyListingFormValues;
  const score = useMemo(() => computeListingScore(listingSteps, values ?? {}), [values]);

  const activeSelectedOrg = useMemo(() => {
    if (!values?.context?.organizationId) return null;
    return myOrganizations.find((o) => String(o.id) === String(values.context.organizationId)) || null;
  }, [myOrganizations, values?.context?.organizationId]);

  const isViewerInSelectedOrg = activeSelectedOrg?.role?.name === "VIEWER";

  // Hydrate an existing listing for editing.
  useEffect(() => {
    if (existing && !hydratedRef.current) {
      hydratedRef.current = true;
      const mapped = mapApiToForm(existing as Record<string, unknown>);
      form.reset(mapped);
      dispatch(hydrateDraft(mapped));
    }
  }, [existing, form, dispatch]);

  // Offer to resume a local draft (only for a fresh "create" session).
  useEffect(() => {
    if (propertyId) return;
    const persisted = loadPersistedDraft();
    if (persisted?.form) setResume(persisted);
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) return;
    if (organizationIdFromQuery) {
      form.setValue("context.organizationId", organizationIdFromQuery, { shouldDirty: true });
      if (form.getValues("context.postedAs") === "OWNER") {
        form.setValue("context.postedAs", "AGENT", { shouldDirty: true });
      }
    }
  }, [form, organizationIdFromQuery, propertyId]);

  // Autosave to localStorage + Redux (debounced).
  useEffect(() => {
    const sub = form.watch((v) => {
      persistDraft({ form: v as PropertyListingFormValues, step: stepIndex });
    });
    return () => sub.unsubscribe();
  }, [form, stepIndex]);

  // Cross-field resets keyed on the classification fields.
  const listingType = values?.context?.listingType;
  const resCom = values?.context?.resCom;
  const subType = values?.context?.propertySubTypeSlug;
  useEffect(() => {
    if (listingType === "PG") {
      if (resCom !== "RESIDENTIAL") form.setValue("context.resCom", "RESIDENTIAL");
      if (subType && !PG_SUBTYPES.includes(subType))
        form.setValue("context.propertySubTypeSlug", undefined);
    } else if (subType && PG_SUBTYPES.includes(subType)) {
      form.setValue("context.propertySubTypeSlug", undefined);
    }
    if (subType && !["office", "retail"].includes(subType)) {
      if (values?.context?.propertySubCategorySlug)
        form.setValue("context.propertySubCategorySlug", undefined);
      if (values?.context?.locatedInsideSlug) form.setValue("context.locatedInsideSlug", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingType, resCom, subType]);

  // Prefill a suggested title once, when the user reaches the profile step
  // with enough context and hasn't typed their own.
  const titleSuggestedRef = useRef(false);
  useEffect(() => {
    if (titleSuggestedRef.current || propertyId) return;
    if (stepIndex >= 2 && !form.getValues("meta.title") && values?.location?.cityName) {
      const suggestion = suggestTitle(values);
      if (suggestion) {
        form.setValue("meta.title", suggestion, { shouldDirty: true });
        titleSuggestedRef.current = true;
      }
    }
  }, [stepIndex, values, form, propertyId]);

  const step = listingSteps[stepIndex];
  const isLast = stepIndex === listingSteps.length - 1;
  const busy = submitState.isLoading || updateState.isLoading;

  const goToStep = (i: number) => {
    dispatch(saveDraft(form.getValues()));
    setStepIndex(i);
    setMaxVisited((m) => Math.max(m, i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = async () => {
    if (isViewerInSelectedOrg) {
      toast.error("Viewer role cannot publish listings under this organization. Please switch to Personal Account or update your role.");
      return;
    }
    const paths = requiredPathsForStep(step, form.getValues()) as FieldPath<PropertyListingFormValues>[];
    const ok = paths.length === 0 || (await form.trigger(paths, { shouldFocus: true }));
    if (!ok) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    dispatch(saveDraft(form.getValues()));
    goToStep(Math.min(listingSteps.length - 1, stepIndex + 1));
  };

  const handlePublish = async () => {
    if (isViewerInSelectedOrg) {
      toast.error("Viewer role cannot publish listings under this organization. Please switch to Personal Account or update your role.");
      return;
    }
    const paths = listingSteps
      .flatMap((s) => requiredPathsForStep(s, form.getValues()))
      .filter((p, i, a) => a.indexOf(p) === i) as FieldPath<PropertyListingFormValues>[];
    const ok = await form.trigger(paths, { shouldFocus: true });
    if (!ok) {
      toast.error("Some required details are missing.");
      return;
    }
    const payload = form.getValues();
    // Stamp the current user so the listing shows under "My listings".
    try {
      const raw = localStorage.getItem("awasio_user");
      const uid = raw ? (JSON.parse(raw) as { id?: number }).id : undefined;
      if (uid && !payload.context.ownerId) {
        payload.context = { ...payload.context, ownerId: uid, createdById: uid };
      }
    } catch {
      /* no stored user */
    }
    dispatch(saveDraft(payload));
    try {
      if (propertyId) {
        await updateProperty({ id: propertyId, formValues: payload }).unwrap();
        toast.success("Listing updated.");
      } else {
        await submitProperty(payload).unwrap();
        toast.success("Listing submitted for review.");
        clearPersistedDraft();
      }
      router.push("/dashboard/properties");
    } catch {
      toast.error("Could not save the listing. Please try again.");
    }
  };

  const applyResume = () => {
    if (resume?.form) {
      dispatch(hydrateDraft(resume.form));
      form.reset(resume.form);
      const s = resume.step && resume.step > 0 ? resume.step : 0;
      setStepIndex(s);
      setMaxVisited(s);
    }
    setResume(null);
  };

  const startFresh = () => {
    form.reset(initialPropertyListingFormValues);
    dispatch(hydrateDraft(initialPropertyListingFormValues));
    clearPersistedDraft();
    setStepIndex(0);
    setMaxVisited(0);
    setResume(null);
  };

  return (
    <FormProvider {...form}>
      <MobileStepBar
        steps={listingSteps}
        current={stepIndex}
        maxVisited={maxVisited}
        score={score.pct}
        onNavigate={goToStep}
      />

      <div className="grid gap-6 pb-24 pt-4 lg:grid-cols-[264px_minmax(0,1fr)] lg:pb-6 lg:pt-0">
        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-6 lg:self-start">
          <div className={cn(panel, "p-3")}>
            <Stepper
              steps={listingSteps}
              current={stepIndex}
              maxVisited={maxVisited}
              onNavigate={goToStep}
            />
          </div>
          <PropertyScore pct={score.pct} />
        </aside>

        <div className="space-y-5">
          {resume && (
            <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <span>We found a saved draft. Continue where you left off?</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={startFresh}>
                  Start fresh
                </Button>
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={applyResume}>
                  Resume draft
                </Button>
              </div>
            </div>
          )}

          <div className={cn(panel, "space-y-4 p-4 sm:space-y-5 sm:p-6")}>
            {/* Heading is shown in the compact bar on mobile; full here on lg+ */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-rose-500">
                <span>Step {stepIndex + 1} of {listingSteps.length}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500 dark:text-slate-400 normal-case tracking-normal">{step.label}</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{step.title ?? step.label}</h1>
              {step.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.description}</p>}
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {stepIndex === 0 && (
                <WorkspacePicker
                  selectedOrgId={values?.context?.organizationId}
                  onSelectPersonal={() => {
                    form.setValue("context.organizationId", undefined, { shouldDirty: true });
                    if (!form.getValues("context.postedAs")) {
                      form.setValue("context.postedAs", "OWNER", { shouldDirty: true });
                    }
                  }}
                  onSelectOrg={(org) => {
                    form.setValue("context.organizationId", String(org.id), { shouldDirty: true });
                    if (form.getValues("context.postedAs") === "OWNER") {
                      form.setValue("context.postedAs", "AGENT", { shouldDirty: true });
                    }
                  }}
                />
              )}

              {step.kind === "custom" && step.component === "location" && <LocationStep />}

              {step.kind !== "custom" &&
                (step.sections ?? []).map((section, i) => (
                  <SectionRenderer key={section.id} section={section} values={values ?? {}} index={i + 1} />
                ))}

              {isLast && <ReviewSummary values={form.getValues()} onEditStep={(i) => goToStep(i)} />}
            </form>
          </div>
        </div>
      </div>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:sticky lg:bottom-4 lg:mt-4 lg:rounded-2xl lg:border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            disabled={stepIndex === 0}
            onClick={() => goToStep(Math.max(0, stepIndex - 1))}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                dispatch(saveDraft(form.getValues()));
                toast.success("Draft saved.");
              }}
            >
              Save draft
            </Button>
            {isLast ? (
              <Button
                type="button"
                className="bg-slate-900 px-6 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={handlePublish}
                disabled={busy || isViewerInSelectedOrg}
              >
                {busy ? "Saving…" : propertyId ? "Update listing" : "Post listing"}
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-slate-900 px-6 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={handleNext}
                disabled={isViewerInSelectedOrg}
              >
                Save &amp; continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

export default PropertyListingFlow;
