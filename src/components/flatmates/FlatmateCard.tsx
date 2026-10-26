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

  const isPlaceListing = listing.mode === "HAVE_ROOM";

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

  const roomPhoto = listing.photos?.[0];
  const profile = listing.profile;
  const avatarPhoto = profile?.profilePhoto || (!isPlaceListing ? listing.photos?.[0] : undefined);
  const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : undefined;
  const preferredAreas = listing.preferredLocalities?.filter(Boolean).slice(0, 3) || [];
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
        className={`group relative flex h-full w-full min-h-[420px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-900 ${
          listing.isBoosted
            ? "border-amber-400 ring-2 ring-amber-200/60 dark:border-amber-600 dark:ring-amber-900/40"
            : "border-slate-200/90 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900/60"
        }`}
      >
        <div className="flex flex-1 flex-col">
          {/* ======================================================== */}
          {/* UNIFIED HEADER: Exactly h-36 sm:h-40 for all 3 variants   */}
          {/* ======================================================== */}
          {isPlaceListing ? (
            /* Variant 1: Room Available (Landscape Photo Header) */
            <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-gradient-to-tr from-slate-100 via-rose-50/30 to-amber-50/40 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
              {roomPhoto ? (
                <img
                  src={roomPhoto}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                  <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-xs backdrop-blur dark:bg-slate-800/80">
                    <ModeIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Room in Shared Flat
                  </span>
                </div>
              )}

              {/* Gradient Scrim */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/25" />

              {/* Mode Tag */}
              <div className="absolute left-2.5 top-2.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md ${badge.className}`}
                >
                  <ModeIcon className="h-2.5 w-2.5" />
                  <span>{badge.label}</span>
                </span>
              </div>
              {listing.isBoosted && (
                <span className="absolute left-2.5 top-10 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-amber-950 shadow">
                  ⭐ FEATURED
                </span>
              )}

              {/* Compatibility Score */}
              {listing.compatibilityScore != null && (
                <div className="absolute right-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 shadow-xs backdrop-blur dark:bg-slate-900/95 dark:text-emerald-300">
                  {listing.compatibilityScore}% match
                </div>
              )}

              {/* Price Badge */}
              <div className="absolute bottom-2 left-2.5">
                <div className="rounded-lg bg-slate-950/85 px-2.5 py-1 text-white backdrop-blur-md shadow-md">
                  <span className="text-sm font-extrabold tracking-tight sm:text-base">
                    {formattedRent()}
                  </span>
                  <span className="text-[10px] font-medium text-slate-300 ml-1">/mo</span>
                </div>
              </div>

              {/* Photo count badge */}
              {listing.photos && listing.photos.length > 1 && (
                <div className="absolute bottom-2 right-2.5 rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                  1 of {listing.photos.length} photos
                </div>
              )}
            </div>
          ) : (
            /* Variant 2 & 3: Seeking Room / Buddy Up (Profile Header) */
            <div
              className={`relative h-36 sm:h-40 w-full overflow-hidden flex flex-col justify-between p-2.5 select-none ${
                listing.mode === "BUDDY_UP"
                  ? "bg-gradient-to-tr from-amber-600/90 via-orange-500/85 to-rose-500/80 dark:from-amber-950 dark:via-orange-950 dark:to-slate-900"
                  : "bg-gradient-to-tr from-indigo-600/90 via-purple-600/80 to-pink-500/80 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900"
              }`}
            >
              {/* Header Top Controls */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md ${badge.className}`}
                >
                  <ModeIcon className="h-2.5 w-2.5" />
                  <span>{badge.label}</span>
                </span>

                <div className="flex items-center gap-1">
                  {listing.isBoosted && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-amber-950 shadow">
                      ⭐ FEATURED
                    </span>
                  )}
                  {listing.compatibilityScore != null && (
                    <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 shadow-xs backdrop-blur dark:bg-slate-900/95 dark:text-emerald-300">
                      {listing.compatibilityScore}% match
                    </span>
                  )}
                </div>
              </div>

              {/* Centered Large Portrait Avatar */}
              <div className="flex justify-center -my-1">
                <div className="relative">
                  <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full overflow-hidden ring-4 ring-white/90 dark:ring-slate-900/90 shadow-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl text-white">
                    {avatarPhoto ? (
                      <img
                        src={avatarPhoto}
                        alt={profile?.displayName || listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{(profile?.displayName || "R")[0].toUpperCase()}</span>
                    )}
                  </div>
                  {listing.mode === "BUDDY_UP" && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-white dark:ring-slate-900">
                      <Users className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Budget Badge at Bottom Left (matching HAVE_ROOM price placement) */}
              <div className="flex items-center justify-between w-full">
                <div className="rounded-lg bg-slate-950/85 px-2.5 py-1 text-white backdrop-blur-md shadow-md">
                  <span className="text-[10px] font-medium text-slate-300 mr-1.5 uppercase tracking-wide">
                    {listing.mode === "BUDDY_UP" ? "Team Budget" : "Max Budget"}
                  </span>
                  <span className="text-sm font-extrabold tracking-tight sm:text-base">
                    {formattedRent()}
                  </span>
                </div>
                {listing.roomType && (
                  <span className="rounded-full bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white/90">
                    {listing.roomType}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* UNIFIED CARD BODY: Flex-1 ensuring aligned bottoms        */}
          {/* ======================================================== */}
          <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 space-y-2">
            {isPlaceListing ? (
              /* HAVE_ROOM Body */
              <div className="space-y-2">
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
                      Available{" "}
                      {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Cost and Occupancy details */}
                {(listing.deposit != null ||
                  listing.maintenance != null ||
                  listing.currentOccupants != null ||
                  listing.spotsAvailable > 0 ||
                  listing.minimumStayMonths != null) && (
                  <div className="rounded-lg bg-slate-50/90 px-2 py-1.5 text-[10px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {listing.deposit != null && (
                        <span>
                          <strong>{formatMoney(listing.deposit)}</strong> deposit
                        </span>
                      )}
                      {listing.deposit != null && listing.maintenance != null && (
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                      )}
                      {listing.maintenance != null && (
                        <span>
                          <strong>{formatMoney(listing.maintenance)}</strong> maintenance
                        </span>
                      )}
                      {(listing.deposit != null || listing.maintenance != null) &&
                        (listing.currentOccupants != null ||
                          listing.spotsAvailable > 0 ||
                          listing.minimumStayMonths != null) && (
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                        )}
                      {listing.currentOccupants != null && (
                        <span>
                          {listing.currentOccupants} current occupant{listing.currentOccupants === 1 ? "" : "s"}
                        </span>
                      )}
                      {listing.currentOccupants != null && listing.spotsAvailable > 0 && (
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                      )}
                      {listing.spotsAvailable > 0 && (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {listing.spotsAvailable} spot{listing.spotsAvailable === 1 ? "" : "s"} open
                        </span>
                      )}
                      {(listing.spotsAvailable > 0 || listing.currentOccupants != null) &&
                        listing.minimumStayMonths != null && (
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                        )}
                      {listing.minimumStayMonths != null && (
                        <span>{listing.minimumStayMonths}+ month stay</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* NEED_ROOM / BUDDY_UP Body */
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-slate-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                      {profile?.displayName || (listing.mode === "BUDDY_UP" ? "Buddy-Up Group" : "Room Seeker")}
                    </h3>
                    {age && (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        · {age} yrs
                      </span>
                    )}
                    {profile?.isIdentityVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="h-3 w-3 shrink-0" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {[profile?.gender, profile?.occupation, profile?.companyOrCollege ? `@ ${profile.companyOrCollege}` : ""].filter(Boolean).join(" · ") || listing.title}
                  </p>
                </div>

                {/* Preferred Areas / Target Locality Box */}
                {preferredAreas.length > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50/70 px-2 py-1.5 text-[10px] text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                    <MapPin className="h-3 w-3 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="line-clamp-1">
                      <strong>Preferred areas:</strong> {preferredAreas.join(" · ")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0 text-rose-500" />
                    <span className="line-clamp-1">
                      {listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}
                    </span>
                  </div>
                )}

                {/* Preferences specs row */}
                <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
                  {listing.bhk && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {listing.bhk} BHK preferred
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
                      Move-in{" "}
                      {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Bio snippet */}
                {(profile?.bio || listing.description) && (
                  <p className="line-clamp-1 text-[11px] italic text-slate-500 dark:text-slate-400">
                    &ldquo;{profile?.bio || listing.description}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Lifestyle Badges (clamped to 1 clean row) */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {listing.compatibilityReasons?.slice(0, 1).map((reason) => (
                <Badge
                  key={reason}
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
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
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
                >
                  No drinking
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* UNIFIED CARD FOOTER: Equal height border-t bar            */}
        {/* ======================================================== */}
        <div className="flex h-12 items-center justify-between border-t border-slate-100 px-3 sm:px-3.5 dark:border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            {isPlaceListing ? (
              <>
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 font-bold text-white shadow-inner flex items-center justify-center text-[11px]">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={profile.displayName || "Host"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{(profile?.displayName || "R")[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="line-clamp-1 text-xs font-bold text-slate-900 dark:text-slate-100">
                      {profile?.displayName || "Flat Host"}
                    </span>
                    {profile?.isIdentityVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3 shrink-0" />
                        <span className="hidden xl:inline">Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-[9px] text-slate-500 dark:text-slate-400">
                    {[profile?.gender, age ? `${age} yrs` : "", profile?.occupation].filter(Boolean).join(" · ") ||
                      "Flat Host"}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="line-clamp-1 font-medium">
                  {listing.availableFrom
                    ? `Move-in: ${new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}`
                    : "Flexible move-in"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setIsInterestModalOpen(true);
              }}
              className={`h-7 rounded-full text-white font-semibold text-[11px] px-3 shadow-xs transition-transform active:scale-95 ${
                listing.mode === "BUDDY_UP"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : listing.mode === "NEED_ROOM"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              <HeartHandshake className="w-3 h-3 mr-1" />
              {listing.mode === "BUDDY_UP" ? "Team Up" : "Connect"}
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
