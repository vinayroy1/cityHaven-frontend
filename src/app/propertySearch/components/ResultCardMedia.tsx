import React from "react";
import { BadgeCheck, Building2, Camera, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";

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
}: ResultCardMediaProps) {
  const [loaded, setLoaded] = React.useState(!deferImage);

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
      className={`relative block overflow-hidden touch-pan-y select-none bg-gradient-to-br from-slate-100 via-zinc-100 to-slate-200 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 ${compact ? "aspect-[16/7] sm:aspect-[16/9]" : "aspect-[16/10] sm:aspect-[4/3]"}`}
    >
      {loaded ? (
        <img
          src={image}
          alt={title || "Property"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105 pointer-events-none"
          onError={onImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Building2 className="h-8 w-8 text-slate-300/70 dark:text-slate-600" />
        </div>
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
      {photoCount > 1 && (
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-zinc-950/75 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs">
          <Camera className="h-3 w-3" />
          {activeImage + 1}/{photoCount}
        </span>
      )}
    </div>
  );
}
