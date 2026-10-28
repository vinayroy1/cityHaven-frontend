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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FlatmateContactModal } from "@/components/flatmates/FlatmateContactModal";
import { useGetFlatmateListingQuery } from "@/features/flatmates/api";
import { BackButton } from "@/components/common/BackButton";
import { FlatmateDetailSkeleton } from "@/components/flatmates/FlatmateDetailSkeleton";

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
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

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
      // Closing the native share sheet is not an error the user needs to see.
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
  const photos = (listing.photos?.length ? listing.photos : []).map(normalizeR2Url);
  const profilePhoto = normalizeR2Url(profile?.profilePhoto);
  const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : undefined;
  const preferredAreas = listing.preferredLocalities?.filter(Boolean).slice(0, 4) || [];

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Back & Breadcrumb Bar */}
          <div className="flex items-center justify-between">
            <BackButton fallbackHref="/flatmate" label="Back to Flatmates" variant="pill" size="sm" />

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Media Gallery + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery */}
              {photos.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <img
                      src={photos[activePhotoIdx]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      fetchPriority={activePhotoIdx === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                    <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                      {activePhotoIdx + 1} of {photos.length}
                    </div>
                  </div>

                  {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photos.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIdx(idx)}
                          aria-label={`View photo ${idx + 1} of ${photos.length}`}
                          className={`relative h-16 w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition ${
                            activePhotoIdx === idx ? "border-rose-500 scale-95" : "border-transparent opacity-70"
                          }`}
                        >
                          <img src={p} alt={`Thumb ${idx}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-60 rounded-3xl bg-gradient-to-tr from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                  <Users className="w-12 h-12 text-rose-500 mb-2" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No photos uploaded for this listing
                  </span>
                </div>
              )}

              {/* Title & Core Location */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-rose-600 text-white font-bold text-xs">
                      {listing.mode === "HAVE_ROOM"
                        ? "Room Offered"
                        : listing.mode === "NEED_ROOM"
                        ? "Looking for Room"
                        : "Buddy Up"}
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

                  {listing.mode !== "HAVE_ROOM" && preferredAreas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Preferred areas:</span>
                      {preferredAreas.map((area) => (
                        <span key={area} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Room Specs */}
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
                  {listing.minimumStayMonths != null && (
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Min Stay</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {listing.minimumStayMonths} Months
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
                  {listing.currentOccupants != null && (
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Current Flatmates</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{listing.currentOccupants}</p>
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

              {/* Lifestyle & Compatibility Preferences */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Roommate Compatibility & House Rules
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.preferredDiet && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Diet
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{listing.preferredDiet}</p>
                    </div>
                  )}

                  {listing.petsAllowed != null && <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <PawPrint className="w-3.5 h-3.5 text-amber-500" /> Pets Policy
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {listing.petsAllowed ? "Pet-Friendly" : "No Pets"}
                    </p>
                  </div>}

                  {listing.smokingAllowed != null && <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Cigarette className="w-3.5 h-3.5 text-slate-500" /> Smoking
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {listing.smokingAllowed ? "Smoking Allowed" : "Non-Smoker Only"}
                    </p>
                  </div>}

                  {listing.drinkingAllowed != null && <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Wine className="w-3.5 h-3.5 text-rose-500" /> Drinking
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {listing.drinkingAllowed ? "Social Drinking OK" : "No Drinking"}
                    </p>
                  </div>}

                  {listing.preferredGenders?.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500"><User className="h-3.5 w-3.5 text-rose-500" /> Preferred Gender</div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{listing.preferredGenders.join(" / ")}</p>
                    </div>
                  )}

                  {listing.preferredOccupations?.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500"><BriefcaseBusiness className="h-3.5 w-3.5 text-blue-500" /> Preferred Profile</div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{listing.preferredOccupations.join(" / ")}</p>
                    </div>
                  )}

                  {profile?.cleanlinessLevel && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Cleanliness
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {profile.cleanlinessLevel} / 5 Clean
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
                      <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5 text-indigo-500" /> Sleep Schedule</div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.sleepSchedule}</p>
                    </div>
                  )}
                </div>
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

            {/* Right Column: Pricing Sticky Card + Poster Profile */}
            <div className="space-y-6">
              {/* Connect & Pricing Action Card */}
              <div className="sticky top-24 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {listing.mode === "HAVE_ROOM" ? "Monthly Rent" : "Target Budget"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formattedRent()}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {listing.mode === "HAVE_ROOM" ? "/month" : ""}
                    </span>
                  </div>
                  {listing.maintenance != null && (
                    <span className="text-[11px] text-slate-400 block">
                      + ₹{listing.maintenance.toLocaleString("en-IN")}/mo maintenance
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsContactModalOpen(true);
                  }}
                  className="w-full h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition active:scale-95"
                >
                  <HeartHandshake className="w-4 h-4 mr-2" />
                  Connect with {profile?.displayName || "Flatmate"}
                </Button>

                <div className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  ⚡ Direct verified contact • Phone &amp; Email unlocked • No brokerage
                </div>

                {/* Poster Profile Box */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Posted By
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-inner overflow-hidden">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={profile?.displayName || "Roomie"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span>{(profile?.displayName || "R")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {profile?.displayName || "Flatmate"}
                        </span>
                        {profile?.isIdentityVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {profile?.occupation || "Flat Seeker"}
                      </p>
                      {profile?.companyOrCollege && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {profile.companyOrCollege}
                        </p>
                      )}
                      {(profile?.gender || age) && (
                        <p className="text-[11px] text-slate-400">{[profile?.gender, age ? `${age} yrs` : ""].filter(Boolean).join(" · ")}</p>
                      )}
                    </div>
                  </div>

                  {profile?.languages && profile.languages.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{profile.languages.join(" · ")}</span>
                    </div>
                  )}

                  {profile?.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900 dark:text-white">{formattedRent()}</p>
          <p className="text-[10px] text-slate-500">{listing.mode === "HAVE_ROOM" ? "per month" : "target budget"}</p>
        </div>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsContactModalOpen(true);
          }}
          className="h-11 shrink-0 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700"
        >
          <HeartHandshake className="mr-1.5 h-4 w-4" /> Connect
        </Button>
      </div>

      <FlatmateContactModal
        listing={listing}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
