"use client";

import React, { useCallback, useEffect, useState } from "react";
import { UploadCloud, Trash2, Star, ImageIcon, Video } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import type { FieldConfig } from "@/features/propertyListing/formConfig/types";

// NOTE: this backend has no raw file-upload endpoint. Media is associated with a
// listing after it is created via POST /propertyListing/{id}/media
// { items: [{ url, type }] } — i.e. it expects already-hosted URLs. Until a file
// host / uploader is wired, this field is a local picker: previews are shown and
// the selection is kept on the draft, but nothing is sent to the server on
// publish. `media.mediaUploads` on the draft holds the pending files.

export type PendingMedia = {
  localId: string;
  name: string;
  size: number;
  type: string;
  preview: string;
};

const formatSize = (bytes: number) => {
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

export function MediaField({ field }: { field: FieldConfig }) {
  const form = useFormContext();
  const [items, setItems] = useState<PendingMedia[]>([]);

  useEffect(() => {
    const stored = (form.getValues("meta.draftState") as { mediaUploads?: PendingMedia[] } | null)
      ?.mediaUploads;
    if (Array.isArray(stored) && stored.length) setItems(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setValue("meta.draftState", {
      ...((form.getValues("meta.draftState") as Record<string, unknown>) ?? {}),
      mediaUploads: items,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    setItems((prev) => [
      ...prev,
      ...Array.from(fileList).map((file) => ({
        localId: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.localId !== id));
  const makeCover = (id: string) =>
    setItems((prev) => {
      const t = prev.find((i) => i.localId === id);
      return t ? [t, ...prev.filter((i) => i.localId !== id)] : prev;
    });

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-800">{field.label}</p>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-10 text-center transition hover:border-slate-500 hover:bg-slate-50">
        <UploadCloud className="h-7 w-7 text-rose-500" />
        <span className="text-sm font-semibold text-slate-800">Tap to add photos or video</span>
        <span className="text-xs text-slate-500">PNG, JPG, WEBP, MP4 · first image becomes the cover</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={item.localId}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-white",
                idx === 0 ? "border-slate-900 ring-2 ring-slate-300" : "border-slate-200",
              )}
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {item.type.startsWith("video") ? (
                  <video src={item.preview} muted className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.preview} alt={item.name} className="h-full w-full object-cover" />
                )}
                <div className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {idx === 0 ? "Cover" : `#${idx + 1}`}
                </div>
                <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => makeCover(item.localId)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/90 text-amber-500"
                    title="Make cover"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.localId)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/90 text-rose-500"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-[11px] text-white">
                  {item.type.startsWith("video") ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  <span className="truncate">{item.name}</span>
                  <span className="ml-auto shrink-0 text-white/70">{formatSize(item.size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-amber-600">
        Photos are previewed locally for now — image hosting isn’t wired to this backend yet.
      </p>
    </div>
  );
}
