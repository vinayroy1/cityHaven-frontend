"use client";

import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues, WarrantyCategory, WarrantyRow } from "@/types/interior.types";
import { WARRANTY_CATEGORIES } from "@/features/interiors/wizard/options";
import { cn } from "@/lib/utils";
import { Chip, Stepper, getAt, ghostIconBtn, inputCls, newId, propPath, setPath } from "./ui";

const catLabel = (c: WarrantyCategory) => WARRANTY_CATEGORIES.find((w) => w.value === c)?.label ?? c;

/** "10 yrs woodwork · 1 yr hardware" — how visitors see it. */
export function warrantySummary(rows: WarrantyRow[]) {
  return rows
    .filter((r) => (r.years ?? 0) > 0 || (r.months ?? 0) > 0)
    .sort((a, b) => (b.years ?? 0) - (a.years ?? 0))
    .map((r) => `${r.years ? `${r.years} yr${r.years > 1 ? "s" : ""}` : `${r.months} mo`} ${catLabel(r.category).toLowerCase()}`)
    .join(" · ");
}

export default function WarrantyMatrix({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "warranty.warranties");
  const rows = getAt<WarrantyRow[]>(values, path) ?? [];
  const write = (next: WarrantyRow[]) => setPath(form, path, next);
  const update = (id: string, p: Partial<WarrantyRow>) => write(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const unused = WARRANTY_CATEGORIES.filter((c) => !rows.some((r) => r.category === c.value));
  const summary = warrantySummary(rows);

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {rows.map((r) => {
          const needsScope = (r.years ?? 0) > 0 && !(r.coverage ?? "").trim();
          return (
            <li key={r.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">{catLabel(r.category)}</p>
                <div className="flex items-center gap-2">
                  <Stepper label={`${catLabel(r.category)} warranty years`} value={r.years} max={25} suffix={r.years === 1 ? "yr" : "yrs"} onChange={(v) => update(r.id, { years: v })} />
                  {!r.id.startsWith("seed-") && (
                    <button type="button" aria-label={`Remove ${catLabel(r.category)}`} className={ghostIconBtn} onClick={() => write(rows.filter((x) => x.id !== r.id))}>
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
              {(r.years ?? 0) > 0 && (
                <div>
                  <input
                    aria-label={`${catLabel(r.category)} scope`}
                    aria-invalid={needsScope}
                    className={cn(inputCls, needsScope && "border-amber-400")}
                    placeholder="What exactly is covered? e.g. Carcass & shutters against manufacturing defects, termites"
                    maxLength={200}
                    value={r.coverage ?? ""}
                    onChange={(e) => update(r.id, { coverage: e.target.value })}
                  />
                  {needsScope && <p className="mt-1 text-xs text-amber-700">Add a scope note — vague warranties put clients off.</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unused.map((c) => (
            <Chip key={c.value} onClick={() => write([...rows, { id: newId("warranty"), category: c.value, years: null, coverage: "" }])}>
              <Plus className="size-3.5" /> {c.label}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" aria-live="polite">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-semibold">Visitors will see: </span>
          {summary || "No warranty yet — set years on at least woodwork."}
        </p>
      </div>
    </div>
  );
}
