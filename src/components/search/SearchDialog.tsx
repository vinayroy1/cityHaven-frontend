"use client";
import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function SearchDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [viewportStyle, setViewportStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const updateViewport = () => {
      const vv = window.visualViewport;
      if (vv && window.innerWidth < 768) {
        setViewportStyle({
          position: "fixed",
          top: `${vv.offsetTop}px`,
          left: `${vv.offsetLeft}px`,
          width: `${vv.width}px`,
          height: `${vv.height}px`,
        });
      } else {
        setViewportStyle({
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100dvh",
        });
      }
    };

    updateViewport();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
    }
    window.addEventListener("resize", updateViewport);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
      window.removeEventListener("resize", updateViewport);
    };
  }, [open]);

  if (!open || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={viewportStyle}
      className="fixed left-0 top-0 z-[9999] flex h-full w-full flex-col justify-end overflow-hidden sm:items-center sm:justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Container */}
      <div
        data-search-modal="true"
        className="relative z-10 flex max-h-[92%] w-full shrink-0 flex-col rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom duration-200 sm:max-h-[85%] sm:max-w-2xl sm:rounded-3xl sm:border sm:slide-in-from-bottom-4"
      >
        {/* Grab handle indicator (mobile only) */}
        <div className="mx-auto mt-3 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 sm:hidden" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <p className="text-base font-bold text-slate-900 dark:text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
