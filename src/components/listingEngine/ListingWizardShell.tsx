"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Eye, History, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormProvider, useForm, useWatch, type DefaultValues, type Path } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { computeReadiness, stepReadinessStatus } from "@/lib/listingEngine/readiness";
import { computeScore } from "@/lib/listingEngine/scoring";
import { createDraftStorage, isLocalNewer, type DraftEnvelope } from "@/lib/listingEngine/storage";
import { getRequiredFieldsForStep, isStepVisible, missingRequiredForStep } from "@/lib/listingEngine/validation";
import { useAutosave } from "@/lib/listingEngine/useAutosave";
import type { FormValues, ReadinessReport, StepConfig, VerticalConfig } from "@/lib/listingEngine/types";
import { ListingEngineProvider, type EngineContextValue } from "./EngineContext";
import { MandatoryFieldsTracker } from "./MandatoryFieldsTracker";
import { MissingComponent } from "./FieldRenderer";
import { MobileStepBar } from "./MobileStepBar";
import { SaveStatusPill } from "./SaveStatusPill";
import { ScoreCard } from "./ScoreCard";
import { SectionRenderer } from "./SectionRenderer";
import { StickyActionBar } from "./StickyActionBar";
import { Stepper } from "./Stepper";
import { PresignUploadProvider, UploadProvider, type Uploader } from "./uploadContext";
import { pageBg } from "./theme";
import { scrollToPath, validateStep } from "./validateStep";

export type FinalActionCtx<V extends FormValues> = {
  values: V;
  readiness: ReadinessReport;
  submit: () => Promise<void>;
  publish: () => Promise<void>;
  busy: "submit" | "publish" | null;
};

export type ListingWizardShellProps<V extends FormValues> = {
  vertical: VerticalConfig<V>;
  /** page heading above the step content. */
  heading?: string;
  subheading?: string;
  /** "Save & exit" link target. */
  exitHref?: string;
  onSubmitted?: (values: V) => void;
  onPublished?: (values: V) => void;
  /** custom uploader (tests / other storage); default presigns through the API. */
  upload?: Uploader;
  /** sync the current step to `?step=<id>` so browser Back moves between steps. Default true. */
  syncUrl?: boolean;
  debounceMs?: number;
  submitLabel?: string;
  publishLabel?: string;
};

const readStepParam = () => {
  if (typeof window === "undefined") return null;
  try {
    return new URL(window.location.href).searchParams.get("step");
  } catch {
    return null;
  }
};

export function ListingWizardShell<V extends FormValues>(props: ListingWizardShellProps<V>) {
  const inner = <ShellInner {...props} />;
  return props.upload ? <UploadProvider upload={props.upload}>{inner}</UploadProvider> : <PresignUploadProvider>{inner}</PresignUploadProvider>;
}

function ShellInner<V extends FormValues>({
  vertical,
  heading,
  subheading,
  exitHref,
  onSubmitted,
  onPublished,
  syncUrl = true,
  debounceMs,
  submitLabel = "Submit for review",
  publishLabel = "Publish",
}: ListingWizardShellProps<V>) {
  const form = useForm<V>({ defaultValues: vertical.initialValues as DefaultValues<V>, mode: "onTouched" });
  const loaded = vertical.load();
  const storage = useMemo(() => createDraftStorage<V>(vertical.storageKey), [vertical.storageKey]);
  const watched = useWatch({ control: form.control }) as V;
  const values = useMemo(() => ({ ...vertical.initialValues, ...watched }) as V, [watched, vertical.initialValues]);
  const predicates = vertical.predicates;

  const [hydrated, setHydrated] = useState(false);
  const [resume, setResume] = useState<DraftEnvelope<V> | null>(null);
  const [currentId, setCurrentId] = useState<string>(vertical.steps[0]?.id ?? "");
  const [maxVisited, setMaxVisited] = useState(0);
  const [issues, setIssues] = useState<{ path: string; message: string }[]>([]);
  const [busy, setBusy] = useState<"submit" | "publish" | null>(null);
  const [errorStepId, setErrorStepId] = useState<string | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);

  const visibleSteps = useMemo(() => vertical.steps.filter((s) => isStepVisible(s, values, { predicates })), [vertical.steps, values, predicates]);
  const idx = Math.max(0, visibleSteps.findIndex((s) => s.id === currentId));
  const step = visibleSteps[idx] as StepConfig | undefined;
  const isLast = idx === visibleSteps.length - 1;

  // ---- hydrate once from server data / local shadow copy ----
  useEffect(() => {
    if (hydrated || loaded.isLoading) return;
    const local = storage.load();
    const base = (loaded.data ?? vertical.initialValues) as V;
    form.reset(base);
    const serverStep = typeof loaded.wizardStep === "number" ? loaded.wizardStep : 0;
    const urlStep = readStepParam();
    const steps = vertical.steps.filter((s) => isStepVisible(s, base, { predicates }));
    const reach = Math.min(Math.max(serverStep, 0), Math.max(steps.length - 1, 0));
    setMaxVisited(reach);
    const urlIdx = urlStep ? steps.findIndex((s) => s.id === urlStep) : -1;
    const startIdx = urlIdx >= 0 && urlIdx <= reach ? urlIdx : reach;
    setCurrentId(steps[startIdx]?.id ?? steps[0]?.id ?? "");
    if (local && isLocalNewer(local, loaded.updatedAt) && JSON.stringify(local.values) !== JSON.stringify(base)) {
      setResume(local);
    }
    setHydrated(true);
  }, [hydrated, loaded.isLoading, loaded.data, loaded.updatedAt, loaded.wizardStep, storage, form, vertical, predicates]);

  // ---- local shadow (throttled) + autosave ----
  const shadowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const persistShadow = useCallback(
    (v: V) => {
      if (shadowTimer.current) clearTimeout(shadowTimer.current);
      shadowTimer.current = setTimeout(() => storage.persist(v, idxRef.current), 400);
    },
    [storage],
  );
  const autosave = useAutosave<V>({
    form,
    sectionKey: step?.id ?? "",
    save: vertical.saveSection,
    debounceMs,
    enabled: hydrated && !resume,
    onChange: persistShadow,
  });
  useEffect(() => {
    if (autosave.status === "saved" && autosave.dirtySections.length === 0) {
      if (shadowTimer.current) clearTimeout(shadowTimer.current);
      storage.clear();
    }
  }, [autosave.status, autosave.dirtySections.length, storage]);

  // clear a field's manual error as soon as it changes
  useEffect(() => {
    const sub = form.watch((_v, info) => {
      if (info?.name && form.getFieldState(info.name as Path<V>).error) form.clearErrors(info.name as Path<V>);
      if (info?.name) setIssues((list) => (list.length ? list.filter((i) => !i.path.startsWith(info.name!)) : list));
    });
    return () => sub.unsubscribe();
  }, [form]);

  // ---- navigation + browser back ----
  const navigate = useCallback(
    (nextId: string, mode: "push" | "replace" = "push") => {
      setCurrentId(nextId);
      setIssues([]);
      setErrorStepId(undefined);
      if (syncUrl && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("step", nextId);
        if (mode === "push") window.history.pushState(null, "", url);
        else window.history.replaceState(null, "", url);
      }
      if (typeof window !== "undefined") window.scrollTo?.({ top: 0, behavior: "smooth" });
    },
    [syncUrl],
  );

  useEffect(() => {
    if (!syncUrl) return;
    const onPop = () => {
      const id = readStepParam();
      const target = id ? visibleSteps.findIndex((s) => s.id === id) : 0;
      if (target >= 0 && target <= maxVisited) {
        void autosave.flush();
        setCurrentId(visibleSteps[target].id);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [syncUrl, visibleSteps, maxVisited, autosave]);

  const goToIndex = useCallback(
    (i: number) => {
      const target = visibleSteps[i];
      if (!target) return;
      void autosave.flush();
      navigate(target.id);
    },
    [visibleSteps, autosave, navigate],
  );

  const goToStep = useCallback(
    (stepId: string, fieldPath?: string) => {
      const i = visibleSteps.findIndex((s) => s.id === stepId);
      if (i < 0) return;
      setMaxVisited((m) => Math.max(m, i));
      if (stepId !== step?.id) goToIndex(i);
      if (fieldPath) setTimeout(() => scrollToPath(fieldPath), 120);
    },
    [visibleSteps, goToIndex, step?.id],
  );

  const applyIssues = useCallback(
    (list: { path: string; message: string }[]) => {
      setIssues(list);
      list.forEach((i) => form.setError(i.path as Path<V>, { type: "manual", message: i.message }));
      if (list[0]) setTimeout(() => scrollToPath(list[0].path), 60);
    },
    [form],
  );

  const checkStep = useCallback(
    (s: StepConfig) => {
      const list = validateStep(s, form.getValues(), { predicates, schema: vertical.stepSchemas?.[s.id] });
      if (list.length) applyIssues(list);
      setErrorStepId(list.length ? s.id : undefined);
      return list.length === 0;
    },
    [form, predicates, vertical.stepSchemas, applyIssues],
  );

  const next = () => {
    if (!step) return;
    if (!checkStep(step)) return;
    const n = Math.min(idx + 1, visibleSteps.length - 1);
    setMaxVisited((m) => Math.max(m, n));
    goToIndex(n);
  };
  const back = idx > 0 ? () => goToIndex(idx - 1) : undefined;

  // ---- readiness / score ----
  const readiness = useMemo(() => computeReadiness(vertical.readinessRules, values), [vertical.readinessRules, values]);
  const score = useMemo(() => computeScore(visibleSteps, values, { predicates }).pct, [visibleSteps, values, predicates]);
  const statusFor = useCallback(
    (id: string) => {
      const s = vertical.steps.find((x) => x.id === id);
      const r = stepReadinessStatus(readiness, id, "SUBMIT");
      if (r !== "none") return r;
      return s && missingRequiredForStep(s, values, { predicates }).length ? ("todo" as const) : ("none" as const);
    },
    [readiness, values, vertical.steps, predicates],
  );

  const finish = async (kind: "submit" | "publish") => {
    if (!step || !checkStep(step)) return;
    // every visible step must pass its own required checks before submitting
    for (const s of visibleSteps) {
      const list = validateStep(s, form.getValues(), { predicates, schema: vertical.stepSchemas?.[s.id] });
      if (list.length) {
        toast.error(`“${s.label}” needs attention before you can ${kind}.`);
        goToStep(s.id);
        setTimeout(() => applyIssues(list), 150);
        return;
      }
    }
    setBusy(kind);
    try {
      await autosave.flush();
      const v = form.getValues();
      if (kind === "submit") {
        await vertical.submit(v);
        toast.success("Submitted for review. We’ll let you know once it’s approved.");
        onSubmitted?.(v);
      } else {
        await vertical.publish(v);
        toast.success("Your listing is live.");
        onPublished?.(v);
      }
      storage.clear();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Could not ${kind}. Please try again.`);
    } finally {
      setBusy(null);
    }
  };

  const restore = () => {
    if (!resume) return;
    form.reset(resume.values);
    const steps = vertical.steps.filter((s) => isStepVisible(s, resume.values, { predicates }));
    const target = Math.min(resume.step, steps.length - 1);
    setMaxVisited((m) => Math.max(m, target));
    if (steps[target]) navigate(steps[target].id, "replace");
    steps.forEach((s) => autosave.markDirty(s.id));
    setResume(null);
  };
  const discard = () => {
    storage.clear();
    setResume(null);
  };

  const engineValue: EngineContextValue = useMemo(
    () => ({ values, predicates, customComponents: vertical.customComponents, mode: "wizard", goToStep, readiness }),
    [values, predicates, vertical.customComponents, goToStep, readiness],
  );

  if (!hydrated) return <ShellSkeleton />;

  const required = step ? getRequiredFieldsForStep(step, values, { predicates }) : [];
  const missing = step ? missingRequiredForStep(step, values, { predicates }) : [];
  const submitItemsLeft = readiness.items.filter((i) => i.level === "SUBMIT" && !i.done).length;
  const statusPill = <SaveStatusPill status={autosave.status} lastSavedAt={autosave.lastSavedAt} onRetry={() => void autosave.flush()} />;

  const CustomStep = step?.kind === "custom" && step.component ? vertical.customComponents[step.component] : undefined;

  return (
    <FormProvider {...form}>
      <ListingEngineProvider value={engineValue}>
        <div className={cn(pageBg, "overflow-x-clip")}>
          <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-0 sm:px-6 lg:pb-12 lg:pt-8">
            <MobileStepBar steps={visibleSteps} phases={vertical.phases} current={idx} maxVisited={maxVisited} score={score} onNavigate={goToIndex} right={statusPill} />

            <div className="mt-4 grid gap-6 lg:mt-0 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
              <aside className="hidden lg:block">
                <div className="sticky top-6 space-y-4">
                  {heading && <p className="px-2 text-xs font-semibold uppercase tracking-wide text-rose-500">{heading}</p>}
                  <Stepper steps={visibleSteps} phases={vertical.phases} current={idx} maxVisited={maxVisited} onNavigate={goToIndex} statusFor={statusFor} errorStepId={errorStepId} />
                  {exitHref && (
                    <Link href={exitHref} onClick={() => void autosave.flush()} className="block px-2 text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800">
                      Save & exit
                    </Link>
                  )}
                </div>
              </aside>

              <main className="min-w-0">
                {resume && (
                  <div role="region" aria-label="Unsaved draft" className="mb-4 flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-100 sm:flex-row sm:items-center">
                    <History className="hidden h-5 w-5 shrink-0 sm:block" />
                    <p className="min-w-0 flex-1">
                      You have unsaved changes from {new Date(resume.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}. Pick up where you left off?
                    </p>
                    <div className="flex gap-2">
                      <button type="button" onClick={restore} className="h-10 rounded-xl bg-sky-900 px-4 text-sm font-semibold text-white dark:bg-sky-200 dark:text-sky-950">
                        Restore
                      </button>
                      <button type="button" onClick={discard} className="h-10 rounded-xl px-3 text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900">
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                {step && (
                  <header className="mb-4 space-y-1">
                    {step.caption && <p className="hidden text-xs font-semibold uppercase tracking-wide text-rose-500 lg:block">{step.caption}</p>}
                    {subheading && idx === 0 && <p className="text-sm text-slate-500">{subheading}</p>}
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{step.title ?? step.label}</h1>
                    {step.description && <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>}
                  </header>
                )}

                {issues.length > 0 && (
                  <div role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {issues.length === 1 ? "1 thing to fix" : `${issues.length} things to fix`} before continuing
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {issues.slice(0, 6).map((i) => (
                            <li key={i.path}>
                              <button type="button" onClick={() => scrollToPath(i.path)} className="text-left underline-offset-2 hover:underline">
                                {i.message}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button type="button" aria-label="Dismiss" onClick={() => setIssues([])} className="rounded p-1 hover:bg-rose-100 dark:hover:bg-rose-900">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {step?.kind === "custom" ? (
                    CustomStep ? (
                      <div data-requires={(step.requires ?? []).map((r) => r.path).join(" ")}>
                        <CustomStep values={values} form={form} mode="wizard" goToStep={goToStep} readiness={readiness} section={{ id: step.id, title: step.title, fields: [] }} />
                      </div>
                    ) : (
                      <MissingComponent name={step.component} />
                    )
                  ) : (
                    step?.sections?.map((sec) => <SectionRenderer key={sec.id} section={sec} />)
                  )}
                </div>

                <StickyActionBar
                  onBack={back}
                  status={statusPill}
                  extra={
                    <>
                      {vertical.renderPreview && (
                        <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 xl:hidden">
                          <Eye className="h-4 w-4" />
                          <span className="max-sm:sr-only">Preview</span>
                        </button>
                      )}
                      {exitHref && (
                        <Link href={exitHref} onClick={() => void autosave.flush()} className="hidden h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex">
                          Save &amp; exit
                        </Link>
                      )}
                    </>
                  }
                  primary={
                    isLast
                      ? {
                          label: submitLabel,
                          onClick: () => void finish("submit"),
                          busy: busy === "submit",
                          disabled: !readiness.canSubmit || busy !== null,
                          icon: "none",
                        }
                      : { label: "Next", onClick: next }
                  }
                  secondary={
                    isLast && readiness.canSubmit
                      ? { label: publishLabel, onClick: () => void finish("publish"), busy: busy === "publish", disabled: !readiness.canPublish || busy !== null }
                      : undefined
                  }
                />
                {isLast && !readiness.canSubmit && (
                  <p className="mt-2 text-center text-xs text-slate-500 lg:text-right">
                    {submitItemsLeft} required {submitItemsLeft === 1 ? "item" : "items"} left before you can submit.
                  </p>
                )}
                {exitHref && (
                  <p className="mt-3 text-center sm:hidden">
                    <Link href={exitHref} onClick={() => void autosave.flush()} className="text-xs font-medium text-slate-500 underline underline-offset-2">
                      Save & exit
                    </Link>
                  </p>
                )}
              </main>

              <aside className="hidden space-y-4 xl:block">
                <div className="sticky top-6 max-h-[calc(100vh-3rem)] space-y-4 overflow-y-auto">
                  <ScoreCard score={score} />
                  {vertical.renderPreview ? (
                    <section aria-label="Live preview" className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800">Live preview</p>
                      <div className="p-3">{vertical.renderPreview(values)}</div>
                    </section>
                  ) : null}
                  <MandatoryFieldsTracker required={required} missing={missing} onJump={scrollToPath} />
                </div>
              </aside>
            </div>
          </div>
        </div>
        {vertical.renderPreview && (
          <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Preview</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">{previewOpen ? vertical.renderPreview(values) : null}</div>
            </SheetContent>
          </Sheet>
        )}
      </ListingEngineProvider>
    </FormProvider>
  );
}

function ShellSkeleton() {
  return (
    <div className={pageBg} aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-72 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/80 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
