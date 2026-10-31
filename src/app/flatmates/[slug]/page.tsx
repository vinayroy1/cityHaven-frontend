"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Users,
  ShieldCheck,
  HeartHandshake,
  Share2,
  Utensils,
  PawPrint,
  Cigarette,
  Wine,
  Laptop,
  Check,
  Sparkles,
  User,
  AlertCircle,
  Clock3,
  Languages,
  BriefcaseBusiness,
  Search,
  Calendar,
  Home,
  BedDouble,
  CheckCircle2,
  MessageCircle,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { useGetFlatmateListingQuery } from "@/features/flatmates/api";
import { BackButton } from "@/components/common/BackButton";
import { FlatmateDetailSkeleton } from "@/components/flatmates/FlatmateDetailSkeleton";
import { useCardImageSwipe } from "@/components/common/useCardImageSwipe";
import { SeekerAvatarPlaceholder } from "@/components/flatmates/SeekerAvatarPlaceholder";
import { isRealUserPhoto } from "@/components/flatmates/FlatmateCard";

const FlatmateContactModal = dynamic(
  () => import("@/components/flatmates/FlatmateContactModal").then((mod) => mod.FlatmateContactModal),
  { ssr: false }
);

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

export default function FlatmateDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const { data: listing, isLoading, error } = useGetFlatmateListingQuery(slug, {
    skip: !slug,
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title || "Flatmate listing", url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      // Closing the native share sheet is not an error
    }
  };

  if (isLoading) {
    return <FlatmateDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Listing Not Found</h2>
            <p className="text-xs text-slate-500">
              This listing might have expired, been archived, or the link is incorrect.
            </p>
            <Link
              href="/flatmate"
              className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Browse All Flatmates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = listing.profile;
  const effectiveGender =
    profile?.gender ||
    (listing.preferredGenders?.some((g) => g.toUpperCase().includes("FEMALE"))
      ? "Female"
      : listing.preferredGenders?.some((g) => g.toUpperCase().includes("MALE"))
      ? "Male"
      : undefined);
  const photos = Array.from(new Set((listing.photos?.length ? listing.photos : []).map(normalizeR2Url)));
  const profilePhoto = normalizeR2Url(profile?.profilePhoto);
  // For seeker/buddy-up, prioritize profilePhoto, fallback to first uploaded photo
  const heroPhoto = profilePhoto || photos[0] || null;

  const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : undefined;
  const preferredAreas = listing.preferredLocalities?.filter(Boolean) || [];

  const formattedRent = () => {
    if (listing.mode === "HAVE_ROOM") {
      return listing.rent != null ? `₹${listing.rent.toLocaleString("en-IN")}` : "Rent on Request";
    }
    if (listing.budgetMin != null && listing.budgetMax != null) {
      return `₹${listing.budgetMin.toLocaleString("en-IN")} - ₹${listing.budgetMax.toLocaleString("en-IN")}`;
    }
    return listing.budgetMax != null ? `Up to ₹${listing.budgetMax.toLocaleString("en-IN")}` : "Flexible";
  };

  const isSeekerOrBuddy = listing.mode === "NEED_ROOM" || listing.mode === "BUDDY_UP";
  const isBuddyUp = listing.mode === "BUDDY_UP";
  const displayName = profile?.displayName || (isBuddyUp ? "Buddy-Up Group" : "Room Seeker");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 px-4 pb-32 pt-5 sm:px-6 lg:px-8 lg:pb-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Top Bar Navigation & Share */}
          <div className="flex items-center justify-between">
            <BackButton fallbackHref="/flatmate" label="Back to Flatmates" variant="pill" size="sm" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Main Details Content */}
            <div className="lg:col-span-2 space-y-6">
              {isSeekerOrBuddy ? (
                /* ========================================================== */
                /* SEEKER & BUDDY-UP: HUMAN & PERSON-FIRST HERO (HIGH LCP)    */
                /* ========================================================== */
                <div className="space-y-6">
                  {/* Hero Profile Card */}
                  <div
                    className={`relative overflow-hidden rounded-3xl border bg-white p-5 sm:p-7 shadow-sm dark:bg-slate-900 ${
                      isBuddyUp
                        ? "border-amber-200/80 dark:border-amber-900/40"
                        : "border-rose-200/80 dark:border-rose-900/40"
                    }`}
                  >
                    {/* Top ambient glow */}
                    <div
                      className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-35 ${
                        isBuddyUp
                          ? "bg-gradient-to-br from-amber-400 to-rose-400"
                          : "bg-gradient-to-br from-rose-400 to-pink-400"
                      }`}
                    />

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                      {/* Avatar: High LCP priority image */}
                      <div className="relative shrink-0">
                        <div
                          className={`h-28 w-28 sm:h-36 sm:w-36 rounded-3xl overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-xl ${
                            isBuddyUp
                              ? "bg-gradient-to-br from-amber-500 via-rose-500 to-amber-600"
                              : "bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600"
                          }`}
                        >
                          {isRealUserPhoto(heroPhoto) ? (
                            <img
                              src={heroPhoto!}
                              alt={displayName}
                              fetchPriority="high"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <SeekerAvatarPlaceholder
                              displayName={displayName}
                              gender={effectiveGender}
                              occupation={profile?.occupation}
                              mode={listing.mode}
                            />
                          )}
                        </div>

                        {/* ID Verified Badge overlay on Avatar */}
                        {profile?.isIdentityVerified && (
                          <div
                            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md ring-2 ring-white dark:ring-slate-900"
                            title="Identity Verified"
                          >
                            <ShieldCheck className="h-4.5 w-4.5" />
                          </div>
                        )}
                      </div>

                      {/* Profile Core Info */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        {/* Mode & Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <Badge
                            className={`rounded-full px-3 py-0.5 text-xs font-bold border shadow-xs ${
                              isBuddyUp
                                ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                            }`}
                          >
                            {isBuddyUp ? (
                              <Users className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <Search className="w-3.5 h-3.5 mr-1 text-rose-600 dark:text-rose-400" />
                            )}
                            <span>{isBuddyUp ? "Buddy Up • Team Searching to Rent" : "Looking for Room • Room Seeker"}</span>
                          </Badge>

                          {profile?.isIdentityVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>ID Verified</span>
                            </span>
                          )}

                          {listing.compatibilityScore != null && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              <Sparkles className="h-3 w-3 text-indigo-600" />
                              <span>{listing.compatibilityScore}% Compatibility</span>
                            </span>
                          )}
                        </div>

                        {/* Name & Age */}
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {displayName}
                          </h1>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {age && <span>{age} years old</span>}
                            {profile?.gender && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{profile.gender}</span>
                              </>
                            )}
                            {profile?.occupation && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                  <BriefcaseBusiness className="w-3 h-3 text-slate-400" />
                                  {profile.occupation}
                                </span>
                              </>
                            )}
                            {profile?.companyOrCollege && (
                              <span className="text-slate-400">({profile.companyOrCollege})</span>
                            )}
                          </div>
                        </div>

                        {/* Target City & Location Tagline */}
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>
                            Searching for room in{" "}
                            <strong className="font-bold text-slate-900 dark:text-white">
                              {listing.cityName}
                              {listing.stateName ? `, ${listing.stateName}` : ""}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Key Search Criteria Cards (High Visibility Dashboard) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Stat 1: Target Budget */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {isBuddyUp ? "Team Budget" : "Max Budget"}
                      </span>
                      <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 truncate">
                        {formattedRent()}
                      </p>
                      <span className="text-[11px] text-slate-400 block">/month target</span>
                    </div>

                    {/* Stat 2: Target Localities */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Preferred Areas
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {preferredAreas.length > 0
                          ? preferredAreas[0] + (preferredAreas.length > 1 ? ` +${preferredAreas.length - 1} more` : "")
                          : listing.locality || listing.cityName}
                      </p>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {preferredAreas.length > 0 ? preferredAreas.slice(0, 3).join(", ") : "Flexible in city"}
                      </span>
                    </div>

                    {/* Stat 3: Desired Setup */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Room Needed
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {listing.roomType || (isBuddyUp ? "Entire Flat to Share" : "Private Room")}
                      </p>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {listing.furnishing || "Any Furnishing"} {listing.bhk ? `• ${listing.bhk} BHK` : ""}
                      </span>
                    </div>

                    {/* Stat 4: Move-in Timeline */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Move-in By
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {listing.availableFrom
                          ? new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Immediate / Flexible"}
                      </p>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Stay: {listing.minimumStayMonths ? `${listing.minimumStayMonths}+ Months` : "Flexible stay"}
                      </span>
                    </div>
                  </div>

                  {/* Target Localities Section */}
                  {preferredAreas.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          Target Localities & Neighborhoods
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isBuddyUp ? "Our team is actively looking" : `${displayName} is looking`} for rooms or flats in the following locations:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {preferredAreas.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60"
                          >
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About Profile & Requirements Bio */}
                  {(profile?.bio || listing.description) && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          {isBuddyUp ? "About Our Group & Search Plan" : `About ${displayName}`}
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-850/60 p-4 border border-slate-100 dark:border-slate-800/80">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line italic">
                          &ldquo;{profile?.bio || listing.description}&rdquo;
                        </p>
                      </div>

                      {profile?.languages && profile.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                          <Languages className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Languages spoken:</span>
                          <span>{profile.languages.join(" · ")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buddy Up Why-Team-Up Card */}
                  {isBuddyUp && (
                    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 sm:p-6 shadow-xs dark:border-amber-900/40 dark:bg-slate-900 space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          Why Buddy Up With This Group?
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 space-y-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Lower Rent
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Renting a full 2/3 BHK together cuts per-person rent by 30-40% compared to solo rooms.
                          </p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 space-y-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Pick Your Flat
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Have an equal voice in choosing the apartment, society amenities, and floor plan.
                          </p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 space-y-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Split Expenses
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Share WiFi, cook, maid, groceries, and society maintenance transparently.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desired Living & Accommodation Preferences */}
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-rose-500" />
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Desired Accommodation Preferences
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {listing.bhk && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Flat Size</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{listing.bhk} BHK</p>
                        </div>
                      )}

                      {listing.roomType && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Room Occupancy</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{listing.roomType}</p>
                        </div>
                      )}

                      {listing.furnishing && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Furnishing</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{listing.furnishing}</p>
                        </div>
                      )}

                      {listing.preferredGenders?.length > 0 && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Roommate Gender</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {listing.preferredGenders.join(" / ")}
                          </p>
                        </div>
                      )}

                      {listing.preferredOccupations?.length > 0 && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Occupation</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {listing.preferredOccupations.join(" / ")}
                          </p>
                        </div>
                      )}

                      {listing.minimumStayMonths != null && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Stay</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {listing.minimumStayMonths} Months
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lifestyle, Habits & Compatibility Matrix */}
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Lifestyle & Flatmate Compatibility
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(profile?.diet || listing.preferredDiet) && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Diet
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {profile?.diet || listing.preferredDiet}
                          </p>
                        </div>
                      )}

                      {(profile?.hasPets != null || listing.petsAllowed != null) && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <PawPrint className="w-3.5 h-3.5 text-amber-500" /> Pets
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {profile?.hasPets ? "Has Pet(s)" : listing.petsAllowed ? "Pet-Friendly" : "No Pets"}
                          </p>
                        </div>
                      )}

                      {(profile?.smoking != null || listing.smokingAllowed != null) && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Cigarette className="w-3.5 h-3.5 text-slate-500" /> Smoking
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {profile?.smoking || (listing.smokingAllowed ? "Smoking Allowed" : "Non-Smoker")}
                          </p>
                        </div>
                      )}

                      {(profile?.drinking != null || listing.drinkingAllowed != null) && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Wine className="w-3.5 h-3.5 text-rose-500" /> Drinking
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {profile?.drinking || (listing.drinkingAllowed ? "Social Drinking OK" : "Non-Drinker")}
                          </p>
                        </div>
                      )}

                      {profile?.workMode && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Laptop className="w-3.5 h-3.5 text-purple-500" /> Work Mode
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.workMode}</p>
                        </div>
                      )}

                      {profile?.sleepSchedule && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="w-3.5 h-3.5 text-indigo-500" /> Sleep Schedule
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.sleepSchedule}</p>
                        </div>
                      )}

                      {profile?.cleanlinessLevel != null && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Cleanliness
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {profile.cleanlinessLevel} / 5 Clean
                          </p>
                        </div>
                      )}

                      {profile?.socialPreference && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Users className="w-3.5 h-3.5 text-blue-500" /> Social Preference
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.socialPreference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================== */
                /* HAVE ROOM: PROPERTY & FLAT DETAILS VIEW                    */
                /* ========================================================== */
                <div className="space-y-6">
                  {/* Property Photos Media Gallery */}
                  {photos.length > 0 ? (
                    <RoomPhotoGallery photos={photos} title={listing.title} />
                  ) : (
                    <div className="h-60 rounded-3xl bg-gradient-to-tr from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                      <Home className="w-12 h-12 text-rose-500 mb-2" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Room Photos Not Uploaded
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Connect with host directly to request photos or schedule a visit.</p>
                    </div>
                  )}

                  {/* Title & Core Location */}
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-rose-600 text-white font-bold text-xs">
                          Room Offered
                        </Badge>
                        {listing.roomType && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {listing.roomType}
                          </span>
                        )}
                        {listing.furnishing && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {listing.furnishing}
                          </span>
                        )}
                      </div>

                      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {listing.title}
                      </h1>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>
                          {listing.locality
                            ? `${listing.locality}, ${listing.cityName}, ${listing.stateName || "India"}`
                            : `${listing.cityName}, ${listing.stateName || "India"}`}
                        </span>
                      </div>
                    </div>

                    {/* Room Key Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-y border-slate-100 dark:border-slate-800 py-4">
                      {listing.bhk && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Flat Size</span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{listing.bhk} BHK</p>
                        </div>
                      )}
                      {listing.availableFrom && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Move-in Date</span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      {listing.deposit != null && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Security Deposit</span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{listing.deposit.toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                      {listing.spotsAvailable > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Availability</span>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {listing.spotsAvailable} spot{listing.spotsAvailable === 1 ? "" : "s"} open
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <div className="space-y-1.5 pt-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          About the Place & Requirements
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {listing.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {listing.amenities?.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Amenities & Facilities
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {listing.amenities.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300"
                          >
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Action Card + Direct Connect CTA */}
            <div className="space-y-6">
              <div className="sticky top-24 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {listing.mode === "HAVE_ROOM" ? "Monthly Rent" : isBuddyUp ? "Team Target Budget" : "Max Budget"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formattedRent()}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {listing.mode === "HAVE_ROOM" ? "/month" : "/mo"}
                    </span>
                  </div>
                  {listing.mode === "HAVE_ROOM" && listing.maintenance != null && (
                    <span className="text-[11px] text-slate-400 block">
                      + ₹{listing.maintenance.toLocaleString("en-IN")}/mo maintenance
                    </span>
                  )}
                </div>

                {/* Primary CTA */}
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsContactModalOpen(true);
                  }}
                  className={`w-full h-12 rounded-full text-white font-extrabold text-sm shadow-lg transition active:scale-95 ${
                    isBuddyUp
                      ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
                  }`}
                >
                  {isBuddyUp ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Team Up with {displayName}
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4 mr-2" />
                      Connect with {displayName}
                    </>
                  )}
                </Button>

                {/* Trust and Safety Points */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct Phone & WhatsApp Unlock</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Zero Brokerage • 100% Verified Profiles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Safe Community Guidelines Protected</span>
                  </div>
                </div>

                {/* Host Card when in HAVE_ROOM mode */}
                {!isSeekerOrBuddy && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Posted By
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden shadow-inner">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{(displayName || "R")[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {profile?.occupation || "Flatmate Host"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar for Mobile conversion */}
      <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900 dark:text-white">{formattedRent()}</p>
          <p className="text-[10px] text-slate-500">
            {listing.mode === "HAVE_ROOM" ? "per month" : isBuddyUp ? "team target budget" : "target budget"}
          </p>
        </div>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsContactModalOpen(true);
          }}
          className={`h-11 shrink-0 rounded-xl px-5 text-sm font-bold text-white ${
            isBuddyUp ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {isBuddyUp ? (
            <>
              <Users className="mr-1.5 h-4 w-4" /> Team Up
            </>
          ) : (
            <>
              <HeartHandshake className="mr-1.5 h-4 w-4" /> Connect
            </>
          )}
        </Button>
      </div>

      {isContactModalOpen && (
        <FlatmateContactModal
          listing={listing}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}

function RoomPhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const {
    activeImage,
    setActiveImage,
    nextImage,
    prevImage,
    hasCarousel,
    hasInteracted,
    handleMouseEnter,
    containerRef,
    handleClickCapture,
  } = useCardImageSwipe({
    images: photos,
    totalImages: photos.length,
  });

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onClickCapture={handleClickCapture}
        onMouseEnter={handleMouseEnter}
        className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm select-none touch-pan-y group"
      >
        <img
          src={photos[activeImage]}
          alt={title}
          className="w-full h-full object-cover pointer-events-none transition duration-300"
          fetchPriority="high"
          loading={hasInteracted ? "eager" : "eager"}
          decoding="async"
        />

        {hasCarousel && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur pointer-events-none">
          {activeImage + 1} of {photos.length}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {photos.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(idx)}
              aria-label={`View photo ${idx + 1} of ${photos.length}`}
              className={`relative h-16 w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition ${
                activeImage === idx ? "border-rose-500 scale-95" : "border-transparent opacity-70"
              }`}
            >
              <img
                src={p}
                alt={`Thumb ${idx}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}