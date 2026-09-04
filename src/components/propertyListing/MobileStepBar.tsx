"use client";

import React from "react";
import { cn } from "@/components/ui/utils";
import type { StepConfig } from "@/features/propertyListing/formConfig/types";

// Compact progress header for mobile — replaces the full-height vertical rail.
export function MobileStepBar({
  steps,
  current,
  maxVisited,
  score,
  onNavigate,
}: {
  steps: StepConfig[];
  current: number;
  maxVisited: number;
  score: number;
  onNavigate: (index: number) => void;
}) {
  const step = steps[current];
  const pct = Math.max(0, Math.min(100, score));
  const r = 13;
  const c = 2 * Math.PI * r;
  const tone = pct >= 80 ? "#059669" : pct >= 45 ? "#0f172a" : "#f43f5e";

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
            Step {current + 1} of {steps.length}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">{step.title ?? step.label}</p>
        </div>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r={r}
              fill="none"
              stroke={tone}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (pct / 100) * c}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-slate-900">{pct}</span>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxVisited;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={s.label}
              disabled={!reachable}
              onClick={() => reachable && onNavigate(i)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                done ? "bg-emerald-400" : active ? "bg-slate-900" : "bg-slate-200",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
