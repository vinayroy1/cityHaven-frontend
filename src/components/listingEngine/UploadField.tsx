"use client";

import React, { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import type { FieldConfig } from "@/lib/listingEngine/types";
import { domId, FieldShell } from "./FieldShell";
import { useUploader } from "./uploadContext";

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url) || url.startsWith("data:image") || url.startsWith("blob:");

/** Single file upload (value = URL string). meta: category, subFolder, accept, aspect ("square"|"wide"), maxSizeMb. */
export function UploadField({
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
  const { control } = useFormContext();
  const { field: f, fieldState } = useController({ name, control });
  const upload = useUploader();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const meta = field.meta ?? {};
  const accept = (meta.accept as string) ?? "image/*";
  const aspect = (meta.aspect as string) ?? "wide";
  const maxMb = (meta.maxSizeMb as number) ?? 10;
  const id = domId(name);
  const url = typeof f.value === "string" ? f.value : "";
  const err = localError ?? fieldState.error?.message;
  const isImage = accept.startsWith("image");

  const pick = async (file?: File) => {
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) {
      setLocalError(`File is larger than ${maxMb} MB.`);
      return;
    }
    setLocalError(null);
    setBusy(true);
    try {
      const publicUrl = await upload(file, { category: meta.category as string, subFolder: meta.subFolder as string });
      f.onChange(publicUrl);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const frame = cn(
    "relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition",
    aspect === "square" ? "aspect-square max-w-[180px]" : "aspect-[16/9]",
    err ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900",
  );

  return (
    <FieldShell id={id} label={field.label} required={required} publishOnly={field.requiredFor === "PUBLISH"} help={field.helpText} error={err ?? undefined}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || busy}
        data-testid={`upload-input-${name}`}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {url ? (
        <div className="space-y-2">
          <div className={cn(frame, "border-solid")}>
            {isImage || isImageUrl(url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={field.label} className="h-full w-full object-cover" />
            ) : (
              <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-4 text-sm text-slate-700 underline">
                <FileText className="h-5 w-5" /> View file
              </a>
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replace
            </button>
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => f.onChange("")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          aria-label={`Upload ${field.label}`}
          className={cn(frame, "flex-col gap-2 p-4 text-center hover:border-slate-400")}
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
              <span className="text-xs text-slate-600">Uploading…</span>
            </>
          ) : (
            <>
              {isImage ? <ImagePlus className="h-6 w-6 text-slate-500" /> : <FileText className="h-6 w-6 text-slate-500" />}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tap to upload</span>
              <span className="text-[11px] text-slate-500">Up to {maxMb} MB</span>
            </>
          )}
        </button>
      )}
    </FieldShell>
  );
}
