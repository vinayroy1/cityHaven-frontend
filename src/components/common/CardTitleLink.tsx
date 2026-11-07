"use client";
/**
 * Crawlable link for a card title. Cards open on click via router.push, which search engines
 * can't follow; this gives them a real <a href>. A plain click is handed to the card's own
 * onClick (so drag/loading logic is unchanged); modified clicks (new tab/window) behave natively.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export function CardTitleLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
          e.stopPropagation();
          return;
        }
        e.preventDefault();
      }}
    >
      {children}
    </Link>
  );
}
