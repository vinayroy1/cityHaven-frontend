"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

const preloadedImageUrls = new Set<string>();

/**
 * Preload a single image into browser cache so that when rendered,
 * it displays instantaneously with 0 network latency.
 */
export function preloadImage(url?: string | null) {
  if (!url || typeof window === "undefined" || preloadedImageUrls.has(url)) return;
  preloadedImageUrls.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

/**
 * Preload next and previous adjacent images in a card's carousel.
 */
export function preloadAdjacentCardImages(
  images?: (string | null | undefined)[],
  currentIndex: number = 0
) {
  if (!images || images.length <= 1) return;
  const validImages = images.filter((img): img is string => Boolean(img));
  if (validImages.length <= 1) return;
  const nextIdx = (currentIndex + 1) % validImages.length;
  const prevIdx = (currentIndex - 1 + validImages.length) % validImages.length;
  if (validImages[nextIdx]) preloadImage(validImages[nextIdx]);
  if (validImages[prevIdx]) preloadImage(validImages[prevIdx]);
}

export interface UseCardImageSwipeOptions {
  totalImages?: number;
  images?: (string | null | undefined)[];
  initialIndex?: number;
}

export function useCardImageSwipe({
  totalImages,
  images,
  initialIndex = 0,
}: UseCardImageSwipeOptions) {
  const effectiveTotal = images ? images.filter(Boolean).length : (totalImages ?? 0);
  const [activeImage, setActiveImage] = useState(initialIndex);
  const [hasInteracted, setHasInteracted] = useState(initialIndex > 0);

  // Keep activeImage bounded within effectiveTotal if total changes
  useEffect(() => {
    if (effectiveTotal > 0 && activeImage >= effectiveTotal) {
      setActiveImage(0);
    }
  }, [effectiveTotal, activeImage]);

  // Preload the 2nd image (index 1) in idle time so the first swipe is instantaneous
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const validImages = images.filter((img): img is string => Boolean(img));
    if (validImages.length <= 1) return;

    const schedule = () => {
      if (validImages[1]) preloadImage(validImages[1]);
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
  }, [images]);

  // Preload adjacent images whenever activeImage changes
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const validImages = images.filter((img): img is string => Boolean(img));
    if (validImages.length <= 1) return;

    preloadAdjacentCardImages(validImages, activeImage);

    // If 4+ images, also pre-fetch 2 ahead for rapid consecutive swipes
    if (validImages.length > 3) {
      const aheadIdx = (activeImage + 2) % validImages.length;
      if (validImages[aheadIdx]) preloadImage(validImages[aheadIdx]);
    }
  }, [images, activeImage]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalRef = useRef<boolean | null>(null);
  const hasDraggedRef = useRef(false);
  const dragResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Outer card touch tracking (for clicks on card body vs drags)
  const cardTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const cardDraggedRef = useRef(false);
  const cardDragResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasCarousel = effectiveTotal > 1;

  const nextImage = useCallback(
    (event?: React.SyntheticEvent) => {
      if (event?.preventDefault) event.preventDefault();
      if (event?.stopPropagation) event.stopPropagation();
      if (effectiveTotal <= 1) return;
      setHasInteracted(true);
      setActiveImage((prev) => (prev + 1) % effectiveTotal);
    },
    [effectiveTotal]
  );

  const prevImage = useCallback(
    (event?: React.SyntheticEvent) => {
      if (event?.preventDefault) event.preventDefault();
      if (event?.stopPropagation) event.stopPropagation();
      if (effectiveTotal <= 1) return;
      setHasInteracted(true);
      setActiveImage((prev) => (prev - 1 + effectiveTotal) % effectiveTotal);
    },
    [effectiveTotal]
  );

  const moveImage = useCallback(
    (direction: 1 | -1, event?: React.SyntheticEvent) => {
      if (direction === 1) {
        nextImage(event);
      } else {
        prevImage(event);
      }
    },
    [nextImage, prevImage]
  );

  const handleMouseEnter = useCallback(() => {
    if (images && images.length > 1) {
      preloadAdjacentCardImages(images, activeImage);
    }
  }, [images, activeImage]);

  useEffect(() => {
    return () => {
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
      if (cardDragResetTimerRef.current) clearTimeout(cardDragResetTimerRef.current);
    };
  }, []);

  // Native non-passive touch listeners on the image container so e.preventDefault()
  // can block the parent horizontal scroll when swiping images.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasCarousel) return;

    const onTouchStart = (e: TouchEvent) => {
      setHasInteracted(true);
      if (images && images.length > 1) {
        preloadAdjacentCardImages(images, activeImage);
      }
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      hasDraggedRef.current = false;
      isHorizontalRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const diffY = touch.clientY - touchStartRef.current.y;

      // Determine gesture direction on initial movement (> 5px)
      if (isHorizontalRef.current === null) {
        if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
          isHorizontalRef.current = Math.abs(diffX) >= Math.abs(diffY);
        }
      }

      // If horizontal gesture on the image, prevent the parent card carousel from scrolling
      if (isHorizontalRef.current === true) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();
        hasDraggedRef.current = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) {
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
            nextImage();
          } else {
            prevImage();
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
  }, [hasCarousel, nextImage, prevImage]);

  const handleClickCapture = (e: React.MouseEvent) => {
    // If the user swiped horizontally, suppress the click so the card does not open details
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
    }
  };

  const handleCardTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (cardDragResetTimerRef.current) clearTimeout(cardDragResetTimerRef.current);
    const touch = e.touches[0];
    cardTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
    cardDraggedRef.current = false;
  };

  const handleCardTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!cardTouchStartRef.current) return;
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - cardTouchStartRef.current.x);
    const diffY = Math.abs(touch.clientY - cardTouchStartRef.current.y);
    if (diffX > 8 || diffY > 8) {
      cardDraggedRef.current = true;
    }
  };

  const handleCardTouchEnd = () => {
    cardTouchStartRef.current = null;
    if (cardDraggedRef.current) {
      if (cardDragResetTimerRef.current) clearTimeout(cardDragResetTimerRef.current);
      cardDragResetTimerRef.current = setTimeout(() => {
        cardDraggedRef.current = false;
      }, 350);
    }
  };

  const isCardDragged = () => {
    if (cardDraggedRef.current || hasDraggedRef.current) {
      cardDraggedRef.current = false;
      hasDraggedRef.current = false;
      return true;
    }
    return false;
  };

  return {
    activeImage,
    setActiveImage,
    nextImage,
    prevImage,
    moveImage,
    hasCarousel,
    hasInteracted,
    handleMouseEnter,
    containerRef,
    handleClickCapture,
    handleCardTouchStart,
    handleCardTouchMove,
    handleCardTouchEnd,
    isCardDragged,
  };
}
