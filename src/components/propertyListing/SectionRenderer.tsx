"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { evaluateCondition } from "@/features/propertyListing/formConfig/conditions";
import type { FormValues, SectionConfig } from "@/features/propertyListing/formConfig/types";
import { isFieldFilled } from "@/features/propertyListing/formConfig/validation";
import { FieldRenderer } from "./fields/FieldRenderer";
import { sectionCard } from "./theme";

const FULL_WIDTH_TYPES = new Set(["textarea", "chip-radio", "chip-multi", "chip-add", "media", "price", "brokerage"]);

export function SectionRenderer({
  section,
  values,
  index,
}: {
  section: SectionConfig;
  values: FormValues;
  index?: number;
}) {
  const [collapsed, setCollapsed] = useState(Boolean(section.defaultCollapsed));

  if (!evaluateCondition(values, section.visibleWhen)) return null;

  const visibleFields = section.fields.filter((f) => evaluateCondition(values, f.visibleWhen));
  if (visibleFields.length === 0) return null;

  const requiredFields = visibleFields.filter(
    (f) => f.required || (f.requiredWhen ? evaluateCondition(values, f.requiredWhen) : false),
  );
  const missingInThisSection = requiredFields.filter((f) => !isFieldFilled(values, f.id));

  return (
    <section className={sectionCard}>
      {(section.title || section.collapsible) && (
        <button
          type="button"
          disabled={!section.collapsible}
          onClick={() => section.collapsible && setCollapsed((c) => !c)}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-3">
            {typeof index === "number" && (
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                {index}
              </span>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {section.title && (
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                )}
                {requiredFields.length === 0 ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Optional section
                  </span>
                ) : missingInThisSection.length > 0 ? (
                  <span className="rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                    {missingInThisSection.length} mandatory {missingInThisSection.length === 1 ? "field" : "fields"}
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-200/90 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    ✓ Mandatory filled
                  </span>
                )}
              </div>
              {section.requiredHint && (
                <p className="mt-0.5 text-xs font-medium text-rose-500">{section.requiredHint}</p>
              )}
              {section.description && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
              )}
            </div>
          </div>
          {section.collapsible && (
            <ChevronDown
              className={cn(
                "mt-1 h-4 w-4 shrink-0 text-slate-400 transition",
                !collapsed && "rotate-180",
              )}
            />
          )}
        </button>
      )}

      {!collapsed && (
        <div className={cn("grid gap-4 sm:grid-cols-2", section.title && "mt-4")}>
          {visibleFields.map((field, i) => (
            <div
              key={`${field.id}:${i}`}
              id={`field-container-${field.id}`}
              className={cn(
                FULL_WIDTH_TYPES.has(field.type) ? "sm:col-span-2" : undefined,
                "transition-all duration-300 rounded-xl",
              )}
            >
              <FieldRenderer field={field} values={values} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
