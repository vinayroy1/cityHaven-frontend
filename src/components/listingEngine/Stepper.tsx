"use client";

import React from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { StepConfig } from "@/lib/listingEngine/types";
import { groupByPhase } from "./phases";

export type StepStatus = "done" | "todo" | "none";

/** Desktop rail: phases expand into their steps; done / active / error states. */
export function Stepper({
  steps,
  phases,
  current,
  maxVisited,
  onNavigate,
  statusFor,
  errorStepId,
}: {
  steps: StepConfig[];
  phases?: readonly string[];
  current: number;
  maxVisited: number;
  onNavigate: (index: number) => void;
  /** readiness of each step's required items. */
  statusFor?: (stepId: string) => StepStatus;
  /** step currently showing validation errors. */
  errorStepId?: string;
}) {
  const groups = groupByPhase(steps, phases);
  const hasPhases = groups.some((g) => g.label);
  return (
    <nav aria-label="Steps">
      <ol className="space-y-2">
        {groups.map((g, gi) => {
          const activePhase = g.steps.some((s) => s.index === current);
          const phaseDone = g.steps.every((s) => s.index < maxVisited && (statusFor?.(s.step.id) ?? "none") !== "todo") && !activePhase;
          const expanded = !hasPhases || activePhase;
          const first = g.steps[0];
          return (
            <li key={g.label || gi}>
              {hasPhases && (
                <button
                  type="button"
                  disabled={first.index > maxVisited}
                  onClick={() => !activePhase && onNavigate(first.index)}
                  aria-expanded={expanded}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
                    first.index > maxVisited ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      phaseDone ? "bg-emerald-500 text-white" : activePhase ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {phaseDone ? <Check className="h-4 w-4" /> : gi + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Phase {gi + 1}</span>
                    <span className={cn("block truncate text-sm font-semibold", activePhase ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>{g.label}</span>
                  </span>
                </button>
              )}
              {expanded && (
                <ol className={cn(hasPhases && "ml-[22px] mt-1 border-l border-slate-200 pl-3 dark:border-slate-800")}>
                  {g.steps.map(({ step, index: i }) => {
                    const active = i === current;
                    const reachable = i <= maxVisited;
                    const status = statusFor?.(step.id) ?? "none";
                    const error = errorStepId === step.id;
                    const done = !active && reachable && (status === "done" || (status === "none" && i < maxVisited));
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          disabled={!reachable}
                          aria-current={active ? "step" : undefined}
                          onClick={() => reachable && onNavigate(i)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition",
                            active ? "bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white" : reachable ? "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60" : "cursor-not-allowed text-slate-400 opacity-60",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              error ? "border-rose-500 text-rose-500" : done ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-slate-900 dark:border-white" : "border-slate-300 dark:border-slate-700",
                            )}
                          >
                            {error ? <AlertCircle className="h-3 w-3" /> : done ? <Check className="h-2.5 w-2.5" /> : active ? <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white" /> : null}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{step.label}</span>
                          {reachable && !active && (error || status === "todo") && <span className="sr-only">Needs attention</span>}
                          {reachable && !active && status === "todo" && !error && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
