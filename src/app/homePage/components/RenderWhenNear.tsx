"use client";

import React from "react";

/** True once the referenced element comes within `rootMargin` of the viewport. */
export function useNearViewport<T extends Element>(rootMargin = "300px 0px") {
  const ref = React.useRef<T>(null);
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setNear(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);
  return [ref, near] as const;
}

/**
 * Defers mounting below-the-fold children (and their data fetching / images)
 * until the placeholder is near the viewport. The placeholder reserves space
 * so nothing visible shifts.
 */
export function RenderWhenNear({
  children,
  minHeight = 320,
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  if (near) return <>{children}</>;
  return <div ref={ref} aria-hidden style={{ minHeight }} />;
}
