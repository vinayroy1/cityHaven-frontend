"use client";
import React from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

export function SearchDialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const [viewportStyle, setViewportStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const updateViewport = () => {
      const viewport = window.visualViewport;
      setViewportStyle({
        position: "fixed",
        top: `${viewport?.offsetTop ?? 0}px`,
        left: `${viewport?.offsetLeft ?? 0}px`,
        width: `${viewport?.width ?? window.innerWidth}px`,
        height: `${viewport?.height ?? window.innerHeight}px`,
      });
    };

    updateViewport();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [open]);

  return <Drawer.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <Drawer.Portal>
      <div style={viewportStyle} className="fixed left-0 top-0 z-[80] flex h-full w-full items-end overflow-hidden">
        <Drawer.Overlay className="absolute inset-0 bg-black/40" />
        <Drawer.Content aria-describedby={undefined} className="relative z-[1] mx-auto flex max-h-[94%] min-h-[65%] w-full max-w-2xl flex-col rounded-t-lg bg-white text-zinc-900 outline-none dark:border-t dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-slate-800">
            <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
            <Drawer.Close aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-slate-800"><X size={20} /></Drawer.Close>
          </header>
          {children}
        </Drawer.Content>
      </div>
    </Drawer.Portal>
  </Drawer.Root>;
}
