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

  return (
    <div className={`relative z-0 flex flex-1 flex-col ${compact ? "gap-1.5 p-2.5 sm:gap-2 sm:p-3" : "gap-2.5 p-3 sm:gap-3 sm:p-4"}`}>
      <div className="flex flex-wrap gap-1.5">
        {contextBadge && <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{contextBadge}</span>}
        {posterBadge && <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">{posterBadge}</span>}
        {type && <span className="hidden rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">{type}</span>}
      </div>

      <div>
        <h2 title={title} className={`line-clamp-1 font-bold leading-snug text-zinc-950 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 ${compact ? "text-sm sm:text-[15px]" : "text-[15px] sm:line-clamp-2 sm:text-base"}`}>
          {displayTitle}
        </h2>
        {subtitle && (
          <p className={`flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-slate-400 ${compact ? "mt-0.5 sm:mt-1" : "mt-1 sm:text-sm"}`}>
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
      </div>

      <p className={`font-black tracking-tight text-zinc-950 dark:text-white ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>{price}</p>

      {compact && decisionDetails?.length ? (
        <div className="flex min-w-0 items-center overflow-hidden rounded-md bg-zinc-50 px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-slate-800/80 dark:text-slate-300 sm:py-1.5">
          {decisionDetails.slice(0, 3).map((detail, index) => (
            <span
              key={`${detail}-${index}`}
              className={`min-w-0 truncate whitespace-nowrap ${index > 0 ? "ml-2 border-l border-zinc-200 pl-2 dark:border-slate-700" : ""}`}
              title={detail}
            >
              {detail}
            </span>
          ))}
        </div>
      ) : compact ? (
        <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-md bg-zinc-50 px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-slate-800/80 dark:text-slate-300 sm:py-1.5">
          {!isPg && bedrooms != null && bedrooms > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
              <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
              {bedrooms} BHK
            </span>
          )}
          {bathrooms != null && bathrooms > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap border-l border-zinc-200 pl-2 dark:border-slate-700">
              <Bath className="h-3.5 w-3.5 text-zinc-400" />
              {bathrooms} Bath
            </span>
          )}
          {compactArea && (
            <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap border-l border-zinc-200 pl-2 dark:border-slate-700">
              <Ruler className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{compactArea}</span>
            </span>
          )}
        </div>
      ) : (
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
        {!compact && <span className="truncate rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-slate-800/80 sm:px-2.5">{owner}</span>}
      </div>
      )}

      <div className={`mt-auto flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-slate-800 ${compact ? "pt-1.5 sm:pt-2" : "pt-2.5 sm:gap-2.5 sm:pt-3"}`}>
        <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:items-center">
          {onScheduleClick && (
            <button
              type="button"
              title="Schedule a Site Visit"
              className={`relative z-20 inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 sm:px-2.5 ${compact ? "min-h-8 py-1" : "min-h-9 py-1.5"}`}
              onClick={onScheduleClick}
            >
              <Calendar className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>Visit</span>
            </button>
          )}
          <button
            type="button"
            disabled={isContactChecking}
            className={`relative z-20 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-rose-600 px-2 text-xs font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-75 sm:px-3 ${compact ? "min-h-8 py-1" : "min-h-9 py-1.5"}`}
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
