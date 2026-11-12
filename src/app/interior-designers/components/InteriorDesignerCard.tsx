"use client";

import Image from "next/image";
import { isOptimizableImage } from "../lib/image";
import { experienceYearsOf } from "./profile/utils";
import React from "react";
import { InteriorPhotoCarousel, interiorCardPhotos } from "@/components/interiors/InteriorPhotoCarousel";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  User,
  Star,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { InteriorProfile } from "@/types/interior.types";
import { formatMoney } from "@/lib/money";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";

interface InteriorCardProps {
  profile: InteriorProfile;
  /** Preload the cover (use for above-the-fold cards). */
  priority?: boolean;
  onOpenInquiry?: (profile: InteriorProfile) => void;
}

export function InteriorDesignerCard({ profile, onOpenInquiry, priority = false }: InteriorCardProps) {
  const safePhotos = interiorCardPhotos(profile);
  // Individuals have no businessName; their public name is displayName (or fullName).
  const name = profile.displayName || profile.businessName || profile.fullName || "Interior designer";
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const isCompany = profile.providerType === "COMPANY";
  const profileUrl = interiorProfilePath(profile);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Photo Carousel Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={profileUrl} className="block h-full w-full">
          <InteriorPhotoCarousel
            photos={safePhotos}
            alt={name}
            renderImage={(src, i) => (
              <Image
                src={src}
                alt={name}
                fill
                draggable={false}
                preload={priority && i === 0}
                sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                unoptimized={!isOptimizableImage(src)}
                className="pointer-events-none object-cover transition duration-300 group-hover:scale-105"
              />
            )}
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800">
                {profile.logo ? (
                  <Image src={profile.logo} alt="" width={64} height={64} sizes="64px" unoptimized={!isOptimizableImage(profile.logo)} className="h-16 w-16 rounded-2xl bg-white object-cover shadow-lg" />
                ) : (
                  <span className="text-3xl font-black tracking-tight text-white/90">{initials}</span>
                )}
              </div>
            }
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

        {/* Badges on Top */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md dark:bg-white/90 dark:text-slate-950"
          >
            {isCompany ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {isCompany ? "Design Studio" : "Independent designer"}
          </span>

          {profile.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
              <ShieldCheck className="h-3 w-3" />
              Verified Pro
            </span>
          )}
          {(profile.isSponsored || profile.isFeatured) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[11px] font-bold text-amber-950 shadow-xs backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              {profile.isSponsored ? "Sponsored" : "Featured"}
            </span>
          )}
        </div>

        {/* Pricing Badge on bottom left of Image */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 drop-shadow-xs">
            {profile.isCustomQuotationOnly ? "Pricing" : "Starting Rate"}
          </span>
          <p className="text-sm font-black text-white drop-shadow-md">
            {profile.isCustomQuotationOnly
              ? "Custom Quotation"
              : profile.startingRateMin
              ? `${formatMoney(profile.startingRateMin, profile.countryCode)}/${profile.pricingUnit === "PER_SQFT" ? "sq.ft." : "unit"}`
              : "Price on request"}
          </p>
        </div>

        {/* Rating on bottom right of Image */}
        {profile.reviewCount > 0 && Number(profile.rating) > 0 && (
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-amber-400 backdrop-blur-xs">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{Number(profile.rating).toFixed(1)}</span>
            <span className="text-slate-400 text-[10px]">({profile.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={profileUrl}>
              <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition hover:text-rose-600 dark:text-white dark:hover:text-rose-400">
                {name}
              </h3>
            </Link>
            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0 text-rose-500" />
              <span className="truncate">
                {profile.primaryLocality ? `${profile.primaryLocality}, ` : ""}
                {profile.primaryCity}
              </span>
            </p>
          </div>
          {profile.logo && (
            <Image
              src={profile.logo}
              alt=""
              width={36}
              height={36}
              sizes="36px"
              unoptimized={!isOptimizableImage(profile.logo)}
              className="h-9 w-9 rounded-full border border-slate-200 object-cover shrink-0 dark:border-slate-700"
            />
          )}
        </div>

        {/* Stats strip */}
        <div className="mt-3 flex items-center gap-3 border-y border-slate-100 py-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{experienceYearsOf(profile)}y</span> Exp
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{profile._count?.projects || 0}</span> Homes Done
          </div>
          {isCompany && (profile.branches?.length || 0) > 1 && (
            <>
              <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{profile.branches?.length}</span> Branches
              </div>
            </>
          )}
        </div>

        {/* Key Services & Material Tags (Clean & un-cluttered) */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {profile.servicesOffered?.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {service}
            </span>
          ))}
          {profile.hardwareBrands?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <Sparkles className="h-2.5 w-2.5" />
              {profile.hardwareBrands[0]} Partner
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Link
            href={profileUrl}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View Portfolio
          </Link>
          <button
            type="button"
            onClick={() => onOpenInquiry?.(profile)}
            className="flex-1 rounded-xl bg-rose-600 py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-98 dark:bg-rose-600 dark:hover:bg-rose-500"
          >
            Get Free Quote
          </button>
        </div>
      </div>
    </div>
  );
}

