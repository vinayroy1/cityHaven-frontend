"use client";

import React from "react";
import { cn } from "@/components/ui/utils";

export function ScoreCard({ score, title = "Profile strength", hint }: { score: number; title?: string; hint?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const label = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 35 ? "Getting there" : "Just started";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{pct}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={title}>
        <div className={cn("h-full rounded-full transition-all", pct >= 80 ? "bg-emerald-500" : pct >= 45 ? "bg-slate-900 dark:bg-white" : "bg-rose-500")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint ?? `${label}. Complete profiles get more enquiries.`}</p>
    </div>
  );
}
