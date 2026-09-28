import Link from "next/link";
import React from "react";
import { BadgeCheck, Bath, BedDouble, Camera, ChevronLeft, ChevronRight, Heart, MapPin, Ruler, Sparkles } from "lucide-react";

type Props = {
  id: number;
  title?: string;
  subtitle?: string;
  price?: string;
  area?: string;
  age?: string;
  owner?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
  listingType?: string | null;
  resCom?: string | null;
  isNew?: boolean;
  isVerified?: boolean;
  posterBadge?: string;
  images?: string[];
};

const FALLBACK_IMAGE = "/property-placeholder.svg";

export function ResultCard({
  id,
  title,
  subtitle,
  price,
  area,
  age,
  owner,
  bedrooms,
  bathrooms,
  type,
  listingType,
  resCom,
  isNew,
  isVerified,
  posterBadge,
  images = [],
}: Props) {
  const safeImages = React.useMemo(() => images.filter(Boolean), [images]);
  const [activeImage, setActiveImage] = React.useState(0);
  const [imageFailed, setImageFailed] = React.useState(false);
  const photoCount = safeImages.length;
  const image = !imageFailed ? safeImages[activeImage] ?? FALLBACK_IMAGE : FALLBACK_IMAGE;
  const hasCarousel = photoCount > 1;
  const contextBadge =
    listingType === "PG"
      ? "PG"
      : resCom === "COMMERCIAL"
        ? "Commercial"
        : listingType === "RENT"
          ? "For rent"
          : listingType === "SELL"
            ? "For sale"
            : null;

  React.useEffect(() => {
    setActiveImage(0);
    setImageFailed(false);
  }, [safeImages]);

  const moveImage = (event: React.MouseEvent<HTMLButtonElement>, direction: 1 | -1) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasCarousel) return;
    setImageFailed(false);
    setActiveImage((current) => (current + direction + photoCount) % photoCount);
  };

  const chooseImage = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setImageFailed(false);
    setActiveImage(index);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <Link href={`/properties/${id}`} className="relative block aspect-[4/3] overflow-hidden bg-zinc-100">
        <img
          src={image}
          alt={title || "Property"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={() => setImageFailed(true)}
        />
        {hasCarousel && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => moveImage(event, -1)}
              className="absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => moveImage(event, 1)}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
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
          {isVerified && (
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
                onClick={(event) => chooseImage(event, index)}
                className={`h-1.5 w-1.5 rounded-full transition ${index === activeImage ? "bg-white" : "bg-white/45"}`}
              />
            ))}
          </div>
        )}
      </Link>

      <button
        type="button"
        aria-label="Save property"
        className="absolute right-3 top-3 hidden h-9 w-9 items-center justify-center rounded-md bg-white/95 text-zinc-700 shadow-sm transition hover:text-rose-600 group-hover:inline-flex"
      >
        <Heart className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {contextBadge && <span className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">{contextBadge}</span>}
          {posterBadge && <span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">{posterBadge}</span>}
          {type && <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700">{type}</span>}
        </div>

        <div>
          <Link href={`/properties/${id}`} className="line-clamp-2 text-base font-semibold text-zinc-950 hover:text-rose-700">
            {title || "Property listing"}
          </Link>
          {subtitle && (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-zinc-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{subtitle}</span>
            </p>
          )}
        </div>

        <p className="text-lg font-bold text-zinc-950">{price}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700">
          {bedrooms != null && bedrooms > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1.5">
              <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
              {bedrooms} BHK
            </span>
          )}
          {bathrooms != null && bathrooms > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1.5">
              <Bath className="h-3.5 w-3.5 text-zinc-400" />
              {bathrooms} Bath
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1.5">
            <Ruler className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate">{area}</span>
          </span>
          <span className="truncate rounded-md bg-zinc-50 px-2.5 py-1.5">{owner}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          <p className="truncate text-xs text-zinc-500">{age}</p>
          <Link href={`/properties/${id}`} className="shrink-0 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
