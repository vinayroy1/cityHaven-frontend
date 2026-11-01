"use client";
/**
 * Full-screen mobile editor used instead of a bottom drawer for forms with text inputs.
 *
 * Why: on iOS Safari, a bottom-anchored drawer gets pushed off-screen when the keyboard opens,
 * because the layout viewport stays the same while the *visual* viewport shrinks and scrolls.
 * This screen pins itself to `window.visualViewport` (top + height), so the header stays at the
 * top, the body scrolls, and the footer sits directly above the keyboard. Focused fields are
 * scrolled into view inside the body.
 */
import React, { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type Box = { top: number; height: number };

function useVisualViewportBox(active: boolean): Box | null {
  const [box, setBox] = useState<Box | null>(null);
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    const vv = window.visualViewport;
    const update = () => {
      if (vv) setBox({ top: vv.offsetTop, height: vv.height });
      else setBox({ top: 0, height: window.innerHeight });
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      setBox(null);
    };
  }, [active]);
  return box;
}

export function MobileEditorScreen({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const box = useVisualViewportBox(open);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the focused field visible once the keyboard has finished animating in.
  useEffect(() => {
    if (!open) return;
    const body = bodyRef.current;
    if (!body) return;
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      window.setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
    };
    body.addEventListener("focusin", onFocus);
    return () => body.removeEventListener("focusin", onFocus);
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()} // don't pop the keyboard immediately
          style={box ? { top: box.top, height: box.height } : undefined}
          className="fixed inset-x-0 top-0 z-[60] flex h-[100dvh] flex-col bg-white outline-none animate-in slide-in-from-bottom-4 fade-in duration-200 dark:bg-slate-950"
        >
          <header className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-slate-800">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="truncate text-base font-bold text-slate-900 dark:text-white">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-xs text-slate-500">{description}</DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </header>

          <div
            ref={bodyRef}
            // 16px inputs stop iOS from auto-zooming on focus (which also shifts the viewport).
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch] [&_input]:text-base [&_select]:text-base [&_textarea]:text-base"
          >
            {children}
          </div>

          <footer className="flex shrink-0 gap-2 border-t border-slate-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-slate-800 dark:bg-slate-950 [&>*]:flex-1">
            {footer}
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
