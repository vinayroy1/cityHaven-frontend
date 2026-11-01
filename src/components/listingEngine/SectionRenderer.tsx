"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { FormProvider, useFormContext, type UseFormReturn } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import { evaluateCondition } from "@/lib/listingEngine/conditions";
import { isFieldFilled } from "@/lib/listingEngine/validation";
import type { ComponentType } from "react";
import type { CustomStepProps, FormValues, PredicateRegistry, ReadinessLevel, SectionConfig, WizardMode } from "@/lib/listingEngine/types";
import { ListingEngineProvider, useEngine } from "./EngineContext";
import { FieldRenderer, MissingComponent } from "./FieldRenderer";
import { sectionCard } from "./theme";

export function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  return level === "SUBMIT" ? (
    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
      Required
    </span>
  ) : (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
      Needed to publish
    </span>
  );
}

export type SectionRendererProps = {
  section: SectionConfig;
  /** standalone use (manage pages): supply these instead of relying on the shell's providers. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<any>;
  values?: FormValues;
  mode?: WizardMode;
  predicates?: PredicateRegistry;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customComponents?: Record<string, ComponentType<CustomStepProps<any>>>;
};

export function SectionRenderer({ section, form, values: v, mode, predicates: p, customComponents }: SectionRendererProps) {
  const parent = useEngine();
  const standalone = Boolean(form || v || mode || p || customComponents);
  if (!standalone) return <SectionGate section={section} />;
  const value = {
    ...parent,
    values: v ?? parent.values,
    mode: mode ?? parent.mode,
    predicates: p ?? parent.predicates,
    customComponents: customComponents ?? parent.customComponents,
  };
  const inner = (
    <ListingEngineProvider value={value}>
      <SectionGate section={section} />
    </ListingEngineProvider>
  );
  return form ? <FormProvider {...form}>{inner}</FormProvider> : inner;
}

function SectionGate({ section }: { section: SectionConfig }) {
  const { values, predicates } = useEngine();
  if (!evaluateCondition(values, section.visibleWhen, predicates)) return null;
  if (section.kind !== "custom" && !section.fields.some((f) => evaluateCondition(values, f.visibleWhen, predicates))) return null;
  return <SectionBody section={section} />;
}

function SectionBody({ section }: { section: SectionConfig }) {
  const engine = useEngine();
  const form = useFormContext();
  const { values, predicates, mode } = engine;
  const [collapsed, setCollapsed] = useState(Boolean(section.collapsible && section.defaultCollapsed));
  const isCustom = section.kind === "custom";
  const visibleFields = isCustom ? [] : section.fields.filter((f) => evaluateCondition(values, f.visibleWhen, predicates));

  const required = isCustom
    ? (section.requires ?? []).filter((r) => evaluateCondition(values, r.when, predicates)).map((r) => ({ id: r.path, label: r.label, min: r.minItems }))
    : visibleFields
        .filter((f) => f.required || (f.requiredWhen ? evaluateCondition(values, f.requiredWhen, predicates) : false))
        .map((f) => ({ id: f.id, label: f.label, min: undefined as number | undefined }));
  const missing = required.filter((r) => !isFieldFilled(values, r.id, r.min));
  const customErrors = isCustom
    ? required.map((r) => form.getFieldState(r.id, form.formState).error?.message).filter(Boolean)
    : [];
  const hasError = customErrors.length > 0 || (collapsed && visibleFields.some((f) => form.getFieldState(f.id, form.formState).error));

  const anyError = customErrors.length > 0 || visibleFields.some((f) => form.getFieldState(f.id, form.formState).error);
  // open a collapsed section when validation flags something inside it
  useEffect(() => {
    if (anyError) setCollapsed(false);
  }, [anyError]);

  const headerId = `sec-${section.id}`;
  const header = (section.title || section.collapsible) && (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 id={headerId} className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          {section.title}
          {section.badge && <ReadinessBadge level={section.badge} />}
        </h3>
        {section.description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {required.length > 0 && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              missing.length ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
            )}
          >
            {missing.length ? `${required.length - missing.length}/${required.length}` : "Done"}
          </span>
        )}
        {section.collapsible && <ChevronDown aria-hidden className={cn("h-5 w-5 text-slate-400 transition", !collapsed && "rotate-180")} />}
      </div>
    </div>
  );

  const Comp = isCustom && section.component ? engine.customComponents[section.component] : undefined;

  return (
    <section
      aria-labelledby={section.title ? headerId : undefined}
      data-section-id={section.id}
      data-requires={isCustom ? required.map((r) => r.id).join(" ") : undefined}
      className={cn(sectionCard, "scroll-mt-28 space-y-4", hasError && "border-rose-300 dark:border-rose-800")}
    >
      {section.collapsible ? (
        <button type="button" aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)} className="block w-full text-left">
          {header}
        </button>
      ) : (
        header
      )}
      {!collapsed && (
        <>
          {mode === "manage" && section.moderated && (
            <p className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Changes here go live after a quick review.
            </p>
          )}
          {isCustom ? (
            Comp ? (
              <Comp
                values={values}
                form={form}
                mode={mode}
                section={section}
                props={section.props}
                goToStep={engine.goToStep}
                readiness={engine.readiness}
              />
            ) : (
              <MissingComponent name={section.component} />
            )
          ) : (
            <div className={cn("grid gap-4", section.mobileColumns === 2 ? "grid-cols-2" : "sm:grid-cols-2")}>
              {visibleFields.map((f) => (
                <FieldRenderer key={f.id} field={f} />
              ))}
            </div>
          )}
          {customErrors.length > 0 && (
            <ul role="alert" className="space-y-0.5">
              {customErrors.map((m, i) => (
                <li key={i} className="text-xs font-medium text-rose-600">
                  {m}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
