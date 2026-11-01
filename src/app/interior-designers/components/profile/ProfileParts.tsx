"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import type { InteriorProfile } from "@/types/interior.types";
import { isOptimizableImage } from "../../lib/image";
import { humanize, inr, priceRange, profileName, telHref, unitLabel, waHref } from "./utils";

/* ---------------------------------- Shell --------------------------------- */

export function Section({
  id,
  title,
  subtitle,
  children,
  action,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs sm:p-7 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Chips({ items, tone = "stone" }: { items: string[]; tone?: "stone" | "rose" }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            tone === "rose"
              ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              : "bg-stone-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

export function startingPriceLabel(p: InteriorProfile) {
  if (p.isCustomQuotationOnly || (p.startingRateMin == null && p.startingRateMax == null)) return "";
  return `${inr(p.startingRateMin ?? p.startingRateMax)}${unitLabel(p.pricingUnit)}`;
}

export function ProfileHero({ profile, onQuote }: { profile: InteriorProfile; onQuote: () => void }) {
  const name = profileName(profile);
  const isCompany = profile.providerType === "COMPANY";
  const rating = Number(profile.rating);
  const hasReviews = (profile.reviewCount ?? 0) > 0 && rating > 0;
  const price = startingPriceLabel(profile);
  const phone = profile.isPhonePublic ? profile.primaryPhone : null;
  const whatsapp = profile.whatsappPhone || profile.contact?.whatsapp;
  const location = [profile.primaryLocality, profile.primaryCity]
    .filter((v, i, arr) => v && arr.indexOf(v) === i)
    .join(", ");

  return (
    <header className="bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-6xl sm:px-6 sm:pt-4">
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-stone-800 via-rose-950 to-stone-900 sm:h-60 sm:rounded-3xl lg:h-72">
          {profile.coverBanner && (
            <Image
              src={profile.coverBanner}
              alt=""
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 1152px) 1104px, (min-width: 640px) calc(100vw - 48px), 100vw"
              unoptimized={!isOptimizableImage(profile.coverBanner)}
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Only the logo overlaps the cover; all text sits on the white surface below it. */}
        <div className="relative z-10 -mt-12 sm:-mt-14 sm:ml-6">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ring-1 ring-black/5 sm:h-28 sm:w-28 dark:border-slate-900 dark:bg-slate-800">
              {profile.logo ? (
                <Image
                  src={profile.logo}
                  alt={`${name} logo`}
                  width={112}
                  height={112}
                  sizes="112px"
                  unoptimized={!isOptimizableImage(profile.logo)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400 dark:bg-slate-800">
                  {isCompany ? <Building2 className="h-10 w-10" aria-hidden /> : <User className="h-10 w-10" aria-hidden />}
                </div>
              )}
          </div>
        </div>

        <div className="flex flex-col gap-5 pb-6 pt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[2rem] dark:text-white">
                  {name}
                </h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </span>
                )}
              </div>
              {profile.tagline && (
                <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{profile.tagline}</p>
              )}
              <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="inline-flex items-center gap-1">
                  {isCompany ? <Building2 className="h-4 w-4" aria-hidden /> : <User className="h-4 w-4" aria-hidden />}
                  {isCompany ? "Design firm" : "Independent designer"}
                </li>
                {location && (
                  <li className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-rose-600" aria-hidden />
                    {location}
                  </li>
                )}
                {profile.experienceYears > 0 && (
                  <li className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden />
                    {profile.experienceYears}+ yrs experience
                  </li>
                )}
                <li className="inline-flex items-center gap-1">
                  <Star className={`h-4 w-4 ${hasReviews ? "fill-amber-400 text-amber-400" : ""}`} aria-hidden />
                  {hasReviews ? (
                    <span>
                      <strong className="text-slate-900 dark:text-white">{rating.toFixed(1)}</strong> ({profile.reviewCount}{" "}
                      reviews)
                    </span>
                  ) : (
                    "New on Awasio"
                  )}
                </li>
              </ul>
            </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 lg:min-w-[300px] dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {price ? "Starting at" : "Pricing"}
              </p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {price || "Custom quote"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onQuote}
                className="min-h-11 flex-1 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 sm:flex-none"
              >
                Get free quote
              </button>
              {whatsapp && (
                <a
                  href={waHref(whatsapp, `Hi ${name}, I found you on Awasio and would like a quote.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              )}
              {phone && (
                <a
                  href={telHref(phone)}
                  aria-label={`Call ${name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------- Section nav ------------------------------ */

export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  useEffect(() => {
    const chip = navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const nav = navRef.current;
    if (chip && nav) nav.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Profile sections"
      className="sticky top-0 z-30 border-y border-stone-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div ref={navRef} className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {items.map((item) => (
          <a
            key={item.id}
            data-id={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "true" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition ${
              active === item.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------ Enquiry card ------------------------------ */

const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function workingSummary(p: InteriorProfile) {
  const c = p.contact;
  if (c?.workingHours?.open && c.workingHours.close) {
    const days = (c.workingDays ?? []).slice().sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    const dayLabel =
      days.length >= 2 ? `${humanize(days[0])}–${humanize(days[days.length - 1])}` : days.map(humanize).join("");
    return `${dayLabel ? `${dayLabel}, ` : ""}${c.workingHours.open} – ${c.workingHours.close}`;
  }
  return p.workingHours || "";
}

export function consultationSummary(p: InteriorProfile) {
  const opt = p.consultationOptions?.find((o) => o.type);
  if (opt) {
    const mode = humanize(opt.type).replace("In Person", "In-person");
    return opt.isFree || !opt.fee ? `Free ${mode.toLowerCase()} consultation` : `${mode} consultation · ${inr(opt.fee)}`;
  }
  return p.consultationType ? humanize(p.consultationType) : "";
}

export function EnquiryCard({ profile, onQuote }: { profile: InteriorProfile; onQuote: () => void }) {
  const accepting = profile.contact?.acceptingNewProjects ?? profile.isAcceptingProjects;
  const hours = workingSummary(profile);
  const consult = consultationSummary(profile);
  const price = startingPriceLabel(profile);
  const whatsapp = profile.whatsappPhone || profile.contact?.whatsapp;
  const name = profileName(profile);

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{price ? "Starting at" : "Pricing"}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{price || "Custom quote"}</p>
      {price && profile.startingRateMax && profile.startingRateMin && profile.startingRateMax > profile.startingRateMin && (
        <p className="text-xs text-slate-500">
          Range {priceRange(profile.startingRateMin, profile.startingRateMax, profile.pricingUnit)}
        </p>
      )}

      <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <li className="flex items-start gap-2">
          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${accepting ? "text-emerald-600" : "text-slate-400"}`} aria-hidden />
          {accepting ? "Accepting new projects" : "Not taking new projects right now"}
        </li>
        {consult && (
          <li className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            {consult}
          </li>
        )}
        {hours && (
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            {hours}
          </li>
        )}
        {profile.isVerified && (
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            Documents verified by Awasio
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={onQuote}
        className="mt-6 min-h-12 w-full rounded-xl bg-rose-600 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
      >
        Get free quote
      </button>
      {whatsapp && (
        <a
          href={waHref(whatsapp, `Hi ${name}, I found you on Awasio and would like a quote.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Chat on WhatsApp
        </a>
      )}
      <p className="mt-3 text-center text-xs text-slate-500">Free, no-obligation estimate. Usually replies within a day.</p>
    </div>
  );
}

export function MobileCtaBar({ profile, onQuote }: { profile: InteriorProfile; onQuote: () => void }) {
  const phone = profile.isPhonePublic ? profile.primaryPhone : null;
  const whatsapp = profile.whatsappPhone || profile.contact?.whatsapp;
  const name = profileName(profile);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-xl gap-2">
        {phone && (
          <a
            href={telHref(phone)}
            aria-label={`Call ${name}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
        )}
        {whatsapp && (
          <a
            href={waHref(whatsapp, `Hi ${name}, I found you on Awasio and would like a quote.`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${name}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </a>
        )}
        <button
          type="button"
          onClick={onQuote}
          className="h-12 min-w-0 flex-1 rounded-xl bg-rose-600 text-sm font-bold text-white shadow-md active:bg-rose-700"
        >
          Get free quote
        </button>
      </div>
    </div>
  );
}
