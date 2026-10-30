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
  Coffee,
  Compass,
  Headphones,
  Laptop,
  Music,
  Smile,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FlatmateListing } from "@/types/flatmate.types";
import { useCardImageSwipe } from "@/components/common/useCardImageSwipe";
import { SeekerAvatarPlaceholder } from "./SeekerAvatarPlaceholder";

export const isRealUserPhoto = (url?: string | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes("avatar_rose.svg") ||
    lower.includes("avatar_amber.svg") ||
    lower.includes("avatar_blue.svg") ||
    lower.includes("advisors/avatars/avatar_") ||
    lower.includes("default_avatar") ||
    lower.includes("placeholder")
  ) {
    return false;
  }
  return true;
};

const FlatmateContactModal = dynamic(
  () => import("./FlatmateContactModal").then((mod) => mod.FlatmateContactModal),
  { ssr: false }
);

export interface FlatmateCardProps {
  listing: FlatmateListing;
  priority?: boolean;
  layout?: "auto" | "vertical" | "horizontal";
}

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

export function FlatmateCard({
  listing,
  priority = false,
  layout = "auto",
}: FlatmateCardProps) {
  const router = useRouter();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const detailsHref = `/flatmates/${listing.slug}`;

  const isPlaceListing = listing.mode === "HAVE_ROOM";
  const isForceVertical = layout === "vertical";
  const isForceHorizontal = layout === "horizontal";
  const isVertical = isForceVertical;

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
          className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
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

  const safePhotos = Array.from(new Set((listing.photos || []).map(normalizeR2Url).filter(Boolean)));
  const {
    activeImage,
    nextImage,
    prevImage,
    hasCarousel,
    hasInteracted,
    handleMouseEnter,
    containerRef: imageContainerRef,
    handleClickCapture,
    handleCardTouchStart,
    handleCardTouchMove,
    handleCardTouchEnd,
    isCardDragged,
  } = useCardImageSwipe({
    images: safePhotos,
    totalImages: safePhotos.length,
  });

  const roomPhoto = safePhotos[activeImage] || safePhotos[0] || normalizeR2Url(listing.photos?.[0]);
  const profile = listing.profile;
  const hostPhoto = normalizeR2Url(profile?.profilePhoto);
  const avatarPhoto = hostPhoto || (!isPlaceListing ? roomPhoto : undefined);
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

  if (isPlaceListing) {
    return (
      <>
        <article
          role="link"
          tabIndex={0}
          aria-label={`View details for ${listing.title}`}
          onClick={() => {
            if (isCardDragged()) return;
            router.push(detailsHref);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(detailsHref);
            }
          }}
          onTouchStart={handleCardTouchStart}
          onTouchMove={handleCardTouchMove}
          onTouchEnd={handleCardTouchEnd}
          onMouseEnter={handleMouseEnter}
          className={`group relative flex w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-900 h-full ${
            listing.isBoosted
              ? "border-amber-400 ring-2 ring-amber-200/60 dark:border-amber-600 dark:ring-amber-900/40"
              : "border-slate-200/90 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900/60"
          }`}
        >
          <div className="flex flex-col sm:flex-1">
            {/* Variant 1: Room Available (16:10 Landscape Photo Banner) */}
            <div
              ref={imageContainerRef}
              onClickCapture={handleClickCapture}
              className="relative aspect-[16/10] w-full overflow-hidden select-none touch-pan-y bg-gradient-to-tr from-slate-100 via-rose-50/30 to-amber-50/40 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900"
            >
              {roomPhoto ? (
                <img
                  src={roomPhoto}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                  loading={hasInteracted || priority ? "eager" : "lazy"}
                  fetchPriority={hasInteracted || priority ? "high" : "auto"}
                  decoding="async"
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

              {/* Desktop prev/next chevron buttons */}
              {hasCarousel && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 z-20 hidden sm:inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-md transition hover:bg-white focus:opacity-100 sm:left-2.5 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 z-20 hidden sm:inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-md transition hover:bg-white focus:opacity-100 sm:right-2.5 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Mode Tag */}
              <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md ${badge.className}`}
                >
                  <ModeIcon className="h-2.5 w-2.5" />
                  <span>{badge.label}</span>
                </span>
              </div>

              {listing.isBoosted && (
                <span className="absolute left-2.5 top-9 z-10 pointer-events-none rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-amber-950 shadow">
                  ⭐ FEATURED
                </span>
              )}

              {/* Compatibility Score */}
              {listing.compatibilityScore != null && (
                <div className="absolute right-2.5 top-2.5 z-10 pointer-events-none rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 shadow-xs backdrop-blur dark:bg-slate-900/95 dark:text-emerald-300">
                  {listing.compatibilityScore}% match
                </div>
              )}

              {/* Price Overlay on Photo */}
              <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 drop-shadow-xs">
                  Monthly Rent
                </span>
                <p className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md">
                  {formattedRent()}
                  <span className="text-[10px] font-normal text-slate-300 ml-1">/mo</span>
                </p>
              </div>

              {/* Photo count badge */}
              {hasCarousel && (
                <div className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs backdrop-blur-md pointer-events-none">
                  <Camera className="h-2.5 w-2.5" />
                  <span>
                    {activeImage + 1} of {safePhotos.length}
                  </span>
                </div>
              )}
            </div>

            {/* CARD BODY: Clean Typography & Balanced Padding */}
            <div className="flex flex-col sm:flex-1 sm:justify-between p-3 sm:p-3.5 space-y-2">
              <div className="space-y-2">
                <div className="space-y-1">
                  <h3 className="truncate text-sm sm:text-base font-bold text-slate-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                    {listing.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span className="truncate font-medium">
                      {listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}
                    </span>
                  </div>
                </div>

                {/* Quick Specs: Horizontal scrolling chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px] whitespace-nowrap">
                  {listing.roomType && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <BedDouble className="h-3 w-3 text-slate-500" />
                      {listing.roomType}
                    </span>
                  )}
                  {listing.furnishing && (
                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {listing.furnishing}
                    </span>
                  )}
                  {listing.availableFrom && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      Available{" "}
                      {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Financial & Occupancy Decision Row: Horizontal scrolling chips */}
                <div className="rounded-lg bg-slate-50/90 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 overflow-hidden">
                  <div className="flex items-center gap-x-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[11px]">
                    {listing.deposit != null ? (
                      <>
                        <span className="shrink-0">
                          <strong>{formatMoney(listing.deposit)}</strong> deposit
                        </span>
                        {listing.maintenance != null && (
                          <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                        )}
                        {listing.maintenance != null && (
                          <span className="shrink-0">
                            <strong>{formatMoney(listing.maintenance)}</strong> maintenance
                          </span>
                        )}
                        {(listing.currentOccupants != null || listing.spotsAvailable > 0) && (
                          <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                        )}
                        {listing.currentOccupants != null && (
                          <span className="shrink-0">
                            {listing.currentOccupants} current occupant{listing.currentOccupants === 1 ? "" : "s"}
                          </span>
                        )}
                        {listing.currentOccupants != null && listing.spotsAvailable > 0 && (
                          <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                        )}
                        {listing.spotsAvailable > 0 && (
                          <span className="shrink-0 font-semibold text-emerald-700 dark:text-emerald-400">
                            {listing.spotsAvailable} spot open
                          </span>
                        )}
                        {listing.minimumStayMonths != null && (
                          <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                        )}
                        {listing.minimumStayMonths != null && (
                          <span className="shrink-0">
                            {listing.minimumStayMonths}+ month stay
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="shrink-0 text-slate-500 dark:text-slate-400">
                        Direct from flatmate · Zero brokerage · Flexible stay
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lifestyle Badges: Horizontal scrolling chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-nowrap pt-1 sm:mt-auto py-0.5 whitespace-nowrap">
                {listing.compatibilityReasons?.map((reason) => (
                  <Badge
                    key={reason}
                    variant="outline"
                    className="shrink-0 border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <Sparkles className="mr-0.5 h-2 w-2" /> {reason}
                  </Badge>
                ))}
                {(listing.preferredGenders?.length ?? 0) > 0 && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-rose-200 bg-rose-50/50 px-1.5 py-0 text-[9px] font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                  >
                    {listing.preferredGenders?.join(" / ")}
                  </Badge>
                )}
                {listing.preferredDiet && (
                  <Badge
                    variant="outline"
                    className="shrink-0 inline-flex items-center gap-0.5 border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <Utensils className="h-2 w-2" />
                    <span>{listing.preferredDiet}</span>
                  </Badge>
                )}
                {listing.petsAllowed && (
                  <Badge
                    variant="outline"
                    className="shrink-0 inline-flex items-center gap-0.5 border-amber-200 bg-amber-50/50 px-1.5 py-0 text-[9px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    <PawPrint className="h-2 w-2" />
                    <span>Pet-friendly</span>
                  </Badge>
                )}
                {listing.smokingAllowed === false && (
                  <Badge
                    variant="outline"
                    className="shrink-0 inline-flex items-center gap-0.5 border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
                  >
                    <span>Non-smoker</span>
                  </Badge>
                )}
                {listing.drinkingAllowed === false && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
                  >
                    No drinking
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* UNIFIED FOOTER: Always fixed h-11 on mobile, h-12 on desktop */}
          <div className="flex h-11 sm:h-12 items-center justify-between border-t border-slate-100 px-3 sm:px-3.5 dark:border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 font-bold text-white shadow-inner flex items-center justify-center text-[11px]">
                {hostPhoto && isRealUserPhoto(hostPhoto) ? (
                  <img
                    src={hostPhoto}
                    alt={profile?.displayName || "Host"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>{(profile?.displayName || "R")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                    {profile?.displayName || "Flat Host"}
                  </span>
                  {profile?.isIdentityVerified && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      <span className="hidden xl:inline">Verified</span>
                    </span>
                  )}
                </div>
                <p className="truncate text-[9px] text-slate-500 dark:text-slate-400">
                  {[profile?.gender, age ? `${age} yrs` : "", profile?.occupation].filter(Boolean).join(" · ") ||
                    "Flat Host"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsContactModalOpen(true);
                }}
                className="h-7 rounded-full text-white font-semibold text-[11px] px-3 shadow-xs bg-rose-600 hover:bg-rose-700 transition-transform active:scale-95"
              >
                <HeartHandshake className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </article>

        {isContactModalOpen && (
          <FlatmateContactModal
            listing={listing}
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
          />
        )}
      </>
    );
  }

  /* ======================================================================= */
  /* VARIANT 2 & 3: Room Seeker (NEED_ROOM) & Buddy Up (BUDDY_UP)            */
  /* Mobile: Space-efficient horizontal split (left visual, right details)   */
  /* Desktop: Vertical card (sm:flex-col) matching Room Available grid height*/
  /* ======================================================================= */
  return (
    <>
      <article
        role="link"
        tabIndex={0}
        aria-label={`View details for ${profile?.displayName || listing.title}`}
        onClick={() => {
          if (isCardDragged()) return;
          router.push(detailsHref);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(detailsHref);
          }
        }}
        onTouchStart={handleCardTouchStart}
        onTouchMove={handleCardTouchMove}
        onTouchEnd={handleCardTouchEnd}
        className={`group relative flex w-full cursor-pointer justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-900 ${
          isForceVertical
            ? "flex-col h-full"
            : isForceHorizontal
            ? "flex-row h-[174px]"
            : "flex-row h-[174px] sm:h-full sm:flex-col"
        } ${
          listing.isBoosted
            ? "border-amber-400 ring-2 ring-amber-200/60 dark:border-amber-600 dark:ring-amber-900/40"
            : "border-slate-200/90 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900/60"
        }`}
      >
        {/* ================================================================ */}
        {/* VISUAL THUMBNAIL: Full area profile image                        */}
        {/* ================================================================ */}
        <div
          className={`relative shrink-0 select-none overflow-hidden ${
            isForceVertical
              ? "w-full aspect-[16/10] block border-b border-slate-100 dark:border-slate-800"
              : isForceHorizontal
              ? "w-[130px] xs:w-[135px] sm:w-[140px] h-full border-r border-slate-100 dark:border-slate-800"
              : "w-[130px] xs:w-[135px] sm:w-full h-full sm:h-auto sm:aspect-[16/10] border-r sm:border-r-0 sm:border-b border-slate-100 dark:border-slate-800"
          } bg-slate-100 dark:bg-slate-850`}
        >
          {isRealUserPhoto(avatarPhoto) ? (
            <>
              <img
                src={avatarPhoto!}
                alt={profile?.displayName || listing.title}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
              />
              {/* Subtle gradient overlay at bottom for depth on real photos */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            </>
          ) : (
            <SeekerAvatarPlaceholder
              displayName={profile?.displayName || listing.title}
              gender={profile?.gender}
              occupation={profile?.occupation}
              mode={listing.mode}
            />
          )}

          {/* Mode Tag overlay on image (Reduced font size to make fully visible) */}
          <div className="absolute left-1.5 top-1.5 z-10 pointer-events-none max-w-[calc(100%-12px)]">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] xs:text-[7.5px] font-bold shadow-xs backdrop-blur-md leading-none tracking-tight whitespace-nowrap ${badge.className}`}
            >
              <ModeIcon className="h-2 w-2 shrink-0" />
              <span>{badge.label}</span>
            </span>
          </div>

          {/* Featured badge if boosted */}
          {listing.isBoosted && (
            <span className="absolute left-1.5 bottom-1.5 z-10 pointer-events-none rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-black text-amber-950 shadow">
              ⭐ FEATURED
            </span>
          )}

          {/* Buddy-Up icon badge on photo corner */}
          {listing.mode === "BUDDY_UP" && (
            <span className="absolute bottom-1.5 right-1.5 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-white dark:ring-slate-900">
              <Users className="h-2.5 w-2.5" />
            </span>
          )}
        </div>

        {/* ================================================================ */}
        {/* DETAILS SECTION                                                  */}
        {/* ================================================================ */}
        <div
          className={`flex flex-1 min-w-0 flex-col justify-between h-full ${
            isForceVertical ? "p-3 sm:p-3.5 space-y-2" : "p-3 sm:p-3.5"
          }`}
        >
          <div className="space-y-1 min-w-0">
            {/* Row 1: Clean Name & Age */}
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="truncate text-xs sm:text-sm font-bold text-slate-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                {profile?.displayName || (listing.mode === "BUDDY_UP" ? "Buddy-Up Group" : "Room Seeker")}
              </h3>
              {age && (
                <span className="shrink-0 text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  ({age} yrs)
                </span>
              )}
            </div>

            {/* Row 2: Dedicated Budget Row (No ellipsis, full price guaranteed) */}
            <div className="flex items-baseline gap-1.5 min-w-0 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                {listing.mode === "BUDDY_UP" ? "Team Budget" : "Max Budget"}
              </span>
              <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 shrink-0">
                {formattedRent()}
              </span>
              <span className="text-[10px] font-normal text-slate-400 shrink-0">/mo</span>
            </div>

            {/* Row 4: Preferred Areas: One-line smooth scroll */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 overflow-x-auto no-scrollbar whitespace-nowrap min-w-0 py-0.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">Preferred areas: </span>
              <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                {preferredAreas.length > 0
                  ? preferredAreas.join(" · ")
                  : listing.locality || listing.cityName}
              </span>
              {listing.cityName && preferredAreas.length > 0 && (
                <span className="text-slate-400 text-[10px] shrink-0 font-normal">
                  ({listing.cityName})
                </span>
              )}
            </div>

            {/* Row 5: Compact Specifications & Occupation: Combined single horizontal scroll row */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] whitespace-nowrap min-w-0">
              {profile?.occupation && (
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {profile.occupation}
                </span>
              )}
              {listing.bhk && (
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {listing.bhk} BHK preferred
                </span>
              )}
              {listing.roomType && (
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {listing.roomType}
                </span>
              )}
              {listing.furnishing && (
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {listing.furnishing}
                </span>
              )}
              {(listing.preferredGenders?.length ?? 0) > 0 && (
                <Badge
                  variant="outline"
                  className="shrink-0 border-rose-200 bg-rose-50/50 px-1.5 py-0 text-[9px] font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  {listing.preferredGenders?.join(" / ")}
                </Badge>
              )}
              {listing.preferredDiet && (
                <Badge
                  variant="outline"
                  className="shrink-0 inline-flex items-center gap-0.5 border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <Utensils className="h-2 w-2" />
                  <span>{listing.preferredDiet}</span>
                </Badge>
              )}
              {listing.petsAllowed && (
                <Badge
                  variant="outline"
                  className="shrink-0 inline-flex items-center gap-0.5 border-amber-200 bg-amber-50/50 px-1.5 py-0 text-[9px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  <PawPrint className="h-2 w-2" />
                  <span>Pet-friendly</span>
                </Badge>
              )}
              {listing.smokingAllowed === false && (
                <Badge
                  variant="outline"
                  className="shrink-0 inline-flex items-center gap-0.5 border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
                >
                  <span>Non-smoker</span>
                </Badge>
              )}
            </div>

            {/* Row 6: Move-in Date Row (Moved above footer into available whitespace to eliminate ...) */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 min-w-0 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Move-in:</span>
              <span className="font-medium text-slate-600 dark:text-slate-300 shrink-0">
                {listing.availableFrom
                  ? new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Flexible move-in"}
              </span>
            </div>

            {/* In vertical mode, retain bio snippet and compatibility badges */}
            {isVertical && (
              <>
                <div className="rounded-lg bg-slate-50/90 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 overflow-hidden">
                  <p className="truncate italic">
                    {profile?.bio || listing.description
                      ? `“${profile?.bio || listing.description}”`
                      : [profile?.gender, profile?.occupation].filter(Boolean).join(" · ") || "Ready to move in"}
                  </p>
                </div>
                {listing.compatibilityReasons && listing.compatibilityReasons.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-nowrap py-0.5 whitespace-nowrap">
                    {listing.compatibilityReasons.map((reason) => (
                      <Badge
                        key={reason}
                        variant="outline"
                        className="shrink-0 border-emerald-200 bg-emerald-50/50 px-1.5 py-0 text-[9px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                      >
                        <Sparkles className="mr-0.5 h-2 w-2" /> {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Unified Compact Footer */}
          <div
            className={`flex ${
              isVertical ? "h-11 sm:h-12 mt-auto" : "h-7 sm:h-8 mt-auto"
            } items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80`}
          >
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate min-w-0 pr-1">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span className="truncate">Verified</span>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setIsContactModalOpen(true);
              }}
              className={`h-6.5 sm:h-7 rounded-full text-white font-semibold text-[10px] sm:text-[11px] px-2.5 sm:px-3 shadow-xs shrink-0 transition-transform active:scale-95 ${
                listing.mode === "BUDDY_UP"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              <HeartHandshake className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              {listing.mode === "BUDDY_UP" ? "Team Up" : "Connect"}
            </Button>
          </div>
        </div>
      </article>

      {isContactModalOpen && (
        <FlatmateContactModal
          listing={listing}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </>
  );
}
