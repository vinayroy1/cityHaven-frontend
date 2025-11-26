import React from "react";
import type { LucideIcon } from "lucide-react";

export type QuickFact = { label: string; value: string; hint: string; icon: LucideIcon };

type QuickFactsGridProps = { items: QuickFact[] };

export function QuickFactsGrid({ items }: QuickFactsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon }) => (
        <div key={label} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-base font-semibold">{value}</p>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
