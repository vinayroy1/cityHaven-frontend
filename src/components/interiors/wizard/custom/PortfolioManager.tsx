"use client";

import { useRef, useState } from "react";
import { Crop, ImagePlus, Images, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorProjectDraft, InteriorWizardValues, MaterialSpecRow, RoomType } from "@/types/interior.types";
import { useDeletePortfolioProjectMutation, useGetMyInteriorProfileQuery, useSavePortfolioProjectMutation } from "@/features/interiors/api";
import { projectDraftToPayload, projectImageCount } from "@/features/interiors/wizard/mapper";
import { BHK_OPTIONS, DESIGN_STYLE_OPTIONS, PROPERTY_TYPE_OPTIONS, ROOM_TYPES, SERVICE_OPTIONS } from "@/features/interiors/wizard/options";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { cn } from "@/lib/utils";
import {
  Chip,
  ChipGroup,
  EditorPanel,
  EmptyState,
  Field,
  ImagesUpload,
  StatusBadge,
  apiErrorMessage,
  getAt,
  ghostIconBtn,
  inputCls,
  newId,
  primaryBtn,
  propPath,
  secondaryBtn,
  setPath,
  textareaCls,
  toNum,
  useUploader,
  strOpts,
} from "./ui";

export const BUDGET_BANDS = ["Under ₹5L", "₹5–10L", "₹10–20L", "₹20–40L", "₹40L+"];
const MIN_COVER_WIDTH = 1200;

const emptyProject = (city: string): InteriorProjectDraft => ({
  id: newId("proj"),
  serverId: null,
  title: "",
  propertyType: "",
  bhk: "",
  areaSqft: null,
  city,
  locality: "",
  branchId: null,
  budgetRange: "",
  durationDays: null,
  completionDate: "",
  designStyle: "",
  coverImage: "",
  roomGalleries: [],
  beforeImages: [],
  afterImages: [],
  materialsUsed: [],
  servicesPerformed: [],
  description: "",
  isFeatured: false,
});

/** Required tags (competitor-flow §1): cover, title, room/BHK, city, budget band (+ style). */
export function projectMissing(p: InteriorProjectDraft): string[] {
  const m: string[] = [];
  if (!p.coverImage) m.push("Cover photo");
  if (!p.title.trim()) m.push("Title");
  if (!p.bhk && !p.roomGalleries.length) m.push("BHK or room");
  if (!p.city) m.push("City");
  if (!p.designStyle) m.push("Style");
  if (!p.budgetRange) m.push("Budget band");
  return m;
}

export const projectCaption = (p: InteriorProjectDraft) => [p.bhk, p.city, p.designStyle].filter(Boolean).join(" · ");

type Status = { label: string; tone: "slate" | "amber" | "green" };

export default function PortfolioManager({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "portfolio.projects");
  const specsPath = propPath(props, "materialSpecsField", "materials.materialSpecs");
  const minImages = typeof props?.minImages === "number" ? props.minImages : 3;
  const projects = getAt<InteriorProjectDraft[]>(values, path) ?? [];
  const { data: profile } = useGetMyInteriorProfileQuery();
  const [saveProject, { isLoading: saving }] = useSavePortfolioProjectMutation();
  const [deleteProject] = useDeletePortfolioProjectMutation();
  const [editing, setEditing] = useState<InteriorProjectDraft | null>(null);

  const write = (next: InteriorProjectDraft[]) => setPath(form, path, next);

  const status = (p: InteriorProjectDraft): Status => {
    if (!p.serverId) return { label: "Draft", tone: "slate" };
    const s = profile?.projects?.find((x) => x.id === p.serverId);
    return s?.isApproved ? { label: "Approved", tone: "green" } : { label: "In review", tone: "amber" };
  };

  const persist = async (draft: InteriorProjectDraft) => {
    const exists = projects.some((p) => p.id === draft.id);
    const local = exists ? projects.map((p) => (p.id === draft.id ? draft : p)) : [...projects, draft];
    write(local);
    try {
      const saved = await saveProject({ id: draft.serverId ?? undefined, data: projectDraftToPayload(draft) }).unwrap();
      write(local.map((p) => (p.id === draft.id ? { ...p, serverId: saved.id } : p)));
      toast.success("Project saved — it goes to review before it shows publicly");
      return true;
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not save the project. Please try again."));
      return false;
    }
  };

  const remove = async (p: InteriorProjectDraft) => {
    if (p.serverId) {
      try {
        await deleteProject(p.serverId).unwrap();
      } catch (e) {
        return toast.error(apiErrorMessage(e, "Could not delete project"));
      }
    }
    write(projects.filter((x) => x.id !== p.id));
  };

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <EmptyState
          icon={<Images className="size-5" />}
          title="Add your first project"
          description="Listings with 3+ projects get more enquiries. Start with your best one — you can add the rest later."
          action={
            <button type="button" className={primaryBtn} onClick={() => setEditing(emptyProject(values.location?.primaryCity ?? ""))}>
              <Plus className="size-4" /> Add a project
            </button>
          }
        />
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const st = status(p);
              const miss = projectMissing(p);
              return (
                <li key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900">
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-slate-400"><ImagePlus className="size-6" /></span>
                    )}
                    <span className="absolute left-2 top-2"><StatusBadge tone={st.tone}>{st.label}</StatusBadge></span>
                    {p.isFeatured && <Star className="absolute right-2 top-2 size-5 fill-amber-400 text-amber-400" aria-label="Featured" />}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate font-semibold">{p.title || "Untitled project"}</p>
                    <p className="truncate text-xs text-slate-500">{projectCaption(p) || "Add BHK, city and style"}</p>
                    <p className="text-xs text-slate-500">
                      {projectImageCount(p)} photos{miss.length ? ` · missing: ${miss.join(", ")}` : ""}
                    </p>
                    <div className="flex gap-1 pt-1">
                      <button type="button" className={cn(secondaryBtn, "h-8 px-3 text-xs")} onClick={() => setEditing(p)}><Pencil className="size-3.5" /> Edit</button>
                      <button type="button" aria-label={`Delete ${p.title || "project"}`} className={ghostIconBtn} onClick={() => remove(p)}><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={secondaryBtn} onClick={() => setEditing(emptyProject(values.location?.primaryCity ?? ""))}>
              <Plus className="size-4" /> Add another project
            </button>
            {projects.length < 3 && <p className="text-sm text-slate-500">Listings with 3+ projects get more enquiries.</p>}
          </div>
        </>
      )}

      {editing && (
        <ProjectEditor
          key={editing.id}
          countryCode={values.location?.countryCode || "IN"}
          project={editing}
          minImages={minImages}
          specs={getAt<MaterialSpecRow[]>(values, specsPath) ?? []}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            const miss = projectMissing(p);
            if (miss.length) return toast.error(`Add: ${miss.join(", ")}`);
            if (await persist(p)) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function readWidth(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img.naturalWidth);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function CoverPicker({ value, onChange, subFolder }: { value: string; onChange: (v: string) => void; subFolder: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUploader(subFolder);
  return (
    <div className="space-y-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Cover photo"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const w = await readWidth(f);
          if (w && w < MIN_COVER_WIDTH) return toast.error(`Cover must be at least ${MIN_COVER_WIDTH}px wide (this one is ${w}px).`);
          const url = await upload(f);
          if (url) onChange(url);
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Cover" className="size-full object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-sm text-slate-500">
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-6" />}
            {uploading ? "Uploading…" : "Upload cover photo"}
          </span>
        )}
        {/* 4:3 safe-area guide */}
        <span className="pointer-events-none absolute inset-[8%] rounded-lg border border-white/70 mix-blend-difference" aria-hidden />
      </button>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Crop className="size-3.5" /> Shown at 4:3. At least {MIN_COVER_WIDTH}px wide; keep the main subject inside the guide.
        {value && (
          <button type="button" className="ml-auto underline" onClick={() => ref.current?.click()}>Replace</button>
        )}
      </p>
    </div>
  );
}

function ProjectEditor({
  project,
  minImages,
  specs,
  saving,
  onClose,
  onSave,
  countryCode = "IN",
}: {
  countryCode?: string;
  project: InteriorProjectDraft;
  minImages: number;
  specs: MaterialSpecRow[];
  saving: boolean;
  onClose: () => void;
  onSave: (p: InteriorProjectDraft) => void;
}) {
  const [p, setP] = useState(project);
  const set = <K extends keyof InteriorProjectDraft>(k: K, v: InteriorProjectDraft[K]) => setP((x) => ({ ...x, [k]: v }));
  const folder = `projects/${p.id}`;
  const rooms = p.roomGalleries;
  const toggleRoom = (room: RoomType) =>
    set("roomGalleries", rooms.some((g) => g.room === room) ? rooms.filter((g) => g.room !== room) : [...rooms, { room, images: [] }]);
  const imgs = projectImageCount(p);
  const missing = projectMissing(p);

  return (
    <EditorPanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={project.title ? `Edit “${project.title}”` : "New project"}
      description="One project at a time. Saved projects appear on your public profile once your listing is live."
      footer={
        <>
          <span className="mr-auto self-center text-xs text-slate-500">{missing.length ? `${missing.length} required left` : `${imgs} photos`}</span>
          <button type="button" className={secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryBtn} disabled={saving} onClick={() => onSave(p)}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save project
          </button>
        </>
      }
    >
      <CoverPicker value={p.coverImage} onChange={(v) => set("coverImage", v)} subFolder={folder} />
      <Field label="Project title" required>
        {(id) => <input id={id} className={inputCls} maxLength={120} placeholder="e.g. Warm 3 BHK in Whitefield" value={p.title} onChange={(e) => set("title", e.target.value)} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="BHK" required>
          {(id) => (
            <select id={id} className={inputCls} value={p.bhk} onChange={(e) => set("bhk", e.target.value)}>
              <option value="">Select</option>
              {strOpts(BHK_OPTIONS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </Field>
        <Field label="Property type">
          {(id) => (
            <select id={id} className={inputCls} value={p.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
              <option value="">Select</option>
              {strOpts(PROPERTY_TYPE_OPTIONS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </Field>
        <Field label="City" required>
          {() => <PropertyListingCitySelector countryCode={countryCode} value={p.city} placeholder="Search city" onChange={(c) => set("city", c.name)} />}
        </Field>
        <Field label="Area (sq.ft)">
          {(id) => <input id={id} inputMode="numeric" className={inputCls} value={p.areaSqft ?? ""} onChange={(e) => set("areaSqft", toNum(e.target.value))} />}
        </Field>
      </div>
      <Field label="Style" required>
        {() => <ChipGroup label="Style" options={strOpts(DESIGN_STYLE_OPTIONS)} value={p.designStyle} onChange={(v) => set("designStyle", v as string)} />}
      </Field>
      <Field label="Budget band" required>
        {() => <ChipGroup label="Budget band" options={BUDGET_BANDS.map((b) => ({ value: b, label: b }))} value={p.budgetRange} onChange={(v) => set("budgetRange", v as string)} />}
      </Field>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Photos by room <span className="font-normal text-slate-500">(at least {minImages} in total)</span></p>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((r) => (
            <Chip key={r.value} active={rooms.some((g) => g.room === r.value)} onClick={() => toggleRoom(r.value)}>{r.label}</Chip>
          ))}
        </div>
        {rooms.map((g) => (
          <Field key={g.room} label={ROOM_TYPES.find((r) => r.value === g.room)?.label ?? g.room}>
            {() => (
              <ImagesUpload
                label={`${g.room} photos`}
                subFolder={folder}
                value={g.images}
                max={30}
                onChange={(images) => set("roomGalleries", rooms.map((x) => (x.room === g.room ? { ...x, images } : x)))}
              />
            )}
          </Field>
        ))}
      </div>

      <details className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-semibold">Before & after (optional)</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Before">{() => <ImagesUpload label="Before photos" subFolder={folder} value={p.beforeImages} max={10} onChange={(v) => set("beforeImages", v)} />}</Field>
          <Field label="After">{() => <ImagesUpload label="After photos" subFolder={folder} value={p.afterImages} max={10} onChange={(v) => set("afterImages", v)} />}</Field>
        </div>
      </details>

      {specs.length > 0 && (
        <Field label="Materials used" hint="From your Materials step. Tap to tag this project.">
          {() => (
            <div className="flex flex-wrap gap-2">
              {specs.map((s) => {
                const on = p.materialsUsed.some((m) => m.id === s.id);
                return (
                  <Chip key={s.id} active={on} onClick={() => set("materialsUsed", on ? p.materialsUsed.filter((m) => m.id !== s.id) : [...p.materialsUsed, s])}>
                    {[s.material, s.brand].filter(Boolean).join(" · ")}
                  </Chip>
                );
              })}
            </div>
          )}
        </Field>
      )}

      <Field label="Services delivered">
        {() => <ChipGroup multiple label="Services delivered" options={strOpts(SERVICE_OPTIONS)} value={p.servicesPerformed} onChange={(v) => set("servicesPerformed", v as string[])} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Completed (month)">
          {(id) => <input id={id} type="month" className={inputCls} value={p.completionDate} onChange={(e) => set("completionDate", e.target.value)} />}
        </Field>
        <Field label="Took (days)">
          {(id) => <input id={id} inputMode="numeric" className={inputCls} value={p.durationDays ?? ""} onChange={(e) => set("durationDays", toNum(e.target.value))} />}
        </Field>
      </div>
      <Field label="Story" hint="The brief, the challenge and what you did.">
        {(id) => <textarea id={id} className={textareaCls} rows={4} maxLength={2000} value={p.description} onChange={(e) => set("description", e.target.value)} />}
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={p.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Feature this project at the top of my profile
      </label>
    </EditorPanel>
  );
}
