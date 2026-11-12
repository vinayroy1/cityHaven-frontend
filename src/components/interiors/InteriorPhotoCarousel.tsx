"use client";
/**
 * Swipeable portfolio photos for interior designer cards (homepage + search).
 * Touch swipe on mobile, hover arrows on desktop, "n of N" counter. A swipe never
 * opens the profile link the card is wrapped in.
 */
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useCardImageSwipe } from "@/components/common/useCardImageSwipe";

export const MAX_CARD_PHOTOS = 8;

export function InteriorPhotoCarousel({
  photos,
  alt,
  renderImage,
  className = "",
  fallback,
}: {
  photos: string[];
  alt: string;
  /** Renders the active photo (lets each card keep its own <img>/<Image> sizing). */
  renderImage: (src: string, index: number) => ReactNode;
  className?: string;
  fallback?: ReactNode;
}) {
  const list = photos.slice(0, MAX_CARD_PHOTOS);
  const { activeImage, nextImage, prevImage, hasCarousel, handleMouseEnter, containerRef, handleClickCapture } =
    useCardImageSwipe({ images: list });
  const src = list[activeImage] ?? list[0];

  return (
    <div
      ref={containerRef}
      onClickCapture={handleClickCapture}
      onMouseEnter={handleMouseEnter}
      aria-label={hasCarousel ? `${alt}: photo ${activeImage + 1} of ${list.length}` : undefined}
      className={`relative h-full w-full select-none touch-pan-y ${className}`}
    >
      {src ? renderImage(src, activeImage) : fallback}
      {hasCarousel && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={prevImage}
            className="absolute left-2 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md transition hover:bg-white focus:opacity-100 sm:inline-flex sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={nextImage}
            className="absolute right-2 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md transition hover:bg-white focus:opacity-100 sm:inline-flex sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 flex justify-center gap-1">
            {list.map((p, i) => (
              <span
                key={p}
                className={`h-1.5 rounded-full bg-white shadow transition-all ${i === activeImage ? "w-4 opacity-100" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
          <span className="pointer-events-none absolute right-2.5 top-11 z-10 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            <Camera className="h-2.5 w-2.5" aria-hidden />
            {activeImage + 1}/{list.length}
          </span>
        </>
      )}
    </div>
  );
}

/** Hero first, then every project cover + gallery image, then the banner; de-duplicated. */
export function interiorCardPhotos(profile: {
  coverBanner?: string | null;
  workGallery?: string[] | null;
  projects?: { coverImage?: string | null; images?: string[] | null; isFeatured?: boolean; isApproved?: boolean }[];
}): string[] {
  const projects = profile.projects ?? [];
  const hero =
    projects.find((p) => p.isFeatured && p.coverImage)?.coverImage ||
    projects.find((p) => p.isApproved && p.coverImage)?.coverImage ||
    projects.find((p) => p.coverImage)?.coverImage ||
    null;
  return Array.from(
    new Set(
      [hero, ...projects.flatMap((p) => [p.coverImage, ...(p.images || [])]), ...(profile.workGallery || []), profile.coverBanner].filter(
        (s): s is string => Boolean(s),
      ),
    ),
  );
}
