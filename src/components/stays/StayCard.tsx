"use client";

import Link from "next/link";
import { BadgeCheck, BedDouble, Heart, MapPin, Snowflake, Star } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { stayTypeLabel } from "@/features/stays/options";
import type { Stay } from "@/features/stays/types";

/** Price headline for a stay: "Free stay", "Donation", or "₹1,200 / night". */
export function stayPriceLabel(stay: Pick<Stay, "rooms" | "minPrice" | "countryCode">) {
  const rooms = stay.rooms?.filter((r) => r.isAvailable) ?? [];
  if (rooms.length && rooms.every((r) => r.isFree)) return { main: "Free stay", sub: "" };
  if (rooms.length && rooms.every((r) => r.isFree || r.donationBased) && stay.minPrice == null) return { main: "Donation", sub: "based" };
  if (stay.minPrice == null) return { main: "Price on request", sub: "" };
  if (stay.minPrice === 0) return { main: "From Free", sub: "" };
  return { main: formatMoney(stay.minPrice, stay.countryCode), sub: "/ night" };
}

export function StayCard({ stay, priority = false }: { stay: Stay; priority?: boolean }) {
  const cover = stay.coverImage || stay.photos?.[0] || stay.rooms?.find((r) => r.photos?.length)?.photos[0];
  const price = stayPriceLabel(stay);
  const hasAc = stay.rooms?.some((r) => r.ac);
  const roomTypes = stay.rooms?.length ?? 0;
  const place = [stay.locality, stay.cityName].filter(Boolean).join(", ");

  return (
    <Link
      href={`/stays/${stay.slug}`}
      prefetch={false}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 dark:from-slate-800 dark:to-slate-900">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={stay.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-rose-300">
            <BedDouble className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur">
          {stayTypeLabel(stay.type)}
        </span>
        {stay.isVerified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}
        <div className="absolute bottom-3 left-3 text-white">
          {price.sub === "/ night" && <p className="text-[10px] font-semibold uppercase tracking-wider opacity-90 drop-shadow">Starting from</p>}
          <p className="text-lg font-black leading-none drop-shadow">{price.main}</p>
          {price.sub && <p className="mt-0.5 text-[11px] font-medium opacity-90">{price.sub}</p>}
        </div>
        {stay.starRating ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-0.5 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur">
            {Array.from({ length: stay.starRating }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-rose-600 dark:text-white">{stay.name}</h3>
        {place && (
          <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
            <span className="line-clamp-1">{place}</span>
          </p>
        )}
        {stay.tagline && <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{stay.tagline}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {roomTypes} room type{roomTypes === 1 ? "" : "s"}
          </span>
          {hasAc && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <Snowflake className="h-3 w-3" /> AC
            </span>
          )}
          {stay.coupleFriendly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <Heart className="h-3 w-3" /> Couple friendly
            </span>
          )}
          {(stay.bookingLinks?.length ?? 0) > 0 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              Book online
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function StayCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-[4/3] animate-pulse bg-slate-100 dark:bg-slate-800" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
