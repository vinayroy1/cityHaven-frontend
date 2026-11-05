"use client";

import { useState } from "react";
import { Copy, Crown, Gem, Loader2, Lock, Pencil, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorPackageDraft, InteriorWizardValues, MaterialSpecRow } from "@/types/interior.types";
import { useDeleteInteriorPackageMutation, useGetMyInteriorProfileQuery, useSaveInteriorPackageMutation } from "@/features/interiors/api";
import { packageDraftToPayload } from "@/features/interiors/wizard/mapper";
import { cn } from "@/lib/utils";
import {
  BHKS,
  BOARD_GRADES,
  FINISHES,
  FURNISHING_LEVELS,
  HARDWARE_BRANDS,
  TIER_NAMES,
  fromTable,
  isPresetTier,
  missingRows,
  newPackage,
  toTable,
  type TableModel,
} from "./packageModel";
import {
  Chip,
  EditorPanel,
  Field,
  StatusBadge,
  Stepper,
  TagInput,
  apiErrorMessage,
  formatINR,
  getAt,
  ghostIconBtn,
  inputCls,
  primaryBtn,
  propPath,
  secondaryBtn,
  setPath,
  toNum,
} from "./ui";
import { getCountry } from "@/config/countries";

const TIER_ICON = { Essential: Sparkles, Premium: Gem, Luxury: Crown } as Record<string, typeof Sparkles>;
const TIER_BLURB: Record<string, string> = {
  Essential: "Value-for-money: HMR board, laminate, basic fittings.",
  Premium: "Most popular: BWR board, acrylic, soft-close hardware.",
  Luxury: "Top-end: BWP board, PU finish, premium imported hardware.",
};

function priceSummary(t: TableModel, cc?: string | null) {
  if (t.perSqft != null) return `${formatINR(t.perSqft, cc)}/sq.ft`;
  const b = BHKS.find((x) => t.fromBhk[x] != null);
  return b ? `${b} from ${formatINR(t.fromBhk[b], cc)}` : "On request";
}

export default function PackageManager({ values, form, props, mode }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "pricing.packages");
  const specsPath = propPath(props, "materialSpecsField", "materials.materialSpecs");
  const packages = getAt<InteriorPackageDraft[]>(values, path) ?? [];
  const quoteOnly = values.pricing?.priceMode === "QUOTE_ONLY";
  const { data: profile } = useGetMyInteriorProfileQuery();
  const [savePkg, { isLoading: saving }] = useSaveInteriorPackageMutation();
  const [deletePkg] = useDeleteInteriorPackageMutation();
  const [editing, setEditing] = useState<InteriorPackageDraft | null>(null);

  const write = (next: InteriorPackageDraft[]) => setPath(form, path, next.map((p, i) => ({ ...p, orderIndex: i })));
  const updatedAt = (p: InteriorPackageDraft) => {
    const s = profile?.packages?.find((x) => x.id === p.serverId) as { updatedAt?: string } | undefined;
    return s?.updatedAt ? new Date(s.updatedAt) : null;
  };

  const hints = () => {
    const specs = getAt<MaterialSpecRow[]>(values, specsPath) ?? [];
    return { hardware: specs.find((s) => s.category === "HARDWARE" && s.brand)?.brand?.replace(/\s*\(.*\)$/, "") };
  };

  const persist = async (draft: InteriorPackageDraft) => {
    const exists = packages.some((p) => p.id === draft.id);
    const local = exists ? packages.map((p) => (p.id === draft.id ? draft : p)) : [...packages, draft];
    write(local);
    try {
      const saved = await savePkg({ id: draft.serverId ?? undefined, data: packageDraftToPayload(draft) }).unwrap();
      write(local.map((p) => (p.id === draft.id ? { ...p, serverId: saved.id } : p)));
      toast.success(`${draft.packageName} saved`);
      return true;
    } catch (e) {
      toast.error(apiErrorMessage(e, "Saved on this device — we'll retry when you continue."));
      return false;
    }
  };

  const remove = async (p: InteriorPackageDraft) => {
    if (p.serverId) {
      try {
        await deletePkg(p.serverId).unwrap();
      } catch (e) {
        return toast.error(apiErrorMessage(e, "Could not delete package"));
      }
    }
    write(packages.filter((x) => x.id !== p.id));
  };

  const toggleActive = (p: InteriorPackageDraft) => void persist({ ...p, isActive: !p.isActive });

  const startTier = (name: string) => setEditing(newPackage(name, packages.length, hints()));
  const custom = packages.filter((p) => !isPresetTier(p.packageName));
  const active = packages.filter((p) => p.isActive);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TIER_NAMES.map((name) => {
          const pkg = packages.find((p) => p.packageName === name);
          const Icon = TIER_ICON[name] ?? Sparkles;
          const t = pkg ? toTable(pkg) : null;
          const miss = t ? missingRows(t, quoteOnly) : [];
          return (
            <div
              key={name}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border-2 p-4 transition",
                pkg?.isActive ? "border-slate-900 bg-white shadow-sm dark:border-white dark:bg-slate-900" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Icon className="size-5" />
                </span>
                {pkg && (
                  <StatusBadge tone={!pkg.isActive ? "slate" : miss.length ? "amber" : "green"}>
                    {!pkg.isActive ? "Off" : miss.length ? `${miss.length} to fill` : "Ready"}
                  </StatusBadge>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
                <p className="text-xs text-slate-500">{pkg && t ? `${t.board || "—"} · ${t.finish || "—"} · ${priceSummary(t, values.location?.countryCode)}` : TIER_BLURB[name]}</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                {pkg ? (
                  <>
                    <button type="button" className={cn(secondaryBtn, "h-9 px-3")} onClick={() => setEditing(pkg)}>
                      <Pencil className="size-3.5" /> Edit
                    </button>
                    <button type="button" className={cn(secondaryBtn, "h-9 px-3")} onClick={() => toggleActive(pkg)}>
                      {pkg.isActive ? "Turn off" : "Turn on"}
                    </button>
                  </>
                ) : (
                  <button type="button" className={cn(primaryBtn, "h-9 px-3")} onClick={() => startTier(name)}>
                    <Wand2 className="size-3.5" /> Turn on
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-slate-300 p-4 dark:border-slate-700">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Plus className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Custom</p>
            <p className="text-xs text-slate-500">A kitchen-only, wardrobe or bespoke package with your own name.</p>
          </div>
          <button type="button" className={cn(secondaryBtn, "mt-auto h-9 px-3")} onClick={() => setEditing(newPackage("", packages.length))}>
            <Plus className="size-3.5" /> Add custom
          </button>
        </div>
      </div>

      {custom.length > 0 && (
        <ul className="space-y-2">
          {custom.map((p) => {
            const t = toTable(p);
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.packageName || "Untitled package"}</p>
                  <p className="text-xs text-slate-500">{p.packageCategory} · {priceSummary(t, values.location?.countryCode)}</p>
                </div>
                {!p.isActive && <StatusBadge tone="slate">Off</StatusBadge>}
                <button type="button" aria-label={`Edit ${p.packageName}`} className={ghostIconBtn} onClick={() => setEditing(p)}><Pencil className="size-4" /></button>
                <button type="button" aria-label={`Duplicate ${p.packageName}`} className={ghostIconBtn} onClick={() => setEditing({ ...p, id: newPackage("", 0).id, serverId: null, packageName: `${p.packageName} (copy)` })}><Copy className="size-4" /></button>
                <button type="button" aria-label={`Delete ${p.packageName}`} className={ghostIconBtn} onClick={() => remove(p)}><Trash2 className="size-4" /></button>
              </li>
            );
          })}
        </ul>
      )}

      {active.length > 0 && <ComparisonTable packages={active} updatedAt={updatedAt} countryCode={values.location?.countryCode} />}
      {mode === "wizard" && packages.length === 0 && (
        <p className="text-sm text-slate-500">Tip: turning on one tier is enough to go live. You can add the others later.</p>
      )}

      {editing && (
        <PackageEditor
          key={editing.id}
          countryCode={values.location?.countryCode}
          pkg={editing}
          quoteOnly={quoteOnly}
          saving={saving}
          lastUpdated={updatedAt(editing)}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            if (!p.packageName.trim()) return toast.error("Give the package a name");
            if (await persist(p)) setEditing(null);
          }}
          onDelete={packages.some((x) => x.id === editing.id) ? () => { void remove(editing); setEditing(null); } : undefined}
        />
      )}
    </div>
  );
}

function ComparisonTable({ packages, updatedAt, countryCode }: { packages: InteriorPackageDraft[]; updatedAt: (p: InteriorPackageDraft) => Date | null; countryCode?: string | null }) {
  const sym = getCountry(countryCode).currencySymbol;
  const cols = packages.map((p) => ({ p, t: toTable(p) }));
  const rows: [string, (t: TableModel) => string][] = [
    ["Core board", (t) => t.board],
    ["Finish", (t) => t.finish],
    ["Hardware", (t) => t.hardware],
    ["Paint", (t) => t.paint],
    ["Furnishings", (t) => t.furnishing],
    ["Warranty", (t) => (t.warrantyYears != null ? `${t.warrantyYears} yrs woodwork` : "")],
    [`${sym} per sq.ft`, (t) => (t.perSqft != null ? formatINR(t.perSqft, countryCode) : "")],
    ...BHKS.map((b) => [`${b} from`, (t: TableModel) => (t.fromBhk[b] != null ? formatINR(t.fromBhk[b], countryCode) : "")] as [string, (t: TableModel) => string]),
    ["Quote valid", (t) => (t.validityDays ? `${t.validityDays} days` : "")],
  ];
  const latest = cols.map((c) => updatedAt(c.p)).filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 dark:bg-slate-900">
        <p className="text-sm font-semibold">How clients will compare your packages</p>
        {latest && <p className="text-xs text-slate-500">Prices last updated {latest.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="w-32 px-4 py-2 text-left text-xs font-medium text-slate-500" scope="col"><span className="sr-only">Row</span></th>
              {cols.map(({ p }) => (
                <th key={p.id} scope="col" className="px-4 py-2 text-left font-semibold">{p.packageName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get]) => (
              <tr key={label} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <th scope="row" className="px-4 py-2 text-left text-xs font-medium text-slate-500">{label}</th>
                {cols.map(({ p, t }) => (
                  <td key={p.id} className="px-4 py-2 text-slate-800 dark:text-slate-200">{get(t) || <span className="text-slate-300">—</span>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackageEditor({
  pkg,
  quoteOnly,
  saving,
  lastUpdated,
  onClose,
  onSave,
  onDelete,
  countryCode,
}: {
  countryCode?: string | null;
  pkg: InteriorPackageDraft;
  quoteOnly: boolean;
  saving: boolean;
  lastUpdated: Date | null;
  onClose: () => void;
  onSave: (p: InteriorPackageDraft) => void;
  onDelete?: () => void;
}) {
  const sym = getCountry(countryCode).currencySymbol;
  const locked = isPresetTier(pkg.packageName);
  const [name, setName] = useState(pkg.packageName);
  const [category, setCategory] = useState(pkg.packageCategory || "Full Home");
  const [t, setT] = useState<TableModel>(() => toTable(pkg));
  const set = <K extends keyof TableModel>(k: K, v: TableModel[K]) => setT((x) => ({ ...x, [k]: v }));
  const miss = missingRows(t, quoteOnly);

  const choice = (label: string, opts: readonly string[], k: "board" | "finish" | "hardware" | "furnishing", allowOther = false) => (
    <Field label={label} required={k !== "furnishing"}>
      {() => (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {opts.map((o) => (
              <Chip key={o} active={t[k] === o} onClick={() => set(k, t[k] === o ? "" : o)}>{o}</Chip>
            ))}
          </div>
          {allowOther && (
            <input aria-label={`${label} (other)`} className={inputCls} placeholder="Other brand" value={opts.includes(t[k]) ? "" : t[k]} onChange={(e) => set(k, e.target.value)} />
          )}
        </div>
      )}
    </Field>
  );

  return (
    <EditorPanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={locked ? `${pkg.packageName} package` : pkg.packageName ? `Edit ${pkg.packageName}` : "Custom package"}
      description={lastUpdated ? `Prices last updated ${lastUpdated.toLocaleDateString("en-IN")}` : "Fill the table clients compare. Prices are “from” amounts."}
      footer={
        <>
          {onDelete && (
            <button type="button" className={cn(secondaryBtn, "mr-auto text-rose-600")} onClick={onDelete}>
              <Trash2 className="size-4" /> Delete
            </button>
          )}
          <button type="button" className={secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryBtn} disabled={saving} onClick={() => onSave({ ...fromTable(pkg, t), packageName: name.trim(), packageCategory: category })}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save package
          </button>
        </>
      }
    >
      {locked ? (
        <p className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900">
          <Lock className="size-4" /> Tier names are fixed so clients compare like for like.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Package name" required>
            {(id) => <input id={id} className={inputCls} value={name} maxLength={60} placeholder="e.g. Kitchen Pro" onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Covers">
            {(id) => (
              <select id={id} className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                {["Full Home", "Modular Kitchen", "Wardrobes", "Living Room", "Bedroom", "Renovation", "Commercial"].map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </Field>
        </div>
      )}

      {choice("Core board", BOARD_GRADES, "board")}
      {choice("Finish", FINISHES, "finish")}
      {choice("Hardware brand", HARDWARE_BRANDS, "hardware", true)}
      <Field label="Paint line" hint="e.g. Asian Paints Royale, Nippon Spotless">
        {(id) => <input id={id} className={inputCls} value={t.paint} onChange={(e) => set("paint", e.target.value)} />}
      </Field>
      {choice("Furnishings level", FURNISHING_LEVELS, "furnishing")}
      <Field label="Woodwork warranty" required>
        {() => <Stepper label="Warranty years" value={t.warrantyYears} onChange={(v) => set("warrantyYears", v)} max={25} suffix="yrs" />}
      </Field>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
        <p className="text-sm font-semibold">Price {quoteOnly && <span className="font-normal text-slate-500">(optional — you show quotes only)</span>}</p>
        <Field label={`${sym} per sq.ft`}>
          {(id) => <input id={id} inputMode="numeric" className={inputCls} placeholder="e.g. 1450" value={t.perSqft ?? ""} onChange={(e) => set("perSqft", toNum(e.target.value))} />}
        </Field>
        <div className="grid grid-cols-3 gap-2">
          {BHKS.map((b) => (
            <Field key={b} label={`${b} from ${sym}`}>
              {(id) => (
                <input id={id} inputMode="numeric" className={inputCls} placeholder="e.g. 450000" value={t.fromBhk[b] ?? ""} onChange={(e) => set("fromBhk", { ...t.fromBhk, [b]: toNum(e.target.value) })} />
              )}
            </Field>
          ))}
        </div>
        <Field label="Quote valid for" hint="Days your quoted price holds — avoids price-rise disputes.">
          {() => <Stepper label="Quote validity days" value={t.validityDays} onChange={(v) => set("validityDays", v)} max={180} step={5} start={30} suffix="days" />}
        </Field>
      </div>

      <Field label="What's included">
        {() => <TagInput label="Inclusions" value={t.inclusions} onChange={(v) => set("inclusions", v)} placeholder="e.g. Modular kitchen" suggestions={["Modular kitchen", "Wardrobes", "TV unit", "False ceiling", "Painting", "Electrical", "Design & 3D"]} />}
      </Field>
      <Field label="What's not included">
        {() => <TagInput label="Exclusions" value={t.exclusions} onChange={(v) => set("exclusions", v)} placeholder="e.g. Appliances" suggestions={["Appliances", "Loose furniture", "Civil work", "Decor & soft furnishings"]} />}
      </Field>

      {miss.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Still to fill before this package can go live: {miss.join(", ")}.
        </p>
      )}
    </EditorPanel>
  );
}
