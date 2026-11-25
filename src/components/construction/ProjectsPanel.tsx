"use client";

import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import React from "react";
import { Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { useDeleteConstructionProjectMutation, useSaveConstructionProjectMutation } from "@/features/construction/api";
import { BUILDING_TYPE_OPTIONS, FLOOR_OPTIONS, PROJECT_STATUS_OPTIONS, SECTOR_OPTIONS, formatCr, label } from "@/features/construction/options";
import type { BuildingType, ConstructionProject, Floors, InfraSector, ProjectStatus } from "@/features/construction/types";
import { Field, PhotoUploader, inputCls, primaryBtn, secondaryBtn, textareaCls, toInt } from "./ui";

type Draft = Partial<ConstructionProject> & { title: string; images: string[] };
const empty = (city: string): Draft => ({ title: "", city, images: [], isFeatured: false });

function ProjectEditor({ initial, profileId, infra, onClose }: { initial: Draft; profileId: number; infra: boolean; onClose: () => void }) {
  const [p, setP] = React.useState<Draft>(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [save, { isLoading }] = useSaveConstructionProjectMutation();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setP((x) => ({ ...x, [k]: v }));

  const submit = async () => {
    if (p.title.trim().length < 3) return setError(infra ? "Add a short title, e.g. '4-lane road, NH-31 (12 km)'" : "Add a short title, e.g. 'G+1 house in Kankarbagh'");
    if (!p.images.length) return setError("Add at least one photo");
    try {
      const { id, title, city, locality, buildingType, plotSizeSqft, builtUpSqft, floors, packageName, costLakhs, durationMonths, completedOn, images, description, isFeatured, sector, clientAuthority, contractValueCr, projectStatus } = p;
      await save({ id, profileId, title: title.trim(), city, locality, buildingType, plotSizeSqft, builtUpSqft, floors, packageName, costLakhs, durationMonths, completedOn: completedOn || null, images, coverImage: images[0], description, isFeatured, sector, clientAuthority, contractValueCr, projectStatus }).unwrap();
      toast.success(p.id ? "Project updated" : "Project added");
      onClose();
    } catch (err) {
      setError((err as { data?: { message?: string } })?.data?.message || "Couldn't save the project. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Project details">
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.id ? "Edit project" : infra ? "Add a project" : "Add a completed project"}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Photos" required hint="The first photo is the cover.">
            <PhotoUploader value={p.images} onChange={(v) => set("images", v)} entityId={profileId} folder="projects" max={20} />
          </Field>
          <Field label="Title" required htmlFor="pj-title">
            <input id="pj-title" className={inputCls} maxLength={140} placeholder={infra ? "e.g. 4-lane road on NH-31, 12 km" : "e.g. G+1 house in Kankarbagh, Patna"} value={p.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          {infra ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sector" htmlFor="pj-sector">
              <SearchableSelect id="pj-sector" value={p.sector ?? ""} onChange={(v) => set("sector", (v || null) as InfraSector | null)} options={SECTOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Status" htmlFor="pj-status">
              <SearchableSelect id="pj-status" value={p.projectStatus ?? ""} onChange={(v) => set("projectStatus", (v || null) as ProjectStatus | null)} options={PROJECT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Client / department" htmlFor="pj-client">
              <input id="pj-client" className={inputCls} maxLength={120} placeholder="e.g. NHAI, Bihar PWD" value={p.clientAuthority ?? ""} onChange={(e) => set("clientAuthority", e.target.value)} />
            </Field>
            <Field label="Contract value (₹ crore)" htmlFor="pj-cv">
              <input id="pj-cv" inputMode="decimal" className={inputCls} placeholder="e.g. 42.5" value={p.contractValueCr ?? ""} onChange={(e) => set("contractValueCr", e.target.value ? Number(e.target.value.replace(/[^\d.]/g, "")) || null : null)} />
            </Field>
            <Field label="City / district" htmlFor="pj-city">
              <input id="pj-city" className={inputCls} maxLength={80} value={p.city ?? ""} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="Duration (months)" htmlFor="pj-dur">
              <input id="pj-dur" inputMode="numeric" className={inputCls} value={p.durationMonths ?? ""} onChange={(e) => set("durationMonths", toInt(e.target.value))} />
            </Field>
            <Field label="Completed / expected (month)" htmlFor="pj-done">
              <input id="pj-done" type="month" className={inputCls} value={p.completedOn ?? ""} onChange={(e) => set("completedOn", e.target.value)} />
            </Field>
          </div>
          ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Building type" htmlFor="pj-type">
              <SearchableSelect id="pj-type" value={p.buildingType ?? ""} onChange={(v) => set("buildingType", (v || null) as BuildingType | null)} options={BUILDING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Floors" htmlFor="pj-floors">
              <SearchableSelect id="pj-floors" value={p.floors ?? ""} onChange={(v) => set("floors", (v || null) as Floors | null)} options={FLOOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Select" />
            </Field>
            <Field label="Plot size (sq.ft)" htmlFor="pj-plot">
              <input id="pj-plot" inputMode="numeric" className={inputCls} value={p.plotSizeSqft ?? ""} onChange={(e) => set("plotSizeSqft", toInt(e.target.value))} />
            </Field>
            <Field label="Built-up area (sq.ft)" htmlFor="pj-bua">
              <input id="pj-bua" inputMode="numeric" className={inputCls} value={p.builtUpSqft ?? ""} onChange={(e) => set("builtUpSqft", toInt(e.target.value))} />
            </Field>
            <Field label="City" htmlFor="pj-city">
              <input id="pj-city" className={inputCls} maxLength={80} value={p.city ?? ""} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="Locality" htmlFor="pj-loc">
              <input id="pj-loc" className={inputCls} maxLength={120} value={p.locality ?? ""} onChange={(e) => set("locality", e.target.value)} />
            </Field>
            <Field label="Approx. cost (₹ lakh)" htmlFor="pj-cost">
              <input id="pj-cost" inputMode="decimal" className={inputCls} placeholder="e.g. 35" value={p.costLakhs ?? ""} onChange={(e) => set("costLakhs", e.target.value ? Number(e.target.value.replace(/[^\d.]/g, "")) || null : null)} />
            </Field>
            <Field label="Time taken (months)" htmlFor="pj-dur">
              <input id="pj-dur" inputMode="numeric" className={inputCls} value={p.durationMonths ?? ""} onChange={(e) => set("durationMonths", toInt(e.target.value))} />
            </Field>
          </div>
          )}
          <Field label="About this project" htmlFor="pj-desc">
            <textarea id="pj-desc" rows={3} maxLength={3000} className={textareaCls} value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-rose-600" checked={!!p.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Show this project first
          </label>
          {error && <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>}
        </div>
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-slate-800">
          <button type="button" className={cn(secondaryBtn, "flex-1 sm:flex-none")} onClick={onClose}>Cancel</button>
          <button type="button" className={cn(primaryBtn, "flex-1 sm:ml-auto sm:flex-none")} disabled={isLoading} onClick={() => void submit()}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save project
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPanel({ projects, profileId, city, infra = false }: { projects: ConstructionProject[]; profileId: number; city: string; infra?: boolean }) {
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [remove, { isLoading: removing }] = useDeleteConstructionProjectMutation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{infra ? "Projects" : "Completed projects"}</h2>
          <p className="text-sm text-slate-500">{infra ? "Completed and ongoing works with client and contract value. They appear on your public profile." : <>Real homes you&apos;ve built. They build trust and appear on your public profile.</>}</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => setEditing(empty(city))}>
          <Plus className="h-4 w-4" /> Add project
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No projects yet</p>
          <p className="mt-1 text-sm text-slate-500">{infra ? "Add your key works: road length, hospital beds, contract value. Profiles with projects get far more enquiries." : "Add 2–3 finished homes with photos. Profiles with projects get many more enquiries."}</p>
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
                {pj.isFeatured && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                    <Star className="h-3 w-3" /> First
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{pj.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {(infra ? [pj.projectStatus === "ONGOING" ? "Ongoing" : "", pj.clientAuthority, formatCr(pj.contractValueCr), pj.city] : [label(FLOOR_OPTIONS, pj.floors), pj.builtUpSqft ? `${pj.builtUpSqft.toLocaleString("en-IN")} sq.ft` : "", pj.city]).filter(Boolean).join(" · ")}
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
                      if (window.confirm(`Delete “${pj.title}”?`)) void remove(pj.id).unwrap().then(() => toast.success("Project deleted")).catch(() => toast.error("Couldn't delete"));
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
      {editing && <ProjectEditor initial={editing} profileId={profileId} infra={infra} onClose={() => setEditing(null)} />}
    </div>
  );
}
