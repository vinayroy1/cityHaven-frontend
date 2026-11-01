"use client";

import { useState } from "react";
import { BrandChipGroups } from "./BrandChipGroups";
import { ChevronDown, Layers, Plus, Trash2, Zap } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues, MaterialCategory, MaterialSpecRow } from "@/types/interior.types";
import { MATERIAL_CATEGORIES, MATERIAL_QUICK_ADD } from "@/features/interiors/wizard/options";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { cn } from "@/lib/utils";
import { Field, StatusBadge, getAt, ghostIconBtn, inputCls, newId, propPath, setPath, toNum } from "./ui";

const PUBLISH_REQUIRED: MaterialCategory[] = ["BOARD", "HARDWARE"];

export const emptySpecRow = (category: MaterialCategory): MaterialSpecRow => ({
  id: newId("spec"),
  category,
  material: "",
  brand: "",
  grade: "",
  thicknessMm: null,
  finish: "",
  isCustom: false,
  notes: "",
});

export const specLabel = (r: Pick<MaterialSpecRow, "material" | "brand">) => [r.material, r.brand].filter(Boolean).join(" · ");

function SpecRowsEditor({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "materials.materialSpecs");
  const rows = getAt<MaterialSpecRow[]>(values, path) ?? [];
  const [open, setOpen] = useState<Set<MaterialCategory>>(() => new Set(PUBLISH_REQUIRED));

  const write = (next: MaterialSpecRow[]) => setPath(form, path, next);
  const update = (id: string, p: Partial<MaterialSpecRow>) => write(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const add = (category: MaterialCategory, p: Partial<MaterialSpecRow> = {}) => {
    write([...rows, { ...emptySpecRow(category), ...p }]);
    setOpen((s) => new Set(s).add(category));
  };
  const quickAdded = (q: (typeof MATERIAL_QUICK_ADD)[number]) =>
    rows.some((r) => r.category === q.category && r.material === q.material && r.brand === q.brand);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
          <Zap className="size-4 text-amber-500" /> Quick add what you use most
        </p>
        <p className="mb-3 text-xs text-slate-500">One tap adds a row. You can fine-tune grade and thickness below.</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_QUICK_ADD.map((q) => {
            const on = quickAdded(q);
            return (
              <button
                key={`${q.material}-${q.brand}`}
                type="button"
                disabled={on}
                onClick={() => add(q.category, { material: q.material, brand: q.brand })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  on ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white hover:border-slate-500 dark:border-slate-700 dark:bg-slate-950",
                )}
              >
                {on ? "✓ " : "+ "}
                {q.material} · {q.brand}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {MATERIAL_CATEGORIES.map((cat) => {
          const catRows = rows.filter((r) => r.category === cat.value);
          const isOpen = open.has(cat.value);
          const needed = PUBLISH_REQUIRED.includes(cat.value);
          return (
            <section key={cat.value} className="bg-white dark:bg-slate-950">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen((s) => {
                    const n = new Set(s);
                    if (n.has(cat.value)) n.delete(cat.value);
                    else n.add(cat.value);
                    return n;
                  })
                }
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{cat.label}</span>
                  {catRows.length > 0 ? (
                    <StatusBadge tone="green">{catRows.length} added</StatusBadge>
                  ) : needed ? (
                    <StatusBadge tone="amber">Needed to publish</StatusBadge>
                  ) : null}
                </span>
                <ChevronDown className={cn("size-4 shrink-0 transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="space-y-3 px-4 pb-4">
                  {catRows.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Nothing yet. Tell clients which {cat.label.toLowerCase()} you work with — it builds trust and fills your packages.
                    </p>
                  )}
                  {catRows.map((r) => (
                    <SpecRowEditor key={r.id} row={r} materials={cat.materials} brands={cat.brands} onChange={(p) => update(r.id, p)} onRemove={() => write(rows.filter((x) => x.id !== r.id))} />
                  ))}
                  <button
                    type="button"
                    onClick={() => add(cat.value)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 underline-offset-4 hover:underline dark:text-slate-200"
                  >
                    <Plus className="size-4" /> Add {cat.label.toLowerCase()}
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>
      {rows.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Layers className="size-3.5" /> These specs pre-fill your Essential / Premium / Luxury packages in the next step.
        </p>
      )}
    </div>
  );
}

function SpecRowEditor({
  row,
  materials,
  brands,
  onChange,
  onRemove,
}: {
  row: MaterialSpecRow;
  materials: readonly string[];
  brands: readonly string[];
  onChange: (p: Partial<MaterialSpecRow>) => void;
  onRemove: () => void;
}) {
  const [more, setMore] = useState(!!(row.grade || row.thicknessMm || row.finish || row.notes));
  const isBoard = row.category === "BOARD" || row.category === "COUNTERTOP";
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Material">
          {() =>
            materials.length ? (
              <SearchableSelect
                value={row.material}
                options={[...materials]}
                placeholder="Choose or type"
                allowCustom
                customLabel="+ Use custom material"
                onChange={(v) => onChange({ material: v, isCustom: !materials.includes(v) })}
                onCustomSelect={(v) => onChange({ material: v, isCustom: true })}
              />
            ) : (
              <input className={inputCls} value={row.material} placeholder="e.g. LED profile lights" onChange={(e) => onChange({ material: e.target.value, isCustom: true })} />
            )
          }
        </Field>
        <Field label="Brand">
          {() =>
            brands.length ? (
              <SearchableSelect
                value={row.brand ?? ""}
                options={[...brands]}
                placeholder="Choose or type"
                allowCustom
                customLabel="+ Use custom brand"
                onChange={(v) => onChange({ brand: v })}
                onCustomSelect={(v) => onChange({ brand: v, isCustom: true })}
              />
            ) : (
              <input className={inputCls} value={row.brand ?? ""} placeholder="Brand (optional)" onChange={(e) => onChange({ brand: e.target.value })} />
            )
          }
        </Field>
        <div className="flex items-end justify-end gap-1">
          <button type="button" className="h-11 px-2 text-xs font-medium text-slate-600 underline underline-offset-2" onClick={() => setMore((m) => !m)}>
            {more ? "Less" : "Details"}
          </button>
          <button type="button" aria-label="Remove row" className={ghostIconBtn} onClick={onRemove}>
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {more && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Grade">
            {(id) => <input id={id} className={inputCls} value={row.grade ?? ""} placeholder={isBoard ? "e.g. BWP / IS 710" : "e.g. Soft-close"} onChange={(e) => onChange({ grade: e.target.value })} />}
          </Field>
          {isBoard && (
            <Field label="Thickness (mm)">
              {(id) => (
                <input id={id} inputMode="decimal" className={inputCls} value={row.thicknessMm ?? ""} placeholder="e.g. 18" onChange={(e) => onChange({ thicknessMm: toNum(e.target.value) })} />
              )}
            </Field>
          )}
          <Field label="Finish">
            {(id) => <input id={id} className={inputCls} value={row.finish ?? ""} placeholder="e.g. Matte" onChange={(e) => onChange({ finish: e.target.value })} />}
          </Field>
          <Field label="Notes" className="sm:col-span-3">
            {(id) => <input id={id} className={inputCls} value={row.notes ?? ""} onChange={(e) => onChange({ notes: e.target.value })} />}
          </Field>
        </div>
      )}
    </div>
  );
}

/** Materials step: brand-chip groups first, detailed spec rows behind "Add specs". */
export default function MaterialSpecTable(p: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(p.props, "field", "materials.materialSpecs");
  const rows = getAt<MaterialSpecRow[]>(p.values, path) ?? [];
  const [showSpecs, setShowSpecs] = useState(() => rows.some((r) => r.material || r.grade || r.thicknessMm));
  return (
    <div className="space-y-5">
      <BrandChipGroups rows={rows} onChange={(next) => setPath(p.form, path, next)} />
      {showSpecs ? (
        <SpecRowsEditor {...p} />
      ) : (
        <button type="button" onClick={() => setShowSpecs(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 underline underline-offset-4 dark:text-slate-200">
          <Plus className="size-4" /> Add specs (grade, thickness, finish) — optional
        </button>
      )}
    </div>
  );
}
