"use client";
/**
 * Slim, dismissible promo strip under the home search. Rotates one message at a time;
 * the "boost" message only shows to logged-in users. Clicks are pushed to window.dataLayer
 * (no-op if no analytics is loaded).
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, PlusCircle, Rocket, Users, X } from "lucide-react";
import authService from "@/lib/services/api/auth";

type Promo = { id: string; text: string; short: string; cta: string; href: string; icon: typeof PlusCircle; authOnly?: boolean };

const PROMOS: Promo[] = [
  {
    id: "post-free",
    text: "Post your property FREE · Zero brokerage · Live in 2 min",
    short: "0% brokerage",
    cta: "Post Free",
    href: "/propertyListing",
    icon: PlusCircle,
  },
  /* Temporarily disabled:
  {
    id: "landmarks",
    text: "Now see nearby metro, hospitals & schools for every locality",
    short: "Metro & hospitals nearby",
    cta: "Explore",
    href: "/propertySearch",
    icon: MapPin,
  },
  */
  {
    id: "flatmate",
    text: "Find a flatmate free · Post your room in minutes",
    short: "Find a flatmate free",
    cta: "Post room",
    href: "/flatmates/post",
    icon: Users,
  },
  {
    id: "boost",
    text: "Boost your listing — get up to 5× more views",
    short: "5× more views",
    cta: "Boost",
    href: "/dashboard/properties",
    icon: Rocket,
    authOnly: true,
  },
];

const DISMISS_KEY = "awasio:promo-strip-dismissed";

function track(event: string, promoId: string) {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer?.push({ event, promoId });
  } catch {
    /* ignore */
  }
}

export function PromoStrip() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* storage blocked */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only flags read after mount
    setDismissed(hidden);
    setLoggedIn(authService.isAuthenticated());
    setReady(true);
  }, []);

  const promos = useMemo(() => PROMOS.filter((p) => !p.authOnly || loggedIn), [loggedIn]);

  useEffect(() => {
    if (promos.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % promos.length), 5000);
    return () => clearInterval(t);
  }, [promos.length]);

  if (!ready || dismissed || promos.length === 0) return null;
  const p = promos[index % promos.length];
  const Icon = p.icon;

  return (
    <div className="mx-auto mt-3 w-full max-w-3xl" data-testid="promo-strip">
      <div
        className="relative flex h-11 items-center gap-2 overflow-hidden rounded-xl border border-rose-200/80 bg-rose-50/90 pl-3 pr-1.5 text-slate-800 shadow-2xs transition-colors duration-500 dark:border-rose-900/40 dark:bg-slate-900 dark:text-slate-100"
      >
        <Icon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
        <Link
          key={p.id}
          href={p.href}
          onClick={() => track("promo_click", p.id)}
          className="flex min-w-0 flex-1 items-center gap-2 animate-in fade-in duration-500"
        >
          <span className="min-w-0 flex-1 truncate text-left text-[12px] font-semibold sm:text-sm">
            <span className="sm:hidden">{p.short}</span>
            <span className="hidden sm:inline">{p.text}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-rose-700">
            {p.cta} <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setDismissed(true);
            track("promo_dismiss", p.id);
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-rose-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {promos.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-1" aria-hidden>
          {promos.map((q, i) => (
            <span
              key={q.id}
              className={`h-1 rounded-full transition-all ${i === index % promos.length ? "w-4 bg-slate-500" : "w-1 bg-slate-300 dark:bg-slate-700"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
