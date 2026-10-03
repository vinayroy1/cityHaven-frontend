"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { StepConfig } from "@/features/propertyListing/formConfig/types";

export function Stepper({
  steps,
  current,
  maxVisited,
  onNavigate,
}: {
  steps: StepConfig[];
  current: number;
  maxVisited: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = i <= maxVisited;
        const last = i === steps.length - 1;
        return (
          <li key={step.id} className="relative">
            {!last && (
              <span
                className={cn(
                  "absolute left-[19px] top-8 h-[calc(100%-1.5rem)] w-px",
                  done ? "bg-emerald-400" : "bg-slate-200",
                )}
              />
            )}
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onNavigate(i)}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition",
                active ? "bg-slate-50" : reachable ? "hover:bg-slate-50" : "opacity-45",
              )}
            >
              <span
                className={cn(
                  "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition",
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-400",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm font-semibold",
                    active ? "text-slate-900" : "text-slate-700",
                  )}
                >
                  {step.label}
                </span>
                {step.caption && (
                  <span className="block truncate text-xs text-slate-400">{step.caption}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
