"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface UseCardImageSwipeOptions {
  totalImages: number;
  initialIndex?: number;
}

export function useCardImageSwipe({
  totalImages,
  initialIndex = 0,
}: UseCardImageSwipeOptions) {
  const [activeImage, setActiveImage] = useState(initialIndex);

  // Keep activeImage bounded within totalImages if totalImages changes
  useEffect(() => {
    if (totalImages > 0 && activeImage >= totalImages) {
      setActiveImage(0);
    }
  }, [totalImages, activeImage]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalRef = useRef<boolean | null>(null);
  const hasDraggedRef = useRef(false);
  const dragResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Outer card touch tracking (for clicks on card body vs drags)
  const cardTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const cardDraggedRef = useRef(false);
  const cardDragResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasCarousel = totalImages > 1;

  const nextImage = useCallback(
    (event?: React.SyntheticEvent) => {
      if (event?.preventDefault) event.preventDefault();
      if (event?.stopPropagation) event.stopPropagation();
      if (totalImages <= 1) return;
      setActiveImage((prev) => (prev + 1) % totalImages);
    },
    [totalImages]
  );

  const prevImage = useCallback(
    (event?: React.SyntheticEvent) => {
      if (event?.preventDefault) event.preventDefault();
      if (event?.stopPropagation) event.stopPropagation();
      if (totalImages <= 1) return;
      setActiveImage((prev) => (prev - 1 + totalImages) % totalImages);
    },
    [totalImages]
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
    containerRef,
    handleClickCapture,
    handleCardTouchStart,
    handleCardTouchMove,
    handleCardTouchEnd,
    isCardDragged,
  };
}
