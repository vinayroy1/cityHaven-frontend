"use client";

import React from "react";
import { cn } from "@/components/ui/utils";
import type { RequiredFieldMeta } from "@/features/propertyListing/formConfig/validation";

interface MandatoryFieldsTrackerProps {
  totalRequired: number;
  missingFields: RequiredFieldMeta[];
  onJumpToField: (fieldId: string) => void;
}

export function MandatoryFieldsTracker({
  totalRequired,
  missingFields,
  onJumpToField,
}: MandatoryFieldsTrackerProps) {
  if (totalRequired === 0) return null;

  const completedCount = totalRequired - missingFields.length;
  const isAllDone = missingFields.length === 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 transition-all duration-300 shadow-sm",
        isAllDone
          ? "border-emerald-200/90 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20"
          : "border-slate-200/90 bg-gradient-to-r from-amber-50/60 via-white to-rose-50/40 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/80",
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-transform duration-300",
              isAllDone
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none"
                : "bg-amber-500 text-white shadow-sm shadow-amber-200 dark:shadow-none",
            )}
          >
            {isAllDone ? "✓" : `${completedCount}/${totalRequired}`}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                {isAllDone
                  ? "All mandatory fields completed"
                  : `Mandatory fields: ${missingFields.length} remaining`}
              </h4>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  isAllDone
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
                )}
              >
                {isAllDone ? "Ready to continue" : "Required"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAllDone
                ? "You've filled all required information for this step. Click Save & continue below."
                : "Non-mandatory fields are optional. Click any remaining field to jump straight to it:"}
            </p>
          </div>
        </div>

        {!isAllDone && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:justify-end sm:pt-0">
            {missingFields.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onJumpToField(f.id)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-rose-200/90 bg-white/95 px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm transition hover:border-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-900/70 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-700 dark:hover:text-white cursor-pointer"
                title={`Jump to ${f.label}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 transition group-hover:bg-white" />
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
