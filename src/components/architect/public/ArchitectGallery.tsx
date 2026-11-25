"use client";

import React from "react";
import { Camera, PencilRuler } from "lucide-react";
import { InteriorPhotoCarousel } from "@/components/interiors/InteriorPhotoCarousel";
import { Lightbox } from "@/app/interior-designers/components/profile/Portfolio";
import type { ArchitectProject } from "@/features/architect/types";

type Open = { images: string[]; index: number; title: string } | null;

/** One lightbox shared by the hero, the work photos and the project cards on a profile page. */
const GalleryContext = React.createContext<(o: NonNullable<Open>) => void>(() => {});

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState<Open>(null);
  return (
    <GalleryContext.Provider value={setOpen}>
      {children}
      {open && (
        <Lightbox
          images={open.images}
          index={open.index}
          title={open.title}
          onIndex={(i) => setOpen((o) => (o ? { ...o, index: i } : o))}
          onClose={() => setOpen(null)}
        />
      )}
    </GalleryContext.Provider>
  );
}

/** Hero: swipe through every photo; tap opens the full-screen viewer. */
export function HeroGallery({ images, title }: { images: string[]; title: string }) {
  const open = React.useContext(GalleryContext);
  if (!images.length) return <div className="h-40 w-full bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950 sm:h-56" />;
  return (
    <div className="group h-56 w-full sm:h-80">
      <InteriorPhotoCarousel
        photos={images}
        alt={title}
        renderImage={(src, i) => (
          <button type="button" className="block h-full w-full cursor-zoom-in" aria-label={`Open photo ${i + 1}`} onClick={() => open({ images, index: images.indexOf(src), title })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} photo ${i + 1}`} className="h-full w-full object-cover opacity-70" />
          </button>
        )}
      />
    </div>
  );
}

export function PhotoGrid({ images, title }: { images: string[]; title: string }) {
  const open = React.useContext(GalleryContext);
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((u, i) => (
        <button key={u} type="button" onClick={() => open({ images, index: i, title })} className="overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500" aria-label={`Open work photo ${i + 1}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt={`${title} work photo ${i + 1}`} className="aspect-square w-full cursor-zoom-in object-cover transition hover:scale-105" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

/** Project cover: swipeable through the project's photos, tap opens them full screen. */
export function ProjectPhotos({ project }: { project: ArchitectProject }) {
  const open = React.useContext(GalleryContext);
  const images = Array.from(new Set([project.coverImage, ...project.images].filter(Boolean) as string[]));
  if (!images.length) return null;
  return (
    <div className="group relative aspect-[4/3] w-full">
      <InteriorPhotoCarousel
        photos={images}
        alt={project.title}
        fallback={<PencilRuler className="m-auto h-10 w-10 text-slate-300" />}
        renderImage={(src, i) => (
          <button type="button" className="block h-full w-full cursor-zoom-in" aria-label={`Open ${project.title} photos`} onClick={() => open({ images, index: images.indexOf(src), title: project.title })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${project.title} photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </button>
        )}
      />
      {images.length > 1 && (
        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-semibold text-white">
          <Camera className="h-3 w-3" /> {images.length}
        </span>
      )}
    </div>
  );
}
