"use client";
import React from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

export function SearchDialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return <Drawer.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/40" />
      <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-[81] mx-auto flex max-h-[94dvh] min-h-[65dvh] w-full max-w-2xl flex-col rounded-t-lg bg-white text-zinc-900 outline-none">
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4">
          <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
          <Drawer.Close aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-zinc-100"><X size={20} /></Drawer.Close>
        </header>
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>;
}
