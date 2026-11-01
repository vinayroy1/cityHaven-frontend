"use client";

import React from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import type { RequiredFieldMeta } from "@/lib/listingEngine/validation";

/** Required items of the current step, each jumps to its field. */
export function MandatoryFieldsTracker({
  required,
  missing,
  onJump,
}: {
  required: RequiredFieldMeta[];
  missing: RequiredFieldMeta[];
  onJump: (path: string) => void;
}) {
  if (!required.length) return null;
  const missingIds = new Set(missing.map((m) => m.id));
  const done = required.length - missing.length;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Required on this step</p>
        <p className="text-xs font-semibold tabular-nums text-slate-500">
          {done}/{required.length}
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {required.map((r) => {
          const ok = !missingIds.has(r.id);
          return (
            <li key={r.id}>
              <button type="button" onClick={() => onJump(r.id)} className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <CircleDashed className="h-4 w-4 shrink-0 text-slate-400" />}
                <span className={ok ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 dark:text-slate-200"}>{r.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
