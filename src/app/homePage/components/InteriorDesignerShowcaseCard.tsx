"use client";
import Link from "next/link";
import { sizedImageUrl } from "../lib/homeImage";
import { ArrowRight, BadgeCheck, MapPin, Palette, Star } from "lucide-react";
import type { InteriorProfile } from "@/types/interior.types";
import { InteriorPhotoCarousel, interiorCardPhotos, MAX_CARD_PHOTOS } from "@/components/interiors/InteriorPhotoCarousel";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";

export function interiorProfileHref(profile: InteriorProfile) {
  return interiorProfilePath(profile);
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function InteriorDesignerShowcaseCard({ profile }: { profile: InteriorProfile }) {
  const name = profile.businessName || (profile as { displayName?: string | null }).displayName || "Interior studio";
  const href = interiorProfileHref(profile);
  const photos = interiorCardPhotos(profile);
  // Thumbnails show what comes after the swipeable photos, so nothing is repeated.
  const thumbs = photos.slice(MAX_CARD_PHOTOS, MAX_CARD_PHOTOS + 3);
  const extraCount = Math.max(0, (profile._count?.projects ?? 0) - 1 - thumbs.length);
  const rating = Number(profile.rating || 0);
  const styles = (profile.designStyles?.length ? profile.designStyles : profile.servicesOffered || []).slice(0, 3);
  const price = profile.isCustomQuotationOnly || !profile.startingRateMin
    ? null
    : `₹${Number(profile.startingRateMin).toLocaleString("en-IN")}`;
  const unit = profile.pricingUnit === "PER_SQFT" ? "/sq.ft" : "";

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={`${name}, interior designer in ${profile.primaryCity}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-rose-500/0 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 md:hover:-translate-y-1 md:hover:shadow-xl md:hover:shadow-rose-900/10 dark:border-slate-800 dark:bg-slate-900 dark:md:hover:shadow-black/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <InteriorPhotoCarousel
          photos={photos}
          alt={name}
          renderImage={(src) => (
            <img
              src={sizedImageUrl(src, 640)}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="pointer-events-none h-full w-full object-cover transition duration-500 ease-out md:group-hover:scale-105"
            />
          )}
          fallback={<div className="h-full w-full bg-gradient-to-br from-rose-400 via-rose-600 to-rose-900" />}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/0 to-slate-950/10" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {profile.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-emerald-700 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Verified
            </span>
          )}
          {(profile.isFeatured || profile.isSponsored) && (
            <span className="inline-flex items-center rounded-full bg-rose-600/95 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {profile.isSponsored ? "Sponsored" : "Featured"}
            </span>
          )}
        </div>

        {rating > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
            {rating.toFixed(1)}
            {profile.reviewCount ? <span className="font-medium text-white/70">({profile.reviewCount})</span> : null}
          </span>
        )}

        <div className="absolute bottom-3 right-3 text-right text-white drop-shadow">
          {price ? (
            <>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/80">From</span>
              <span className="text-sm font-extrabold">{price}<span className="text-xs font-semibold text-white/80">{unit}</span></span>
            </>
          ) : (
            <span className="text-xs font-bold">Custom quote</span>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-8">
        <div className="absolute -top-7 left-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-rose-50 shadow-md dark:border-slate-900 dark:bg-slate-800">
          {profile.logo ? (
            <img src={sizedImageUrl(profile.logo, 112)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <span className="text-base font-black text-rose-600 dark:text-rose-400">{initialsOf(name)}</span>
          )}
        </div>

        <h3 className="line-clamp-1 text-base font-bold tracking-tight text-slate-950 transition group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
          {name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3 w-3 shrink-0 text-rose-500" aria-hidden />
          <span className="truncate">
            {profile.primaryCity}
            {profile.experienceYears ? ` · ${profile.experienceYears}+ yrs experience` : ""}
          </span>
        </p>

        {styles.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {styles.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50/70 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <Palette className="h-2.5 w-2.5" aria-hidden />
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3">
          {thumbs.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {thumbs.map((src, i) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <img src={sizedImageUrl(src, 240)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  {i === thumbs.length - 1 && extraCount > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-xs font-bold text-white">
                      +{extraCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
              View portfolio <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
