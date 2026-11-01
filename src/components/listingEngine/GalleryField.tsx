"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import type { FieldConfig } from "@/lib/listingEngine/types";
import { domId, FieldShell } from "./FieldShell";
import { useUploader, type UploadOptions } from "./uploadContext";
import { inputBase } from "./theme";

type Pending = { key: string; name: string; error?: string };

export type GalleryInputProps = {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  maxItems?: number;
  uploadOptions?: UploadOptions;
  disabled?: boolean;
  captions?: string[];
  onCaptionsChange?: (next: string[]) => void;
  /** badge on the first image; null hides it. */
  coverLabel?: string | null;
  emptyHint?: string;
};

const move = <T,>(arr: T[], from: number, to: number) => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Controlled multi-image picker — also usable directly by custom components (e.g. room galleries). */
export function GalleryInput({
  id,
  value,
  onChange,
  maxItems = 30,
  uploadOptions,
  disabled,
  captions,
  onCaptionsChange,
  coverLabel = "Cover",
  emptyHint = "Add photos — the first one is used as the cover.",
}: GalleryInputProps) {
  const upload = useUploader();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const urls = Array.isArray(value) ? value : [];
  const remaining = Math.max(0, maxItems - urls.length - pending.filter((p) => !p.error).length);
  // latest lists, so concurrent uploads append instead of overwriting each other
  const latest = useRef(urls);
  latest.current = urls;
  const latestCaps = useRef(captions);
  latestCaps.current = captions;

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list).slice(0, remaining);
    const stamp = Date.now();
    const jobs = files.map((file, i) => ({ file, key: `${stamp}-${i}-${file.name}` }));
    setPending((p) => [...p, ...jobs.map((j) => ({ key: j.key, name: j.file.name }))]);
    if (inputRef.current) inputRef.current.value = "";
    await Promise.all(
      jobs.map(async ({ file, key }) => {
        try {
          const url = await upload(file, uploadOptions);
          const next = [...latest.current, url];
          latest.current = next;
          onChange(next);
          if (onCaptionsChange) {
            const caps = [...(latestCaps.current ?? []), ""];
            latestCaps.current = caps;
            onCaptionsChange(caps);
          }
          setPending((p) => p.filter((x) => x.key !== key));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Upload failed";
          setPending((p) => p.map((x) => (x.key === key ? { ...x, error: msg } : x)));
        }
      }),
    );
  };

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= urls.length || from === to) return;
    onChange(move(urls, from, to));
    if (captions && onCaptionsChange) onCaptionsChange(move(captions, from, to));
  };
  const remove = (i: number) => {
    onChange(urls.filter((_, idx) => idx !== i));
    if (captions && onCaptionsChange) onCaptionsChange(captions.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={disabled || remaining === 0}
        data-testid="gallery-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {urls.length === 0 && pending.length === 0 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
        >
          <ImagePlus className="h-7 w-7 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Add photos</span>
          <span className="max-w-xs text-xs text-slate-500">{emptyHint}</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="Uploaded photos">
          {urls.map((url, i) => (
            <li
              key={`${url}-${i}`}
              draggable={!disabled}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              className={cn(
                "relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
                dragIndex === i && "opacity-50",
              )}
            >
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={captions?.[i] || `Photo ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && coverLabel && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3" /> {coverLabel}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  disabled={disabled}
                  onClick={() => remove(i)}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} earlier`}
                    disabled={disabled || i === 0}
                    onClick={() => reorder(i, i - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow disabled:invisible"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} later`}
                    disabled={disabled || i === urls.length - 1}
                    onClick={() => reorder(i, i + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow disabled:invisible"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {onCaptionsChange && (
                <input
                  aria-label={`Caption for photo ${i + 1}`}
                  placeholder="Caption (optional)"
                  value={captions?.[i] ?? ""}
                  disabled={disabled}
                  maxLength={120}
                  onChange={(e) => {
                    const next = urls.map((_, idx) => captions?.[idx] ?? "");
                    next[i] = e.target.value;
                    onCaptionsChange(next);
                  }}
                  className={cn(inputBase, "h-9 rounded-none border-0 border-t text-xs")}
                />
              )}
            </li>
          ))}
          {pending.map((p) => (
            <li
              key={p.key}
              className={cn(
                "flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center text-[11px]",
                p.error ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              {p.error ? (
                <>
                  <span role="alert" className="line-clamp-2">{p.error}</span>
                  <button type="button" className="underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>
                    Dismiss
                  </button>
                </>
              ) : (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="line-clamp-1 break-all">{p.name}</span>
                </>
              )}
            </li>
          ))}
          {remaining > 0 && (
            <li>
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-xs font-medium text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
              >
                <ImagePlus className="h-5 w-5" /> Add more
              </button>
            </li>
          )}
        </ul>
      )}
      <p className="text-xs text-slate-500">
        {urls.length} / {maxItems} photos{urls.length > 1 ? " · drag or use the arrows to reorder" : ""}
      </p>
    </div>
  );
}

/** RHF-bound gallery (value string[]). meta: category, subFolder, maxItems, withCaptions + captionsField (sibling string[] path). */
export function GalleryField({
  field,
  name,
  required,
  disabled,
}: {
  field: FieldConfig;
  name: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const { control, setValue } = useFormContext();
  const { field: f, fieldState } = useController({ name, control });
  const meta = field.meta ?? {};
  const captionsField = meta.withCaptions ? (meta.captionsField as string | undefined) : undefined;
  const watchedCaps = useWatch({ control, name: captionsField ?? "__noCaptions__", disabled: !captionsField }) as string[] | undefined;
  const id = domId(name);
  return (
    <FieldShell id={id} as="fieldset" label={field.label} required={required} publishOnly={field.requiredFor === "PUBLISH"} help={field.helpText} error={fieldState.error?.message}>
      <GalleryInput
        id={id}
        value={Array.isArray(f.value) ? f.value : []}
        onChange={(next) => f.onChange(next)}
        maxItems={field.maxItems ?? (meta.maxItems as number | undefined) ?? 30}
        uploadOptions={{ category: meta.category as string, subFolder: meta.subFolder as string }}
        disabled={disabled}
        captions={captionsField ? (watchedCaps ?? []) : undefined}
        onCaptionsChange={captionsField ? (next) => setValue(captionsField, next, { shouldDirty: true }) : undefined}
      />
    </FieldShell>
  );
}
