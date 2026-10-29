"use client";

import React from "react";
import { Bath, BedDouble, Calendar, Heart, Loader2, MapPin, PhoneCall, Ruler } from "lucide-react";

type ResultCardSummaryProps = {
  title?: string;
  subtitle?: string;
  price?: string;
  area?: string;
  owner?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
  listingType?: string | null;
  decisionDetails?: string[];
  contextBadge: string | null;
  posterBadge?: string;
  onContactClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onScheduleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  compact?: boolean;
  isContactChecking?: boolean;
};

import { useRouter } from "next/navigation";
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "@/features/propertyListing/api";
import { APP_CONFIG } from "@/constants/app-config";

type SavePropertyButtonProps = {
  propertyId?: number | string;
  initialSaved?: boolean;
};

export function SavePropertyButton({ propertyId, initialSaved = false }: SavePropertyButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initialSaved);
  const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  React.useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const toggleSave = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!propertyId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    const nextState = !saved;
    setSaved(nextState);

    try {
      if (nextState) {
        await addFavorite(propertyId).unwrap();
      } else {
        await removeFavorite(propertyId).unwrap();
      }
    } catch {
      // Revert on error
      setSaved(!nextState);
    }
  };

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save property"}
      disabled={isAdding || isRemoving}
      className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition shadow-md hover:scale-110 active:scale-90 ${
        saved
          ? "bg-white text-rose-600 shadow-rose-200 ring-2 ring-rose-100"
          : "bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600"
      }`}
      onClick={toggleSave}
    >
      <Heart className={`h-4 w-4 transition-transform ${saved ? "fill-rose-600 text-rose-600 scale-105" : ""}`} />
    </button>
  );
}

export function ResultCardSummary({
  title,
  subtitle,
  price,
  area,
  owner,
  bedrooms,
  bathrooms,
  type,
  listingType,
  decisionDetails,
  contextBadge,
  posterBadge,
  onContactClick,
  onScheduleClick,
  compact = false,
  isContactChecking = false,
}: ResultCardSummaryProps) {
  const isPg = listingType?.toUpperCase() === "PG";
  const displayTitle = compact
    ? (title || "Property listing")
        .replace(/\s+for\s+(?:sale|rent|lease)\s+in\s+.+$/i, "")
        .replace(/\s+in\s+[^,]+(?:,.*)?$/i, "")
        .replace(/^\d+\s+BHK\s+/i, "")
        .trim()
    : title || "Property listing";
  const compactArea = area
    ?.replace(/^(?:carpet|built[ -]?up|super built[ -]?up)\s*(?:area)?\s*[:\-]?\s*/i, "")
    .trim();

  if (compact) {
    return (
      <div className="relative z-0 flex flex-1 flex-col p-3">
        {/* Category & Poster Indicator */}
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
          {type || (listingType?.toUpperCase() === "RENT" ? "For Rent" : listingType?.toUpperCase() === "PG" ? "PG / Co-Living" : "For Sale")}
          {owner ? ` • By ${owner}` : ""}
        </p>

        {/* Title */}
        <h3
          title={title}
          className="line-clamp-1 text-sm font-bold text-slate-950 group-hover:text-rose-600 transition dark:text-white mt-0.5"
        >
          {displayTitle}
        </h3>

        {/* Location with MapPin */}
        {subtitle && (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <MapPin className="h-3 w-3 shrink-0 text-rose-500" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}

        {/* Specifications chips: Single-line horizontal scroll, never wrap */}
        <div className="mt-2 flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
          {!isPg && bedrooms != null && bedrooms > 0 && (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {bedrooms} BHK
            </span>
          )}
          {bathrooms != null && bathrooms > 0 && (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {bathrooms} Bath
            </span>
          )}
          {compactArea && (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {compactArea}
            </span>
          )}
        </div>

        {/* Action Buttons: Visit & Contact (Anchored to bottom across all cards) */}
        <div className="mt-auto pt-2.5 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
          {onScheduleClick && (
            <button
              type="button"
              title="Schedule a Site Visit"
              className="relative z-20 flex-1 inline-flex items-center justify-center gap-1 h-7.5 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200"
              onClick={onScheduleClick}
            >
              <Calendar className="h-3 w-3 text-rose-600 dark:text-rose-400" />
              <span>Visit</span>
            </button>
          )}
          <button
            type="button"
            disabled={isContactChecking}
            className="relative z-20 flex-1 inline-flex items-center justify-center gap-1 h-7.5 rounded-lg bg-rose-600 px-2 text-[11px] font-semibold text-white shadow-xs shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-75 dark:shadow-none"
            onClick={onContactClick}
          >
            {isContactChecking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <PhoneCall className="h-3 w-3" />
            )}
            <span>{isContactChecking ? "Checking..." : "Contact"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-0 flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
      <div className="flex flex-wrap gap-1.5">
        {contextBadge && <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{contextBadge}</span>}
        {posterBadge && <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">{posterBadge}</span>}
        {type && <span className="hidden rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">{type}</span>}
      </div>

      <div>
        <h2 title={title} className="text-[15px] font-bold leading-snug text-zinc-950 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 sm:line-clamp-2 sm:text-base">
          {displayTitle}
        </h2>
        {subtitle && (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-slate-400 sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
      </div>

      <p className="text-lg font-black tracking-tight text-zinc-950 dark:text-white sm:text-xl">{price}</p>

      <div className="grid grid-cols-2 gap-1.5 text-xs font-medium text-zinc-700 dark:text-slate-300 sm:gap-2">
        {!isPg && bedrooms != null && bedrooms > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-slate-800/80 sm:px-2.5">
            <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
            {bedrooms} BHK
          </span>
        )}
        {bathrooms != null && bathrooms > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-slate-800/80 sm:px-2.5">
            <Bath className="h-3.5 w-3.5 text-zinc-400" />
            {bathrooms} Bath
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-slate-800/80 sm:px-2.5">
          <Ruler className="h-3.5 w-3.5 text-zinc-400" />
          <span className="truncate">{area}</span>
        </span>
        <span className="truncate rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-slate-800/80 sm:px-2.5">{owner}</span>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 border-t border-zinc-100 pt-2.5 dark:border-slate-800 sm:gap-2.5 sm:pt-3">
        <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:items-center">
          {onScheduleClick && (
            <button
              type="button"
              title="Schedule a Site Visit"
              className="relative z-20 inline-flex shrink-0 items-center justify-center gap-1 min-h-9 py-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              onClick={onScheduleClick}
            >
              <Calendar className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>Visit</span>
            </button>
          )}
          <button
            type="button"
            disabled={isContactChecking}
            className="relative z-20 inline-flex shrink-0 items-center justify-center gap-1.5 min-h-9 py-1.5 rounded-md bg-rose-600 px-3 text-xs font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-75 dark:shadow-none"
            onClick={onContactClick}
          >
            {isContactChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PhoneCall className="h-3.5 w-3.5" />
            )}
            <span>{isContactChecking ? "Checking..." : "Contact"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
