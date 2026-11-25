"use client";

import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import React from "react";
import { Compass, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { useDeleteArchitectProjectMutation, useSaveArchitectProjectMutation } from "@/features/architect/api";
import { BHK_OPTIONS, BUILDING_TYPE_OPTIONS, FACING_OPTIONS, FLOOR_OPTIONS, PLOT_PRESETS, label, plotLabel } from "@/features/architect/options";
import type { ArchitectProject, Bhk, BuildingType, Facing, Floors } from "@/features/architect/types";
import { Field, PhotoUploader, inputCls, primaryBtn, secondaryBtn, textareaCls, toInt } from "./ui";

type Draft = Partial<ArchitectProject> & { title: string; images: string[] };
const empty = (city: string): Draft => ({ title: "", city, images: [], isFeatured: false, vastu: false });

/** One design in the portfolio. Plot size + facing is how people search ("30×40 east facing"). */
function ProjectEditor({ initial, profileId, onClose }: { initial: Draft; profileId: number; onClose: () => void }) {
  const [p, setP] = React.useState<Draft>(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [save, { isLoading }] = useSaveArchitectProjectMutation();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setP((x) => ({ ...x, [k]: v }));

  const submit = async () => {
    if (p.title.trim().length < 3) return setError("Add a short title, e.g. '30×40 east facing G+1 house'");
    if (!p.images.length) return setError("Add at least one image of the plan or elevation");
    try {
      const { id, title, city, locality, buildingType, plotWidthFt, plotDepthFt, builtUpSqft, facing, floors, bhk, vastu, completedOn, images, description, isFeatured } = p;
      const plotSizeSqft = plotWidthFt && plotDepthFt ? plotWidthFt * plotDepthFt : p.plotSizeSqft ?? null;
      await save({ id, profileId, title: title.trim(), city, locality, buildingType, plotWidthFt, plotDepthFt, plotSizeSqft, builtUpSqft, facing, floors, bhk, vastu: !!vastu, completedOn: completedOn || null, images, coverImage: images[0], description, isFeatured }).unwrap();
      toast.success(p.id ? "Design updated" : "Design added");
      onClose();
    } catch (err) {
      setError((err as { data?: { message?: string } })?.data?.message || "Couldn't save the design. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Design details">
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.id ? "Edit design" : "Add a design"}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Plan & elevation images" required hint="The first image is the cover. Add the 2D plan and the 3D elevation.">
            <PhotoUploader value={p.images} onChange={(v) => set("images", v)} entityId={profileId} folder="projects" max={20} />
          </Field>
          <Field label="Title" required htmlFor="pj-title">
            <input id="pj-title" className={inputCls} maxLength={140} placeholder="e.g. 30×40 east facing G+1 house" value={p.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Plot size (feet)" hint="Width × depth. Tap a common size or type your own.">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {PLOT_PRESETS.map(([w, d]) => {
                  const on = p.plotWidthFt === w && p.plotDepthFt === d;
                  return (
                    <button
                      key={`${w}x${d}`}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setP((x) => ({ ...x, plotWidthFt: w, plotDepthFt: d }))}
                      className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition", on ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:text-slate-200")}
                    >
                      {w}×{d}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input aria-label="Plot width in feet" inputMode="numeric" className={inputCls} placeholder="Width" value={p.plotWidthFt ?? ""} onChange={(e) => set("plotWidthFt", toInt(e.target.value))} />
                <span className="text-slate-400">×</span>
                <input aria-label="Plot depth in feet" inputMode="numeric" className={inputCls} placeholder="Depth" value={p.plotDepthFt ?? ""} onChange={(e) => set("plotDepthFt", toInt(e.target.value))} />
              </div>
              {p.plotWidthFt && p.plotDepthFt ? <p className="text-xs text-slate-500">{(p.plotWidthFt * p.plotDepthFt).toLocaleString("en-IN")} sq.ft plot</p> : null}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Facing" htmlFor="pj-facing">
              <SearchableSelect id="pj-facing" value={p.facing ?? ""} onChange={(v) => set("facing", (v || null) as Facing | null)} options={FACING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Building type" htmlFor="pj-type">
              <SearchableSelect id="pj-type" value={p.buildingType ?? ""} onChange={(v) => set("buildingType", (v || null) as BuildingType | null)} options={BUILDING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Floors" htmlFor="pj-floors">
              <SearchableSelect id="pj-floors" value={p.floors ?? ""} onChange={(v) => set("floors", (v || null) as Floors | null)} options={FLOOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="BHK" htmlFor="pj-bhk">
              <SearchableSelect id="pj-bhk" value={p.bhk ?? ""} onChange={(v) => set("bhk", (v || null) as Bhk | null)} options={BHK_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Built-up area (sq.ft)" htmlFor="pj-bua">
              <input id="pj-bua" inputMode="numeric" className={inputCls} value={p.builtUpSqft ?? ""} onChange={(e) => set("builtUpSqft", toInt(e.target.value))} />
            </Field>
            <Field label="City" htmlFor="pj-city">
              <input id="pj-city" className={inputCls} maxLength={80} value={p.city ?? ""} onChange={(e) => set("city", e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-rose-600" checked={!!p.vastu} onChange={(e) => set("vastu", e.target.checked)} /> Vastu-compliant design
          </label>
          <Field label="About this design" htmlFor="pj-desc">
            <textarea id="pj-desc" rows={3} maxLength={3000} className={textareaCls} value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-rose-600" checked={!!p.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Show this design first
          </label>
          {error && <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>}
        </div>
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-slate-800">
          <button type="button" className={cn(secondaryBtn, "flex-1 sm:flex-none")} onClick={onClose}>Cancel</button>
          <button type="button" className={cn(primaryBtn, "flex-1 sm:ml-auto sm:flex-none")} disabled={isLoading} onClick={() => void submit()}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save design
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPanel({ projects, profileId, city }: { projects: ArchitectProject[]; profileId: number; city: string }) {
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [remove, { isLoading: removing }] = useDeleteArchitectProjectMutation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Design portfolio</h2>
          <p className="text-sm text-slate-500">Plans and elevations you&apos;ve made, with plot size and facing. People search exactly this way.</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => setEditing(empty(city))}>
          <Plus className="h-4 w-4" /> Add design
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No designs yet</p>
          <p className="mt-1 text-sm text-slate-500">Add 3–5 plans, e.g. &ldquo;30×40 east facing G+1&rdquo;. Profiles with designs get many more enquiries.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((pj) => (
            <li key={pj.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                {pj.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pj.coverImage} alt={pj.title} className="h-full w-full object-cover" loading="lazy" />
                )}
                {pj.vastu && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <Compass className="h-3 w-3" /> Vastu
                  </span>
                )}
                {pj.isFeatured && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                    <Star className="h-3 w-3" /> First
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{pj.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {[plotLabel(pj.plotWidthFt, pj.plotDepthFt, pj.plotSizeSqft), label(FACING_OPTIONS, pj.facing), label(FLOOR_OPTIONS, pj.floors), label(BHK_OPTIONS, pj.bhk)].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600" onClick={() => setEditing({ ...pj })}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={removing}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
                    onClick={() => {
                      if (window.confirm(`Delete “${pj.title}”?`)) void remove(pj.id).unwrap().then(() => toast.success("Design deleted")).catch(() => toast.error("Couldn't delete"));
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <ProjectEditor initial={editing} profileId={profileId} onClose={() => setEditing(null)} />}
    </div>
  );
}
