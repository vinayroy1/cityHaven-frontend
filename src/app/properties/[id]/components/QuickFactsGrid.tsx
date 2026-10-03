import React from "react";
import type { LucideIcon } from "lucide-react";

export type QuickFact = { label: string; value: string; hint: string; icon: LucideIcon };

type QuickFactsGridProps = { items: QuickFact[] };

export function QuickFactsGrid({ items }: QuickFactsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-zinc-200 py-5 dark:border-slate-800 lg:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon }) => (
        <div key={label} className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 break-words">
            <p className="text-xs text-zinc-500 dark:text-slate-400">{label}</p>
            <p className="my-1 text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
