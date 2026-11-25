"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BedDouble, Building2, ChevronRight, PencilRuler, Flame, HardHat, Home, IndianRupee, MessageCircle, Paintbrush, Sparkles, UserCheck, Users, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/components/ui/utils";

export type ListingType = { label: string; short: string; /** Shorter name for the desktop chips. */ chip?: string; hint: string; href: string; icon: LucideIcon; gradient: string; popular?: boolean };

/** Every kind of listing an owner or business can post, each linking to its free-listing landing page. */
export const LISTING_TYPES: ListingType[] = [
  { label: "Property", short: "Property", hint: "Rent or sell a flat, house or plot", href: "/post-property-free", icon: Home, gradient: "from-rose-500 to-pink-500", popular: true },
  { label: "Hotel / Homestay", short: "Hotel / Stay", hint: "Direct bookings, zero commission", href: "/list-your-hotel", icon: BedDouble, gradient: "from-sky-500 to-blue-500", popular: true },
  { label: "PG / Flatmate", short: "Flatmate", hint: "Fill a room or find a flatmate", href: "/flatmates/post", icon: Users, gradient: "from-teal-500 to-emerald-500", popular: true },
  { label: "Interior business", chip: "Interiors", short: "Interiors", hint: "Get homeowner leads", href: "/list-interior-business", icon: Paintbrush, gradient: "from-violet-500 to-fuchsia-500" },
  { label: "Construction company", chip: "Construction", short: "Construction", hint: "Win building projects", href: "/list-construction-company", icon: HardHat, gradient: "from-amber-500 to-orange-500" },
  { label: "Architect / Naksha", chip: "Architect", short: "Architect", hint: "House plans & 3D elevation", href: "/list-architect-naksha-business", icon: PencilRuler, gradient: "from-sky-500 to-indigo-500" },
  { label: "Pandit & Vastu", short: "Pandit", hint: "Puja and vastu enquiries", href: "/list-pandit-services", icon: Flame, gradient: "from-orange-500 to-red-500" },
  { label: "New project", short: "Project", hint: "For builders and developers", href: "/post-project", icon: Building2, gradient: "from-indigo-500 to-purple-500" },
  { label: "Property advisor", chip: "Advisor", short: "Advisor", hint: "Get clients as an agent", href: "/become-property-advisor", icon: UserCheck, gradient: "from-emerald-500 to-green-600" },
];

const POPULAR = LISTING_TYPES.filter((t) => t.popular);
const SERVICES = LISTING_TYPES.filter((t) => !t.popular);

function GradientIcon({ t, size = "md" }: { t: ListingType; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1 ring-white/30 transition group-hover:scale-105 group-hover:rotate-[-4deg]",
        size === "md" ? "h-11 w-11" : "h-10 w-10",
        t.gradient,
      )}
    >
      <t.icon className={size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]"} />
    </span>
  );
}

/** Wide card: icon, title, one-line hint and an arrow. */
function TypeCard({ t, onPick }: { t: ListingType; onPick?: () => void }) {
  return (
    <Link
      href={t.href}
      prefetch={false}
      onClick={onPick}
      className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 pr-3 shadow-xs transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
    >
      <GradientIcon t={t} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-snug text-slate-900 dark:text-white">{t.label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">{t.hint}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
    </Link>
  );
}

/** Compact tile: icon above a short label (phones' "businesses & services" grid). */
function TypeTile({ t, onPick }: { t: ListingType; onPick?: () => void }) {
  return (
    <Link
      href={t.href}
      prefetch={false}
      onClick={onPick}
      className="group flex h-full flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-1 py-3 text-center shadow-xs transition active:scale-95 dark:border-slate-800 dark:bg-slate-900"
    >
      <GradientIcon t={t} size="sm" />
      <span className="text-[11.5px] font-semibold leading-tight text-slate-800 dark:text-slate-100">{t.short}</span>
    </Link>
  );
}

/** Every listing type as slim chips (icon + name) in 3 columns: the desktop home section. */
export function ListingTypesGrid({ onPick }: { onPick?: () => void }) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {LISTING_TYPES.map((t) => (
        <li key={t.href}>
          <Link
            href={t.href}
            prefetch={false}
            onClick={onPick}
            title={t.hint}
            className="group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-1.5 pr-3 shadow-xs transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm transition group-hover:scale-105", t.gradient)}>
              <t.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-slate-800 dark:text-slate-100">{t.chip ?? t.label}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const PERKS: [LucideIcon, string][] = [
  [IndianRupee, "100% free"],
  [MessageCircle, "Direct enquiries"],
  [BadgeCheck, "No commission"],
];

/**
 * "What would you like to list?" chooser with every listing type. Opened by the header's List Free
 * button and the mobile bottom bar's Post button. Phones: bottom sheet. Tablet / desktop: centred card.
 */
export function ListOnAwasioSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] gap-0 overflow-y-auto rounded-t-[28px] border-0 bg-slate-50 p-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:rounded-[28px] sm:pb-5 dark:bg-slate-950"
      >
        {/* Header band */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 px-5 pb-5 pt-3 sm:px-7 sm:pt-6 dark:from-rose-950/60 dark:via-slate-900 dark:to-amber-950/40">
          <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-rose-300/40 blur-3xl dark:bg-rose-600/20" aria-hidden />
          <span className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-600/20" aria-hidden />
          <div className="relative mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-900/15 sm:hidden dark:bg-white/20" aria-hidden />
          <SheetHeader className="relative gap-1 p-0 text-left">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 shadow-xs backdrop-blur dark:bg-slate-900/70 dark:text-rose-300">
              <Sparkles className="h-3 w-3" /> List on Awasio
            </span>
            <SheetTitle className="pr-8 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">What would you like to list?</SheetTitle>
            <SheetDescription className="text-slate-600 dark:text-slate-300">Reach people looking for exactly what you offer.</SheetDescription>
          </SheetHeader>
          <ul className="relative mt-3 flex flex-wrap gap-1.5">
            {PERKS.map(([Icon, text]) => (
              <li key={text} className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur dark:bg-slate-900/70 dark:text-slate-200">
                <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 px-4 pt-4 sm:px-7">
          <div>
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Most popular</p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {POPULAR.map((t) => (
                <li key={t.href}>
                  <TypeCard t={t} onPick={close} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Businesses &amp; services</p>
            {/* Phones: compact tiles. Tablet+: cards with hints. */}
            <ul className="grid grid-cols-3 gap-2 sm:hidden">
              {SERVICES.map((t) => (
                <li key={t.href}>
                  <TypeTile t={t} onPick={close} />
                </li>
              ))}
            </ul>
            <ul className="hidden gap-2 sm:grid sm:grid-cols-3">
              {SERVICES.map((t) => (
                <li key={t.href}>
                  <TypeCard t={t} onPick={close} />
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/post-property-free"
            prefetch={false}
            onClick={close}
            className="flex items-center justify-center gap-1 pb-1 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400"
          >
            Not sure? Start with a property listing <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
