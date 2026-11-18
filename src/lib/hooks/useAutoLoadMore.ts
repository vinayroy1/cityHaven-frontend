"use client";

import React from "react";

/**
 * Infinite scroll for directory lists. Attach the returned ref to the element under the list (the
 * "Load more" area): when it comes within 600px of the viewport, `onLoad` runs. While `busy` the
 * observer is paused; when a page finishes it re-checks, so a short page keeps filling the screen.
 *
 * `count` is how many items are shown. It auto-loads once per count, so a failed request (count
 * unchanged) is not retried in a loop: the "Load more" button inside the element is the retry, and
 * the fallback for keyboard users.
 */
export function useAutoLoadMore(onLoad: () => void, enabled: boolean, busy: boolean, count: number) {
  const onLoadRef = React.useRef(onLoad);
  const countRef = React.useRef(count);
  React.useEffect(() => {
    onLoadRef.current = onLoad;
    countRef.current = count;
  });
  const firedAt = React.useRef<number | null>(null);
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if (!node || !enabled || busy) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || firedAt.current === countRef.current) return;
      firedAt.current = countRef.current;
      onLoadRef.current();
    }, { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, enabled, busy, count]);
  return setNode;
}
