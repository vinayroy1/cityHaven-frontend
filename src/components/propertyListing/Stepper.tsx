"use client";

import React from "react";
import { cn } from "@/components/ui/utils";

export interface StepDescriptor {
  id: number;
  label: string;
  caption?: string;
}

interface StepperProps {
  steps: StepDescriptor[];
  currentStep: number; // 1-based
  onNavigate?: (stepId: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onNavigate }) => {
  const percent = Math.round(((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-indigo-50 to-white text-slate-900 shadow-2xl">
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.25),transparent_32%)]" />
      <div className="relative px-4 py-3 sm:px-6 sm:py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Property Launchpad</p>
            <p className="text-base font-semibold">Step {currentStep} of {steps.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-slate-800 shadow-inner">
              {percent}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onNavigate?.(step.id)}
                  className={cn(
                    "group relative flex h-full min-h-[64px] flex-col items-start justify-center rounded-2xl border px-3 py-2 text-left transition-all",
                    "backdrop-blur bg-white/70 hover:bg-white",
                    isActive && "border-indigo-300 shadow-lg shadow-indigo-100 ring-1 ring-indigo-200",
                    isDone && !isActive && "border-slate-200 text-slate-600"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all",
                        isActive
                          ? "border-indigo-500 bg-indigo-500 text-white"
                          : isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      )}
                    >
                      {isDone ? "✓" : step.id}
                    </span>
                    <div>
                      <p className={cn("text-sm font-semibold", isActive ? "text-slate-900" : "text-slate-700")}>
                        {step.label}
                      </p>
                      {step.caption && <p className="text-[11px] text-slate-500">{step.caption}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 transition-all"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

Stepper.displayName = "Stepper";
