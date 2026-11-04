"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  UploadCloud,
  Trash2,
  Star,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import type { FieldConfig } from "@/features/propertyListing/formConfig/types";
import { compressImageWithStats } from "@/lib/utils/imageCompression";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";

export type PendingMedia = {
  localId: string;
  id?: number;
  name: string;
  size: number;
  type: string;
  preview: string;
  originalSize?: number;
  savedPercentage?: number;
  wasCompressed?: boolean;
  uploadedUrl?: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
};

export function MediaField({ field }: { field: FieldConfig }) {
  const form = useFormContext();
  // Start from photos already on the form (edit / duplicate), so nothing is overwritten on mount.
  const [items, setItems] = useState<PendingMedia[]>(() => {
    const stored = (form.getValues("meta.draftState") as { mediaUploads?: PendingMedia[] } | null)?.mediaUploads;
    return Array.isArray(stored) ? stored : [];
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number } | null>(null);

  const [getPresignedUploadUrl] = useGetPresignedUploadUrlMutation();

  useEffect(() => {
    form.setValue("meta.draftState", {
      ...((form.getValues("meta.draftState") as Record<string, unknown>) ?? {}),
      mediaUploads: items,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const uploadFileToR2 = useCallback(
    async (file: File | Blob, localId: string, fileName: string, contentType: string) => {
      try {
        const presigned = await getPresignedUploadUrl({
          fileName,
          contentType: contentType || "image/webp",
          category: "properties",
          subFolder: "photos",
        }).unwrap();

        const uploadRes = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType || "image/webp",
          },
          body: file,
        });

        if (uploadRes.ok) {
          setItems((prev) =>
            prev.map((i) =>
              i.localId === localId
                ? {
                    ...i,
                    uploading: false,
                    uploaded: true,
                    uploadedUrl: presigned.publicUrl,
                    error: undefined,
                  }
                : i
            )
          );
        } else {
          setItems((prev) =>
            prev.map((i) =>
              i.localId === localId
                ? {
                    ...i,
                    uploading: false,
                    error: "Upload failed",
                  }
                : i
            )
          );
        }
      } catch (err: any) {
        console.error("R2 Upload error:", err);
        setItems((prev) =>
          prev.map((i) =>
            i.localId === localId
              ? {
                  ...i,
                  uploading: false,
                  error: err?.message || "Upload error",
                }
              : i
          )
        );
      }
    },
    [getPresignedUploadUrl]
  );

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const rawFiles = Array.from(fileList);

      setIsCompressing(true);
      setCompressProgress({ current: 0, total: rawFiles.length });

      const filesToUpload: Array<{ file: File | Blob; localId: string; fileName: string; type: string }> = [];

      try {
        const processed: PendingMedia[] = [];

        for (let i = 0; i < rawFiles.length; i++) {
          const file = rawFiles[i];
          setCompressProgress({ current: i + 1, total: rawFiles.length });

          // Apply hardware-accelerated Lanczos + WebP compression for images
          let finalFile: File | Blob = file;
          let originalSize = file.size;
          let savedPercentage = 0;
          let wasCompressed = false;

          if (file.type.startsWith("image/")) {
            const compression = await compressImageWithStats(file, {
              maxDimension: 1920,
              quality: 0.82,
            });
            finalFile = compression.file;
            originalSize = compression.originalSize;
            savedPercentage = compression.savedPercentage;
            wasCompressed = compression.wasCompressed;
          }

          const localId = crypto.randomUUID();
          processed.push({
            localId,
            name: finalFile instanceof File ? finalFile.name : file.name,
            size: finalFile.size,
            type: finalFile.type || "image/webp",
            preview: URL.createObjectURL(finalFile),
            originalSize,
            savedPercentage,
            wasCompressed,
            uploading: true,
          });

          filesToUpload.push({
            file: finalFile,
            localId,
            fileName: finalFile instanceof File ? finalFile.name : file.name,
            type: finalFile.type || "image/webp",
          });
        }

        setItems((prev) => [...prev, ...processed]);
      } finally {
        setIsCompressing(false);
        setCompressProgress(null);
      }

      // Upload to Cloudflare R2 concurrently
      filesToUpload.forEach((item) => {
        uploadFileToR2(item.file, item.localId, item.fileName, item.type);
      });
    },
    [uploadFileToR2]
  );

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.localId !== id));

  const move = (id: string, dir: -1 | 1) =>
    setItems((prev) => {
      const i = prev.findIndex((x) => x.localId === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

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

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-10 text-center transition hover:border-slate-500 hover:bg-slate-50",
          isCompressing && "opacity-80 pointer-events-none border-rose-300 bg-rose-50/30"
        )}
      >
        {isCompressing ? (
          <>
            <Loader2 className="h-7 w-7 text-rose-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-800">
              Optimizing photos ({compressProgress?.current} of {compressProgress?.total})...
            </span>
            <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Making them load fast for buyers
            </span>
          </>
        ) : (
          <>
            <UploadCloud className="h-7 w-7 text-rose-500" />
            <span className="text-sm font-semibold text-slate-800">Tap to add photos or video</span>
            <span className="text-xs text-slate-500">
              JPG, PNG, WEBP or MP4 · We optimise them automatically
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={isCompressing}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>*]:min-w-0">
          {items.map((item, idx) => (
            <div
              key={item.localId}
              className={cn(
                "group relative min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm transition",
                idx === 0 ? "border-slate-900 ring-2 ring-slate-300" : "border-slate-200"
              )}
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {item.type.startsWith("video") ? (
                  <video src={item.preview} muted className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.preview} alt={item.name} className="h-full w-full object-cover" />
                )}

                <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {idx === 0 ? "Cover" : `#${idx + 1}`}
                  </span>
                  {item.wasCompressed && (
                    <span className="rounded-full bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-0.5 shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" />
                      -{item.savedPercentage}%
                    </span>
                  )}
                  {item.uploading && (
                    <span className="rounded-full bg-blue-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1 shadow-sm">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      Uploading
                    </span>
                  )}
                  {item.error && (
                    <span className="rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1 shadow-sm">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Failed
                    </span>
                  )}
                </div>

                {/* Controls: always visible on touch screens, on hover with a mouse. */}
                <div className="absolute right-2 top-2 flex gap-1.5 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => removeItem(item.localId)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-md transition hover:scale-105"
                    aria-label="Remove photo"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
              <div className="flex items-center gap-1 border-t border-slate-100 px-1.5 py-1.5 dark:border-slate-800">
                {idx === 0 ? (
                  <span className="flex flex-1 items-center gap-1 px-1 text-[11px] font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(item.localId)}
                    title="Set as cover photo"
                    className="flex flex-1 items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Star className="h-3.5 w-3.5" /> Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(item.localId, -1)}
                  disabled={idx === 0}
                  aria-label="Move left"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(item.localId, 1)}
                  disabled={idx === items.length - 1}
                  aria-label="Move right"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-slate-500">
          Tip: the cover photo is what buyers see first. Use a bright living-room or front view.
        </p>
      )}
    </div>
  );
}
