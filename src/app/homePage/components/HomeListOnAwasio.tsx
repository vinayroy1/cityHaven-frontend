"use client";

import React from "react";
import Link from "next/link";
import { BedDouble, Building, Building2, Flame, HardHat, Home, LayoutGrid, Paintbrush, UserCheck, Users, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/** Every kind of listing an owner or business can post, each linking to its free-listing landing page. */
export const LISTING_TYPES: { label: string; short: string; href: string; icon: LucideIcon; tone: string }[] = [
  { label: "Property (rent / sell)", short: "Property", href: "/post-property-free", icon: Home, tone: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/50" },
  { label: "Hotel / homestay", short: "Hotel / Stay", href: "/list-your-hotel", icon: BedDouble, tone: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/50" },
  { label: "PG / flatmate", short: "Flatmate", href: "/flatmates/post", icon: Users, tone: "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-900/50" },
  { label: "Interior business", short: "Interiors", href: "/list-interior-business", icon: Paintbrush, tone: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/50" },
  { label: "Construction company", short: "Construction", href: "/list-construction-company", icon: HardHat, tone: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/50" },
  { label: "Pandit & Vastu", short: "Pandit", href: "/list-pandit-services", icon: Flame, tone: "bg-orange-50 text-orange-600 ring-orange-100 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-900/50" },
  { label: "New project (builder)", short: "Project", href: "/post-project", icon: Building2, tone: "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900/50" },
  { label: "Commercial space", short: "Commercial", href: "/list-commercial-property", icon: Building, tone: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700" },
  { label: "Property advisor", short: "Advisor", href: "/become-property-advisor", icon: UserCheck, tone: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/50" },
];

/** Shown on phones: the three most-posted types; the rest live in the sheet. */
const PHONE_ROW = LISTING_TYPES.slice(0, 3);

const tileCls =
  "group flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-1 py-2 text-center text-[11px] font-semibold leading-tight text-slate-800 shadow-xs transition active:scale-95 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

/** 3 x 3 grid of every listing type: used in the bottom sheet and on tablet / desktop. */
function ListingTypesGrid({ onPick }: { onPick?: () => void }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-2.5">
      {LISTING_TYPES.map(({ label, short, href, icon: Icon, tone }) => (
        <li key={href}>
          <Link
            href={href}
            prefetch={false}
            onClick={onPick}
            className={`${tileCls} py-3 sm:flex-row sm:justify-start sm:gap-2 sm:whitespace-nowrap sm:py-2 sm:pl-2 sm:pr-3.5 sm:text-left sm:text-sm sm:hover:-translate-y-0.5 sm:hover:border-rose-200 sm:hover:shadow-md`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 sm:h-8 sm:w-8 sm:rounded-lg ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="sm:hidden">{short}</span>
            <span className="hidden truncate sm:inline">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Bottom sheet with every listing type. Also opened by the Post button in the mobile bottom bar. */
export function ListOnAwasioSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] gap-2 overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden />
        <SheetHeader className="pb-1 pt-1 text-left">
          <SheetTitle className="flex items-center gap-2">
            What would you like to list?
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Free</span>
          </SheetTitle>
          <SheetDescription>Get enquiries directly from customers. No commission.</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <ListingTypesGrid onPick={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * "List on Awasio" on the home page so owners and businesses don't hunt through menus.
 * Phones: one slim row (3 common types + "All 9") to keep the first screen for buyers; the full
 * list opens in a bottom sheet. Tablet / desktop: the full 3 x 3 grid, since there is room.
 */
export function HomeListOnAwasio() {
  const [open, setOpen] = React.useState(false);
  return (
    <section aria-labelledby="list-on-awasio" className="mt-3 text-left sm:mt-6">
      <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 p-2.5 shadow-xs sm:p-4 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <h2 id="list-on-awasio" className="text-[13px] font-extrabold text-slate-900 sm:text-base dark:text-white">
            List on Awasio <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Free</span>
          </h2>
          <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">Owners, hosts and businesses: get leads directly</span>
        </div>

        {/* Phones: one row of four. */}
        <ul className="mt-2 grid grid-cols-4 gap-1.5 sm:hidden">
          {PHONE_ROW.map(({ short, href, icon: Icon, tone }) => (
            <li key={href}>
              <Link href={href} prefetch={false} className={tileCls}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-1 ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {short}
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={`${tileCls} w-full border-rose-200 bg-rose-50/60 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-sm">
                <LayoutGrid className="h-4 w-4" />
              </span>
              All {LISTING_TYPES.length} ›
            </button>
          </li>
        </ul>

        {/* Tablet / desktop: everything. */}
        <div className="mt-2.5 hidden sm:block">
          <ListingTypesGrid />
        </div>
      </div>
      <ListOnAwasioSheet open={open} onOpenChange={setOpen} />
    </section>
  );
}
