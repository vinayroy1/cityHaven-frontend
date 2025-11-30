import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Video, UploadCloud, Sparkles, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UseFormReturn } from "react-hook-form";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { cn } from "@/components/ui/utils";

type MediaPreview = {
  id: string;
  name: string;
  size: number;
  type: string;
  preview: string;
};

type MediaSelectorProps = {
  form: UseFormReturn<PropertyListingFormValues>;
};

const formatSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export function MediaSelector({ form }: MediaSelectorProps) {
  const [items, setItems] = useState<MediaPreview[]>([]);

  // hydrate from draftState if present
  useEffect(() => {
    const stored = (form.getValues("meta.draftState") as any)?.mediaUploads as MediaPreview[] | undefined;
    if (stored && Array.isArray(stored) && stored.length) {
      setItems(stored);
    }
  }, [form]);

  // sync to form whenever items change
  useEffect(() => {
    form.setValue("meta.draftState", { ...(form.getValues("meta.draftState") ?? {}), mediaUploads: items });
    form.setValue(
      "media.mediaIds",
      items.length ? items.map((_, idx) => idx + 1) : [],
      { shouldValidate: false, shouldDirty: true },
    );
  }, [items, form]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const next: MediaPreview[] = [];
    Array.from(fileList).forEach((file) => {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      next.push({ id, name: file.name, size: file.size, type: file.type, preview });
    });
    setItems((prev) => [...prev, ...next]);
  }, []);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const makeCover = (id: string) =>
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      const rest = prev.filter((i) => i.id !== id);
      return [target, ...rest];
    });

  const coverId = items[0]?.id;

  const heroPreview = useMemo(() => items[0]?.preview, [items]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_18px_55px_-32px_rgba(15,23,42,0.5)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Media</p>
            <p className="text-xs text-slate-600">Add photos or videos. First item becomes cover.</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500/10 via-amber-400/10 to-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
            <Sparkles className="h-3.5 w-3.5" /> Preview only
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-6 text-center transition hover:-translate-y-1 hover:border-rose-300 sm:w-auto sm:flex-1">
            <UploadCloud className="h-7 w-7 text-rose-500" />
            <div className="text-sm font-semibold text-slate-900">Tap to select media</div>
            <div className="text-xs text-slate-600">PNG, JPG, WEBP, MP4 · up to 10 files</div>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>

        {items.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
              const isCover = item.id === coverId;
              const isVideo = item.type.startsWith("video");
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
                    isCover && "ring-2 ring-rose-400/60",
                  )}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {isVideo ? (
                      <video className="h-full w-full object-cover" src={item.preview} muted />
                    ) : (
                      <img className="h-full w-full object-cover" src={item.preview} alt={item.name} />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <button
                        type="button"
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border text-amber-600 shadow-sm transition",
                          isCover ? "border-amber-400 bg-amber-50" : "border-white/70 bg-white/80 hover:border-amber-300",
                        )}
                        onClick={() => makeCover(item.id)}
                        title="Make cover"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/80 text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
                        onClick={() => removeItem(item.id)}
                        title="Delete media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
                      {isCover ? "Cover" : `Media ${idx + 1}`}
                    </div>
                    <div className="absolute inset-x-0 bottom-2 flex items-start gap-2 px-3 text-xs text-white">
                      {isVideo ? <Video className="h-4 w-4 text-white/80" /> : <ImageIcon className="h-4 w-4 text-white/80" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] text-white/70">{formatSize(item.size)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {heroPreview && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Cover preview</p>
            <div className="mt-2 aspect-[3/1.6] overflow-hidden rounded-xl border border-white/10">
              <img src={heroPreview} alt="Cover preview" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
