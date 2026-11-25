"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";

/**
 * Derives a clean two-letter uppercase initial from any business or person name.
 * e.g.:
 *  "Design N Build Infra" -> "DB" (or "DN") -> first letters of first 2 words
 *  "Happho" -> "HA"
 *  "Awasio" -> "AW"
 */
export function getInitials(name?: string | null, fallback = "CO"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) {
    const single = parts[0].replace(/[^a-zA-Z0-9]/g, "");
    return (single.slice(0, 2) || fallback).toUpperCase();
  }
  const first = parts[0].replace(/[^a-zA-Z0-9]/g, "")[0] || "";
  // Find second valid word starting char
  const second = parts[1].replace(/[^a-zA-Z0-9]/g, "")[0] || "";
  const combined = (first + second).toUpperCase();
  return combined.length === 2 ? combined : (parts[0].slice(0, 2) || fallback).toUpperCase();
}

/**
 * Deterministically pick an attractive modern gradient background for the initials badge
 * based on the name hash.
 */
const AVATAR_PALETTES = [
  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
  "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
  "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900/60",
  "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/60",
  "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
];

export function getPaletteForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

interface CompanyAvatarProps {
  name: string;
  logo?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
}

export function CompanyAvatar({
  name,
  logo,
  className = "h-10 w-10 shrink-0 rounded-full",
  imageClassName = "h-full w-full rounded-full object-cover",
  fallbackClassName,
  alt = "",
}: CompanyAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name, "CO");
  const palette = getPaletteForName(name);

  if (logo && !hasError) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={alt || `${name} logo`}
          className={imageClassName}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        "flex shrink-0 select-none items-center justify-center border font-bold uppercase tracking-wider",
        palette,
        className,
        fallbackClassName,
      )}
    >
      <span>{initials}</span>
    </div>
  );
}

