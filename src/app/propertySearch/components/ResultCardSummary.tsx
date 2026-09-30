"use client";

import React from "react";
import { Bath, BedDouble, Heart, MapPin, PhoneCall, Ruler } from "lucide-react";

type ResultCardSummaryProps = {
  title?: string;
  subtitle?: string;
  price?: string;
  area?: string;
  owner?: string;
  postedAt?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
  contextBadge: string | null;
  posterBadge?: string;
  onContactClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "@/features/propertyListing/api";
import { APP_CONFIG } from "@/constants/app-config";

type SavePropertyButtonProps = {
  propertyId?: number | string;
  initialSaved?: boolean;
};

export function SavePropertyButton({ propertyId, initialSaved = false }: SavePropertyButtonProps) {
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
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
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
  postedAt,
  bedrooms,
  bathrooms,
  type,
  contextBadge,
  posterBadge,
  onContactClick,
}: ResultCardSummaryProps) {
  return (
    <div className="relative z-0 flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
      <div className="flex flex-wrap gap-1.5">
        {contextBadge && <span className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{contextBadge}</span>}
        {posterBadge && <span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">{posterBadge}</span>}
        {type && <span className="hidden rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">{type}</span>}
      </div>

      <div>
        <h3 className="line-clamp-1 text-sm font-semibold text-zinc-950 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 sm:line-clamp-2 sm:text-base">
          {title || "Property listing"}
        </h3>
        {subtitle && (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-zinc-600 dark:text-slate-400 sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
      </div>

      <p className="text-base font-bold text-zinc-950 dark:text-white sm:text-lg">{price}</p>

      <div className="grid grid-cols-2 gap-1.5 text-xs text-zinc-700 dark:text-slate-300 sm:gap-2">
        {bedrooms != null && bedrooms > 0 && (
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

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-slate-800 pt-2.5 sm:gap-3 sm:pt-3">
        <p className="truncate text-xs text-zinc-500 dark:text-slate-400">{postedAt}</p>
        <button
          type="button"
          className="relative z-20 inline-flex shrink-0 items-center gap-1.5 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 sm:text-sm"
          onClick={onContactClick}
        >
          <PhoneCall className="h-3.5 w-3.5" />
          View contact
        </button>
      </div>
    </div>
  );
}
