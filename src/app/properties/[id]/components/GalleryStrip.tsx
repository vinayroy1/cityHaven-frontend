"use client";
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react";

type GalleryStripProps = {
  images: string[];
  title?: string;
  subtitle?: string;
};

export function GalleryStrip({ images, title = "Property gallery", subtitle = "Curated by owner • High resolution" }: GalleryStripProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const orderedImages = useMemo(() => images.filter(Boolean), [images]);
  const activeImage = orderedImages[activeIndex] ?? orderedImages[0];

  const next = () => setActiveIndex((idx) => (idx + 1) % orderedImages.length);
  const prev = () => setActiveIndex((idx) => (idx - 1 + orderedImages.length) % orderedImages.length);

  const openAt = (idx: number) => {
    setActiveIndex(idx);
    setOpen(true);
  };

  if (!orderedImages.length) return null;

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-64 sm:h-80">
          <img src={activeImage} alt="Property cover" className="h-full w-full cursor-pointer object-cover" onClick={() => setOpen(true)} />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-white/70">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-900/90"
            onClick={() => setOpen(true)}
          >
            <Maximize className="h-4 w-4" /> View full
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
          {orderedImages.map((src, idx) => (
            <button
              key={src + idx}
              onClick={() => openAt(idx)}
              className={`relative h-20 overflow-hidden rounded-xl border ${idx === activeIndex ? "border-sky-300 ring-2 ring-sky-100" : "border-slate-100"} transition`}
            >
              <img src={src} alt={`Property image ${idx + 1}`} className="h-full w-full object-cover" />
              {idx === orderedImages.length - 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm font-semibold text-white">View all</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
          <button
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <button
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={prev}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img src={activeImage} alt="Active property view" className="max-h-[80vh] max-w-5xl rounded-3xl object-contain shadow-2xl" />
          <button
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
