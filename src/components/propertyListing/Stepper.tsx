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
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white shadow-2xl">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.3),transparent_32%)]" />
      <div className="relative px-4 py-3 sm:px-6 sm:py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">Property Launchpad</p>
            <p className="text-base font-semibold">Step {currentStep} of {steps.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-200/80">Progress</span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-semibold shadow-inner">
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
                    "backdrop-blur bg-white/5 hover:bg-white/10",
                    isActive && "border-white/70 shadow-lg shadow-blue-500/20 ring-1 ring-white/80",
                    isDone && !isActive && "border-white/20 text-slate-100/80"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all",
                        isActive
                          ? "border-white bg-white text-slate-900"
                          : isDone
                          ? "border-white/60 text-white"
                          : "border-white/40 text-slate-200"
                      )}
                    >
                      {isDone ? "✓" : step.id}
                    </span>
                    <div>
                      <p className={cn("text-sm font-semibold", isActive ? "text-white" : "text-slate-100")}>
                        {step.label}
                      </p>
                      {step.caption && <p className="text-[11px] text-slate-200/80">{step.caption}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-300 transition-all"
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
