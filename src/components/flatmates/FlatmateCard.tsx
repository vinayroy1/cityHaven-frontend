"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Home,
  Search,
  Users,
  Cigarette,
  PawPrint,
  Utensils,
  Moon,
  Sun,
  Briefcase,
  BedDouble,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlatmateInterestModal } from "./FlatmateInterestModal";
import type { FlatmateListing } from "@/types/flatmate.types";

interface FlatmateCardProps {
  listing: FlatmateListing;
}

export function FlatmateCard({ listing }: FlatmateCardProps) {
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

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
      <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900/60">
        <div>
          {/* Card Media / Header Banner */}
          <div className="relative mb-3.5 h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-100 via-rose-50/30 to-amber-50/40 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
            {photo ? (
              <img
                src={photo}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-md backdrop-blur dark:bg-slate-800/80">
                  <ModeIcon className="h-7 w-7 text-rose-500" />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {listing.mode === "HAVE_ROOM" ? "Room in Shared Flat" : "Roommate Seeking Flat"}
                </span>
              </div>
            )}

            {/* Mode Tag */}
            <div className="absolute left-3 top-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md ${badge.className}`}
              >
                <ModeIcon className="h-3 w-3" />
                <span>{badge.label}</span>
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3">
              <div className="rounded-xl bg-slate-950/80 px-3 py-1.5 text-white backdrop-blur-md shadow-lg">
                <span className="text-base font-extrabold tracking-tight">{formattedRent()}</span>
                <span className="text-[11px] font-medium text-slate-300 ml-1">
                  {listing.mode === "HAVE_ROOM" ? "/mo" : "budget"}
                </span>
              </div>
            </div>

            {/* Photo count badge */}
            {listing.photos?.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                1 of {listing.photos.length} photos
              </div>
            )}
          </div>

          {/* Title & Location */}
          <div className="space-y-1.5 px-1">
            <Link href={`/flatmates/${listing.slug}`} className="block">
              <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                {listing.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span className="line-clamp-1">
                {listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1">
            {listing.roomType && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <BedDouble className="h-3 w-3 text-slate-500" />
                {listing.roomType}
              </span>
            )}
            {listing.furnishing && (
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {listing.furnishing}
              </span>
            )}
            {listing.availableFrom && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Calendar className="h-3 w-3 text-slate-500" />
                {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Lifestyle & Compatibility Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1 px-1">
            {listing.preferredGenders?.length > 0 && (
              <Badge
                variant="outline"
                className="border-rose-200 bg-rose-50/50 text-[10px] font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {listing.preferredGenders.join(" / ")}
              </Badge>
            )}
            {listing.preferredDiet && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-0.5 border-emerald-200 bg-emerald-50/50 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <Utensils className="h-2.5 w-2.5" />
                <span>{listing.preferredDiet}</span>
              </Badge>
            )}
            {listing.petsAllowed && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-0.5 border-amber-200 bg-amber-50/50 text-[10px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <PawPrint className="h-2.5 w-2.5" />
                <span>Pet-friendly</span>
              </Badge>
            )}
            {listing.smokingAllowed === false && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-0.5 border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
              >
                <span>Non-smoker</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Card Footer: Poster Mini Profile + Connect Button */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 font-bold text-white shadow-inner flex items-center justify-center text-xs">
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
                  <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                )}
              </div>
              <p className="line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
                {profile?.occupation || (listing.mode === "HAVE_ROOM" ? "Flat Host" : "Looking to move")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsInterestModalOpen(true)}
              className="h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 shadow-sm transition-transform active:scale-95"
            >
              <HeartHandshake className="w-3.5 h-3.5 mr-1" />
              Connect
            </Button>
            <Link
              href={`/flatmates/${listing.slug}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="View flatmate details"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <FlatmateInterestModal
        listing={listing}
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
      />
    </>
  );
}
