"use client";

import { useState } from "react";
import {
  Bath,
  Box,
  Briefcase,
  Check,
  ChefHat,
  Home,
  Lamp,
  Lightbulb,
  PaintRoller,
  Shirt,
  Sofa,
  Store,
  Hammer,
  BedDouble,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { BUDGET_SEGMENT_OPTIONS, PROPERTY_TYPE_OPTIONS, SERVICE_OPTIONS } from "@/features/interiors/wizard/options";
import { cn } from "@/lib/utils";
import { ChipGroup, Field, getAt, inputCls, setPath, toNum, strOpts } from "./ui";

const ICON: Record<string, LucideIcon> = {
  "Full Home Interior (Turnkey)": Home,
  "Modular Kitchen Design & Install": ChefHat,
  "Custom Wardrobes & Storage": Shirt,
  "Living Room Makeover": Sofa,
  "Master Bedroom Luxury Suite": BedDouble,
  "Civil Structural & Flooring Work": Hammer,
  "False Ceiling & Architectural Lighting": Lightbulb,
  "Bathroom Luxury Remodeling": Bath,
  "Home Automation & Smart Lighting": Lamp,
  "Commercial Office Interiors": Briefcase,
  "Retail Showroom & Restaurant Design": Store,
  "3D Photorealistic Visualization & VR": Box,
  "Renovation & Repainting": PaintRoller,
  "Design Consultation Only": MessagesSquare,
};

/** Multi-select service cards; the selected set opens an inline panel with project types, size and capacity. */
export default function ServiceCards({ values, form }: CustomStepProps<InteriorWizardValues>) {
  const selected = values.services?.servicesOffered ?? [];
  const [focus, setFocus] = useState<string | null>(null);
  const errs = form.formState.errors as Record<string, unknown>;
  const err = (p: string) => getAt<{ message?: string }>(errs, p)?.message;

  const toggle = (v: string) => {
    const on = selected.includes(v);
    setPath(form, "services.servicesOffered", on ? selected.filter((x) => x !== v) : [...selected, v]);
    setFocus(on ? null : v);
  };

  const cap = values.services?.areaCapacity ?? { minSqft: null, maxSqft: null, maxConcurrentProjects: null };

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Services" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {strOpts(SERVICE_OPTIONS).map((o) => {
          const Icon = ICON[o.value] ?? Home;
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              className={cn(
                "relative flex min-h-28 flex-col items-start gap-2 rounded-2xl border-2 p-3.5 text-left transition sm:p-4",
                on
                  ? "border-slate-900 bg-slate-50 shadow-sm dark:border-white dark:bg-slate-800"
                  : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900",
                focus === o.value && "ring-4 ring-slate-900/10",
              )}
            >
              <Icon className="size-6 text-slate-700 dark:text-slate-200" aria-hidden />
              <span className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{o.label}</span>
              {on && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {err("services.servicesOffered") && <p className="text-xs font-medium text-rose-600">{err("services.servicesOffered")}</p>}

      {selected.length > 0 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900" aria-live="polite">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {focus ? `A few details for “${focus}”` : "A few details about your projects"}
            </p>
            <p className="text-sm text-slate-500">These apply to all {selected.length} selected service{selected.length > 1 ? "s" : ""}.</p>
          </div>
          <Field label="Which property types do you take on?" required error={err("services.propertyTypesHandled")}>
            {() => (
              <ChipGroup
                multiple
                label="Property types"
                options={strOpts(PROPERTY_TYPE_OPTIONS)}
                value={values.services?.propertyTypesHandled ?? []}
                onChange={(v) => setPath(form, "services.propertyTypesHandled", v)}
              />
            )}
          </Field>
          <Field label="Which budgets do you work with?">
            {() => (
              <ChipGroup
                multiple
                label="Budget segments"
                options={strOpts(BUDGET_SEGMENT_OPTIONS)}
                value={values.services?.budgetSegments ?? []}
                onChange={(v) => setPath(form, "services.budgetSegments", v)}
              />
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Smallest project" hint="sq.ft">
              {(id) => (
                <input id={id} inputMode="numeric" className={inputCls} placeholder="e.g. 400" value={cap.minSqft ?? ""} onChange={(e) => setPath(form, "services.areaCapacity.minSqft", toNum(e.target.value))} />
              )}
            </Field>
            <Field label="Largest project" hint="sq.ft">
              {(id) => (
                <input id={id} inputMode="numeric" className={inputCls} placeholder="e.g. 5000" value={cap.maxSqft ?? ""} onChange={(e) => setPath(form, "services.areaCapacity.maxSqft", toNum(e.target.value))} />
              )}
            </Field>
            <Field label="Projects at once">
              {(id) => (
                <input
                  id={id}
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="e.g. 4"
                  value={cap.maxConcurrentProjects ?? ""}
                  onChange={(e) => setPath(form, "services.areaCapacity.maxConcurrentProjects", toNum(e.target.value))}
                />
              )}
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
