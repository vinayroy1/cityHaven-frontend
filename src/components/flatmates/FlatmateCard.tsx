"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Home,
  Search,
  Users,
  PawPrint,
  Utensils,
  BedDouble,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlatmateInterestModal } from "./FlatmateInterestModal";
import type { FlatmateListing } from "@/types/flatmate.types";

interface FlatmateCardProps {
  listing: FlatmateListing;
}

export function FlatmateCard({ listing }: FlatmateCardProps) {
  const router = useRouter();
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const detailsHref = `/flatmates/${listing.slug}`;

  const modeBadge = () => {
    switch (listing.mode) {
      case "HAVE_ROOM":
        return {
          label: listing.bhk ? `${listing.bhk} BHK • Room Available` : "Room Available",
          icon: Home,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "NEED_ROOM":
        return {
          label: "Looking for Room",
          icon: Search,
          className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
        };
      case "BUDDY_UP":
        return {
          label: "Buddy Up • Team to Rent",
          icon: Users,
          className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
        };
    }
  };

  const badge = modeBadge();
  const ModeIcon = badge.icon;

  const photo = listing.photos?.[0];
  const profile = listing.profile;
  const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : undefined;
  const preferredAreas = listing.preferredLocalities?.filter(Boolean).slice(0, 2) || [];
  const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const formattedRent = () => {
    if (listing.mode === "HAVE_ROOM") {
      return listing.rent != null ? `₹${listing.rent.toLocaleString("en-IN")}` : "Rent on Request";
    }
    if (listing.budgetMin != null && listing.budgetMax != null) {
      return `₹${listing.budgetMin.toLocaleString("en-IN")} - ₹${listing.budgetMax.toLocaleString("en-IN")}`;
    }
    return listing.budgetMax != null ? `Up to ₹${listing.budgetMax.toLocaleString("en-IN")}` : "Flexible";
  };

  return (
    <>
      <article
        role="link"
        tabIndex={0}
        aria-label={`View details for ${listing.title}`}
        onClick={() => router.push(detailsHref)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(detailsHref);
          }
        }}
        className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900/60"
      >
        <div>
          {/* Card Media / Header Banner - Full-bleed Property Details Card Style */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-gradient-to-tr from-slate-100 via-rose-50/30 to-amber-50/40 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
            {photo ? (
              <img
                src={photo}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-xs backdrop-blur dark:bg-slate-800/80">
                  <ModeIcon className="h-5 w-5 text-rose-500" />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {listing.mode === "HAVE_ROOM" ? "Room in Shared Flat" : "Roommate Seeking Flat"}
                </span>
              </div>
            )}

            {/* Gradient Scrim for readable badges */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

            {/* Mode Tag */}
            <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-xs backdrop-blur-md ${badge.className}`}
              >
                <ModeIcon className="h-2.5 w-2.5" />
                <span>{badge.label}</span>
              </span>
            </div>

            {/* Compatibility Score */}
            {listing.compatibilityScore != null && (
              <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 shadow-xs backdrop-blur dark:bg-slate-900/95 dark:text-emerald-300">
                {listing.compatibilityScore}% match
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-2.5 left-2.5 sm:left-3 sm:bottom-3">
              <div className="rounded-lg bg-slate-950/85 px-2.5 py-1 text-white backdrop-blur-md shadow-md">
                <span className="text-sm font-extrabold tracking-tight sm:text-base">{formattedRent()}</span>
                <span className="text-[10px] font-medium text-slate-300 ml-1">
                  {listing.mode === "HAVE_ROOM" ? "/mo" : "budget"}
                </span>
              </div>
            </div>

            {/* Photo count badge */}
            {listing.photos && listing.photos.length > 1 && (
              <div className="absolute bottom-2.5 right-2.5 sm:right-3 sm:bottom-3 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                1 of {listing.photos.length} photos
              </div>
            )}
          </div>

          {/* Card Body Content with Spacing */}
          <div className="space-y-2 p-3 sm:p-3.5">
            {/* Title & Location */}
            <div className="space-y-1">
              <h3 className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-rose-600 sm:text-base dark:text-white dark:group-hover:text-rose-400">
                {listing.title}
              </h3>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
                <MapPin className="h-3 w-3 shrink-0 text-rose-500" />
                <span className="line-clamp-1">
                  {listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}
                </span>
              </div>
            </div>

            {/* Quick Specifications Row */}
            <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
            {listing.roomType && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <BedDouble className="h-2.5 w-2.5 text-slate-500" />
                {listing.roomType}
              </span>
            )}
            {listing.furnishing && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {listing.furnishing}
              </span>
            )}
            {listing.availableFrom && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Calendar className="h-2.5 w-2.5 text-slate-500" />
                {listing.mode === "HAVE_ROOM" ? "Available " : "Move-in "}
                {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {listing.mode !== "HAVE_ROOM" && listing.bhk && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {listing.bhk} BHK preferred
              </span>
            )}
          </div>

          {/* Mode-specific Decision Details (Compact Box) */}
          {listing.mode === "HAVE_ROOM" ? (
            (listing.deposit != null || listing.maintenance != null || listing.currentOccupants != null || listing.spotsAvailable > 0 || listing.minimumStayMonths != null) && (
              <div className="mt-2 rounded-lg bg-slate-50/90 px-2 py-1.5 text-[10px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {listing.deposit != null && (
                    <span><strong>{formatMoney(listing.deposit)}</strong> deposit</span>
                  )}
                  {listing.deposit != null && listing.maintenance != null && <span className="text-slate-300 dark:text-slate-600">·</span>}
                  {listing.maintenance != null && (
                    <span><strong>{formatMoney(listing.maintenance)}</strong> maintenance</span>
                  )}
                  {(listing.deposit != null || listing.maintenance != null) && (listing.currentOccupants != null || listing.spotsAvailable > 0 || listing.minimumStayMonths != null) && (
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                  )}
                  {listing.currentOccupants != null && (
                    <span>{listing.currentOccupants} current occupant{listing.currentOccupants === 1 ? "" : "s"}</span>
                  )}
                  {listing.currentOccupants != null && listing.spotsAvailable > 0 && <span className="text-slate-300 dark:text-slate-600">·</span>}
                  {listing.spotsAvailable > 0 && (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {listing.spotsAvailable} spot{listing.spotsAvailable === 1 ? "" : "s"} open
                    </span>
                  )}
                  {(listing.spotsAvailable > 0 || listing.currentOccupants != null) && listing.minimumStayMonths != null && (
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                  )}
                  {listing.minimumStayMonths != null && (
                    <span>{listing.minimumStayMonths}+ month stay</span>
                  )}
                </div>
              </div>
            )
          ) : preferredAreas.length > 0 ? (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-50/70 px-2 py-1.5 text-[10px] text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1"><strong>Preferred areas:</strong> {preferredAreas.join(" · ")}</span>
            </div>
          ) : null}

          {/* Lifestyle Badges (Streamlined 1-row) */}
          <div className="mt-2 flex flex-wrap items-center gap-1 px-0.5">
            {listing.compatibilityReasons?.slice(0, 1).map((reason) => (
              <Badge key={reason} variant="outline" className="border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                <Sparkles className="mr-0.5 h-2 w-2" /> {reason}
              </Badge>
            ))}
            {(listing.preferredGenders?.length ?? 0) > 0 && (
              <Badge
                variant="outline"
                className="border-rose-200 bg-rose-50/50 px-1.5 py-0 text-[9px] font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {listing.preferredGenders?.join(" / ")}
              </Badge>
            )}
            {listing.preferredDiet && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-0.5 border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <Utensils className="h-2 w-2" />
                <span>{listing.preferredDiet}</span>
              </Badge>
            )}
            {listing.petsAllowed && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-0.5 border-amber-200 bg-amber-50/50 px-1.5 py-0 text-[9px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <PawPrint className="h-2 w-2" />
                <span>Pet-friendly</span>
              </Badge>
            )}
            {listing.smokingAllowed === false && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-0.5 border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
              >
                <span>Non-smoker</span>
              </Badge>
            )}
            {listing.drinkingAllowed === false && (
              <Badge variant="outline" className="border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                No drinking
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Poster Mini Profile + Connect Button */}
        <div className="flex items-center justify-between border-t border-slate-100 p-3 pt-2.5 sm:p-3.5 sm:pt-2.5 dark:border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 font-bold text-white shadow-inner flex items-center justify-center text-[11px]">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.displayName || "Roomie"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{(profile?.displayName || "R")[0].toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="line-clamp-1 text-xs font-bold text-slate-900 dark:text-slate-100">
                  {profile?.displayName || "Flatmate"}
                </span>
                {profile?.isIdentityVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    <span className="hidden xl:inline">Verified</span>
                  </span>
                )}
              </div>
              <p className="line-clamp-1 text-[9px] text-slate-500 dark:text-slate-400">
                {[profile?.gender, age ? `${age} yrs` : "", profile?.occupation].filter(Boolean).join(" · ") || (listing.mode === "HAVE_ROOM" ? "Flat Host" : "Looking to move")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setIsInterestModalOpen(true);
              }}
              className="h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] px-3 shadow-xs transition-transform active:scale-95"
            >
              <HeartHandshake className="w-3 h-3 mr-1" />
              Connect
            </Button>
          </div>
        </div>
      </article>

      <FlatmateInterestModal
        listing={listing}
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
      />
    </>
  );
}
