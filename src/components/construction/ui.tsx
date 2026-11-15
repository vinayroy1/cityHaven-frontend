"use client";

import React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import { compressImage } from "@/lib/utils/imageCompression";
import { cn } from "@/components/ui/utils";

export const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-rose-900/40";
export const textareaCls = cn(inputCls, "h-auto resize-y py-2.5 leading-6");
export const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none";
export const secondaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
        {required && <span className="text-rose-600" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-rose-600 bg-rose-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}

export function ChipMulti<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <Chip key={o.value} active={on} onClick={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}>
            {o.label}
          </Chip>
        );
      })}
    </div>
  );
}

/** Free-text tags with quick suggestions (brands, cities). */
export function TagInput({ value, onChange, suggestions = [], placeholder, max = 10 }: { value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string; max?: number }) {
  const [draft, setDraft] = React.useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (!v || value.some((x) => x.toLowerCase() === v.toLowerCase()) || value.length >= max) return;
    onChange([...value, v]);
    setDraft("");
  };
  const rest = suggestions.filter((s) => !value.some((x) => x.toLowerCase() === s.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-rose-50 py-1 pl-3 pr-1.5 text-sm font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {rest.slice(0, 8).map((s) => (
          <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-sm text-slate-600 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300">
            + {s}
          </button>
        ))}
      </div>
      {value.length < max && (
        <input
          className={inputCls}
          value={draft}
          placeholder={placeholder ?? "Type and press Enter"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          onBlur={() => add(draft)}
        />
      )}
    </div>
  );
}

const MAX_BYTES = 10 * 1024 * 1024;

/** Presign + PUT upload to the public bucket under construction/<entity>/<folder>. Returns the URL. */
export function useConstructionUpload() {
  const [presign] = useGetPresignedUploadUrlMutation();
  return React.useCallback(
    async (original: File, entityId: string | number, subFolder: string) => {
      let file = original;
      if (/^image\/(jpe?g|png|webp|heic|heif|avif)$/i.test(file.type)) {
        file = await compressImage(file, { maxDimension: 2400, quality: 0.85 }).catch(() => original);
      }
      if (!/^image\//.test(file.type)) throw new Error(`${original.name} isn't a photo. Please choose a JPG, PNG or WebP image.`);
      if (file.size > MAX_BYTES) throw new Error(`${original.name} is larger than 10 MB. Please choose a smaller photo.`);
      const p = await presign({ fileName: file.name, contentType: file.type, category: "construction", entityId, subFolder })
        .unwrap()
        .catch(() => {
          throw new Error("Couldn't start the upload. Check your connection and try again.");
        });
      const res = await fetch(p.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file }).catch(() => null);
      if (!res?.ok) throw new Error("Upload failed. Please try again.");
      return p.publicUrl;
    },
    [presign],
  );
}

export function PhotoUploader({
  value,
  onChange,
  entityId,
  folder,
  max = 20,
  single = false,
  label = "Add photos",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  entityId: string | number;
  folder: string;
  max?: number;
  single?: boolean;
  label?: string;
}) {
  const upload = useConstructionUpload();
  const ref = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const latest = React.useRef(value);
  React.useEffect(() => {
    latest.current = value;
  }, [value]);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, single ? 1 : Math.max(0, max - value.length));
    setBusy(list.length);
    for (const f of list) {
      try {
        const url = await upload(f, entityId, folder);
        latest.current = single ? [url] : [...latest.current, url];
        onChange(latest.current);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className={cn("grid gap-2", single ? "grid-cols-1 sm:max-w-[200px]" : "grid-cols-3 sm:grid-cols-5")}>
        {value.map((u, i) => (
          <div key={u} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => onChange(value.filter((x) => x !== u))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-90 transition hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {i === 0 && !single && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
          </div>
        ))}
        {(single ? value.length === 0 : value.length < max) && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy > 0}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60 dark:border-slate-700"
          >
            {busy > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="px-2 text-center text-[11px] font-semibold">{busy > 0 ? `Uploading ${busy}…` : label}</span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={!single} hidden onChange={(e) => void pick(e.target.files)} />
      {error && <p className="text-xs font-medium text-rose-600" role="alert">{error}</p>}
    </div>
  );
}

export const toInt = (v: string) => {
  const n = Number(v.replace(/[^\d]/g, ""));
  return v.trim() === "" || !Number.isFinite(n) ? null : n;
};
