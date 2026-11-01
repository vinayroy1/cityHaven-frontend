"use client";

import React from "react";
import { cn } from "@/components/ui/utils";
import type { StepConfig } from "@/lib/listingEngine/types";
import { groupByPhase } from "./phases";

/** Compact sticky progress header for small screens (replaces the rail). */
export function MobileStepBar({
  steps,
  phases,
  current,
  maxVisited,
  score,
  onNavigate,
  right,
}: {
  steps: StepConfig[];
  phases?: readonly string[];
  current: number;
  maxVisited: number;
  score: number;
  onNavigate: (index: number) => void;
  right?: React.ReactNode;
}) {
  const step = steps[current];
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const r = 13;
  const c = 2 * Math.PI * r;
  const tone = pct >= 80 ? "#059669" : pct >= 45 ? "#0f172a" : "#f43f5e";
  if (!step) return null;
  const groups = groupByPhase(steps, phases);
  const hasPhases = groups.length > 1 && groups.every((g) => g.label);
  const gi = groups.findIndex((g) => g.steps.some((s) => s.index === current));
  const pos = gi >= 0 ? groups[gi].steps.findIndex((s) => s.index === current) : 0;
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
            {hasPhases ? `${groups[gi]?.label} · ${pos + 1}/${groups[gi]?.steps.length}` : `Step ${current + 1} of ${steps.length}`}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{step.label}</p>
          {right && <div className="mt-0.5">{right}</div>}
        </div>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center" aria-label={`Profile ${pct}% complete`} role="img">
          <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
            <circle cx="18" cy="18" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
            <circle cx="18" cy="18" r={r} fill="none" stroke={tone} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} transform="rotate(-90 18 18)" />
          </svg>
          <span className="absolute text-[10px] font-bold text-slate-900 dark:text-white">{pct}</span>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        {hasPhases
          ? groups.map((g, i) => {
              const first = g.steps[0].index;
              const reachable = first <= maxVisited;
              const fill = i < gi ? 100 : i === gi ? Math.round(((pos + 1) / g.steps.length) * 100) : 0;
              return (
                <button
                  key={g.label}
                  type="button"
                  aria-label={`Go to ${g.label}`}
                  aria-current={i === gi ? "step" : undefined}
                  disabled={!reachable}
                  onClick={() => reachable && i !== gi && onNavigate(first)}
                  className="flex h-5 flex-1 items-center"
                >
                  <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <span className={cn("absolute inset-y-0 left-0 rounded-full transition-all", i < gi ? "bg-emerald-400" : "bg-rose-500")} style={{ width: `${fill}%` }} />
                  </span>
                </button>
              );
            })
          : steps.map((s, i) => {
              const reachable = i <= maxVisited;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to step ${i + 1}: ${s.label}`}
                  aria-current={i === current ? "step" : undefined}
                  disabled={!reachable}
                  onClick={() => reachable && onNavigate(i)}
                  className="flex h-5 flex-1 items-center"
                >
                  <span className={cn("h-1.5 w-full rounded-full transition", i < current ? "bg-emerald-400" : i === current ? "bg-slate-900 dark:bg-white" : reachable ? "bg-slate-300" : "bg-slate-200 dark:bg-slate-800")} />
                </button>
              );
            })}
      </div>
    </div>
  );
}
