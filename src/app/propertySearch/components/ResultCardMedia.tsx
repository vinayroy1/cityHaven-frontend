import React from "react";
import { BadgeCheck, Building2, Camera, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { preloadImage, preloadAdjacentCardImages } from "@/components/common/useCardImageSwipe";

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
  onMoveImage: (event: React.SyntheticEvent, direction: 1 | -1) => void;
  onChooseImage?: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  compact?: boolean;
  priority?: boolean;
  deferImage?: boolean;
  price?: string;
  listingType?: string | null;
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
  compact = false,
  priority = false,
  deferImage = false,
  price,
  listingType,
}: ResultCardMediaProps) {
  const [loaded, setLoaded] = React.useState(!deferImage);
  const [hasInteracted, setHasInteracted] = React.useState(activeImage > 0);

  // Preload the 2nd image (index 1) during idle time so first swipe is instantaneous
  React.useEffect(() => {
    if (!safeImages || safeImages.length <= 1) return;
    const schedule = () => {
      if (safeImages[1]) preloadImage(safeImages[1]);
    };
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const idleId = (window as any).requestIdleCallback(schedule, { timeout: 2500 });
        return () => (window as any).cancelIdleCallback(idleId);
      } else {
        const timer = setTimeout(schedule, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [safeImages]);

  // Preload adjacent images whenever activeImage changes
  React.useEffect(() => {
    if (safeImages && safeImages.length > 1) {
      preloadAdjacentCardImages(safeImages, activeImage);
      if (safeImages.length > 3) {
        const aheadIdx = (activeImage + 2) % safeImages.length;
        if (safeImages[aheadIdx]) preloadImage(safeImages[aheadIdx]);
      }
      if (activeImage > 0) {
        setHasInteracted(true);
      }
    }
  }, [safeImages, activeImage]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const isHorizontalRef = React.useRef<boolean | null>(null);
  const hasDraggedRef = React.useRef(false);

  const dragResetTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!hasCarousel || photoCount <= 1) return;
      setHasInteracted(true);
      preloadAdjacentCardImages(safeImages, activeImage);
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      hasDraggedRef.current = false;
      isHorizontalRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || !hasCarousel || photoCount <= 1) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const diffY = touch.clientY - touchStartRef.current.y;

      // Determine gesture direction on initial movement (> 5px)
      if (isHorizontalRef.current === null) {
        if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
          isHorizontalRef.current = Math.abs(diffX) >= Math.abs(diffY);
        }
      }

      // If horizontal gesture on the image:
      // Prevent parent card row from scrolling horizontally!
      if (isHorizontalRef.current === true) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();
        hasDraggedRef.current = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !hasCarousel || photoCount <= 1) {
        touchStartRef.current = null;
        isHorizontalRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const isHorizontal = isHorizontalRef.current === true;

      touchStartRef.current = null;
      isHorizontalRef.current = null;

      if (isHorizontal) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();

        // Dragged horizontally > 20px -> switch photo
        if (Math.abs(diffX) > 20) {
          hasDraggedRef.current = true;
          if (diffX < 0) {
            onMoveImage(e as unknown as React.SyntheticEvent, 1);
          } else {
            onMoveImage(e as unknown as React.SyntheticEvent, -1);
          }
        }
      }

      if (hasDraggedRef.current) {
        if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
        dragResetTimerRef.current = setTimeout(() => {
          hasDraggedRef.current = false;
        }, 300);
      }
    };

    const onTouchCancel = () => {
      touchStartRef.current = null;
      isHorizontalRef.current = null;
    };

    // Non-passive listener is required so e.preventDefault() can block parent horizontal card scroll
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [hasCarousel, photoCount, onMoveImage]);

  const handleClickCapture = (e: React.MouseEvent) => {
    // If the user dragged horizontally to swipe the image, kill the click event
    // so it NEVER triggers card navigation to details page.
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
    }
  };

  React.useEffect(() => {
    if (!deferImage || loaded) return;
    const trigger = () => setLoaded(true);
    window.addEventListener("scroll", trigger, { once: true, passive: true });
    window.addEventListener("touchstart", trigger, { once: true, passive: true });
    window.addEventListener("click", trigger, { once: true, passive: true });
    const timer = setTimeout(trigger, 2500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("click", trigger);
    };
  }, [deferImage, loaded]);

  return (
    <div
      ref={containerRef}
      onClickCapture={handleClickCapture}
      onMouseEnter={() => {
        if (safeImages && safeImages.length > 1) {
          preloadAdjacentCardImages(safeImages, activeImage);
        }
      }}
      className={`relative block overflow-hidden touch-pan-y select-none bg-gradient-to-br from-slate-100 via-zinc-100 to-slate-200 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 ${compact ? "aspect-[16/10]" : "aspect-[16/10] sm:aspect-[4/3]"}`}
    >
      {loaded ? (
        <img
          src={image}
          alt={title || "Property"}
          loading={hasInteracted || priority ? "eager" : "lazy"}
          fetchPriority={hasInteracted || priority ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105 pointer-events-none"
          onError={onImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Building2 className="h-8 w-8 text-slate-300/70 dark:text-slate-600" />
        </div>
      )}

      {/* Subtle bottom gradient on compact to make price readable like project cards */}
      {compact && price && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/10 pointer-events-none" />
      )}

      {hasCarousel && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => onMoveImage(event, -1)}
            className="absolute left-2 top-1/2 z-20 hidden sm:inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 shadow-sm transition hover:bg-white focus:opacity-100 sm:left-3 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => onMoveImage(event, 1)}
            className="absolute right-2 top-1/2 z-20 hidden sm:inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 shadow-sm transition hover:bg-white focus:opacity-100 sm:right-3 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {compact ? (
        <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1">
          {isMyProperty ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/50 bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
              <ShieldCheck className="h-3 w-3" />
              Your Listing
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/95 px-2 py-0.5 text-[9px] font-black text-emerald-700 shadow-xs backdrop-blur-md">
              <BadgeCheck className="h-3 w-3 text-emerald-600" />
              VERIFIED
            </span>
          ) : isNew ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-400 px-2 py-0.5 text-[9px] font-black text-zinc-950 shadow-xs">
              <Sparkles className="h-3 w-3" />
              NEW
            </span>
          ) : type ? (
            <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {type}
            </span>
          ) : null}
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Price overlay on compact like project cards */}
      {compact && price && (
        <div className="absolute left-2.5 bottom-2.5 z-10 max-w-[calc(100%-4.5rem)] pointer-events-none">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-300 drop-shadow-xs">
            {listingType?.toUpperCase() === "RENT" ? "Rent" : listingType?.toUpperCase() === "PG" ? "Starts at" : "Price"}
          </span>
          <p className="truncate text-sm sm:text-base font-black text-white leading-tight drop-shadow-md">{price}</p>
        </div>
      )}

      {photoCount > 1 && (
        <span className={`absolute z-10 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs backdrop-blur-md ${compact ? "bottom-2.5 right-2.5" : "bottom-3 right-3"}`}>
          <Camera className="h-2.5 w-2.5" />
          {activeImage + 1}/{photoCount}
        </span>
      )}
    </div>
  );
}
