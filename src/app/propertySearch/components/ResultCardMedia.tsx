import React from "react";
import { BadgeCheck, Camera, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";

type ResultCardMediaProps = {
  image: string;
  title?: string;
  type?: string | null;
  isMyProperty: boolean;
  isVerified?: boolean;
  isNew?: boolean;
  activeImage: number;
  photoCount: number;
  safeImages: string[];
  hasCarousel: boolean;
  onImageError: () => void;
  onMoveImage: (event: React.MouseEvent<HTMLButtonElement>, direction: 1 | -1) => void;
  onChooseImage: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
};

export function ResultCardMedia({
  image,
  title,
  type,
  isMyProperty,
  isVerified,
  isNew,
  activeImage,
  photoCount,
  safeImages,
  hasCarousel,
  onImageError,
  onMoveImage,
  onChooseImage,
}: ResultCardMediaProps) {
  return (
    <div className="relative block aspect-[16/10] overflow-hidden bg-zinc-100 sm:aspect-[4/3]">
      <img
        src={image}
        alt={title || "Property"}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        onError={onImageError}
      />
      {hasCarousel && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => onMoveImage(event, -1)}
            className="absolute left-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 shadow-sm transition hover:bg-white focus:opacity-100 sm:left-3 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => onMoveImage(event, 1)}
            className="absolute right-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 shadow-sm transition hover:bg-white focus:opacity-100 sm:right-3 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
      {type && (
        <span className="absolute left-3 top-3 max-w-[75%] truncate rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
          {type}
        </span>
      )}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {isMyProperty && (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-bold text-white shadow-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your Listing
          </span>
        )}
        {isVerified && !isMyProperty && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
        {isNew && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[11px] font-semibold text-zinc-950 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            New
          </span>
        )}
      </div>
      {photoCount > 0 && (
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-1 text-[11px] font-semibold text-white">
          <Camera className="h-3.5 w-3.5" />
          {activeImage + 1}/{photoCount}
        </span>
      )}
      {hasCarousel && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-md bg-zinc-950/55 px-1.5 py-1">
          {safeImages.slice(0, 5).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show photo ${index + 1}`}
              onClick={(event) => onChooseImage(event, index)}
              className={`relative z-20 h-1.5 w-1.5 rounded-full transition ${index === activeImage ? "bg-white" : "bg-white/45"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
