"use client";
/**
 * Home page "Nearby" spotlight: Awasio's unique locality guide as a compact card with the
 * connectivity score, the nearest metro/hospital/school etc. and a mini radar (desktop).
 * Rotates through a few popular localities until the visitor picks one.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { CATEGORY_META, fmtKm } from "@/components/nearby/nearbyCategories";
import { useCountryCode } from "@/lib/country/useCountry";
import type { SpotlightLocality } from "../lib/nearbySpotlight";

const ROTATE_MS = 6000;

export function NearbySpotlight({ byCountry }: { byCountry: Record<string, SpotlightLocality[]> }) {
  const country = useCountryCode();
  // Only the selected portal country's localities; nothing (not India's) if we have none for it.
  const localities = byCountry[country] ?? [];
  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);
  const [prevCountry, setPrevCountry] = useState(country);
  if (prevCountry !== country) {
    setPrevCountry(country);
    setActive(0);
    setLocked(false);
  }

  useEffect(() => {
    if (locked || localities.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % localities.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [locked, localities.length]);

  if (!localities.length) return null;
  const loc = localities[Math.min(active, localities.length - 1)];

  return (
    <section className="mt-5 sm:mt-6" aria-labelledby="nearby-spotlight-title">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/20" />

        <div className="relative flex gap-6">
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  <Sparkles className="h-3 w-3" /> Only on Awasio
                </span>
                <h2 id="nearby-spotlight-title" className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                  Know the neighbourhood{" "}
                  <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">before you move</span>
                </h2>
                <p className="mt-0.5 hidden text-sm text-slate-600 sm:block dark:text-slate-400">
                  Real distances to metro, hospitals, schools and malls for every locality.
                </p>
              </div>
              <Link
                href="/nearby"
                className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <MapPin className="h-4 w-4 text-rose-600" /> Check your locality
              </Link>
            </div>

            {/* Locality tabs + score */}
            <div className="mt-3 flex items-center gap-2">
              <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
                {localities.map((l, i) => (
                  <button
                    key={l.slug}
                    type="button"
                    onClick={() => {
                      setActive(i);
                      setLocked(true);
                    }}
                    className={`relative shrink-0 overflow-hidden rounded-full border px-3 py-1 text-xs font-semibold transition-colors sm:text-[13px] ${
                      i === active
                        ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {l.name}
                    {i === active && !locked && localities.length > 1 && (
                      <span key={`p-${active}`} className="absolute bottom-0 left-0 h-0.5 bg-white/70 animate-[spotlight-progress_6s_linear]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nearest landmarks */}
            <div
              key={loc.slug}
              className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6 animate-[spotlight-fade_0.4s_ease-out]"
            >
              {loc.stops.map((s) => {
                const meta = CATEGORY_META[s.cat];
                const Icon = meta.icon;
                return (
                  <div
                    key={s.cat}
                    className="w-[132px] shrink-0 rounded-xl border border-slate-200/80 bg-white/90 p-2.5 transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm sm:w-auto dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${meta.dot}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{meta.label}</span>
                    </div>
                    <p className="mt-1.5 text-base font-bold tabular-nums text-slate-900 dark:text-white">{fmtKm(s.km)}</p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400" title={s.name}>{s.name}</p>
                  </div>
                );
              })}
            </div>

            <Link
              href={`/nearby/${loc.slug}`}
              className="group mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              Explore {loc.name}, {loc.city} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <Radar loc={loc} />
        </div>
      </div>
    </section>
  );
}

/** Mini radar with the locality at the centre and landmarks placed by distance (desktop only). */
function Radar({ loc }: { loc: SpotlightLocality }) {
  const c = 2 * Math.PI * 22;
  return (
    <div className="relative hidden h-[210px] w-[210px] shrink-0 self-center select-none lg:block">
      {[100, 66, 34].map((s) => (
        <div
          key={s}
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-rose-200 dark:border-slate-700"
          style={{ width: `${s}%`, height: `${s}%` }}
        />
      ))}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full animate-[spin_6s_linear_infinite] [background:conic-gradient(from_0deg,rgba(225,29,72,0.14),transparent_22%)]"
      />
      {loc.stops.map((s, i) => {
        const meta = CATEGORY_META[s.cat];
        const Icon = meta.icon;
        const angle = (i / loc.stops.length) * 2 * Math.PI - Math.PI / 2 + 0.5;
        const r = 24 + Math.min(s.km / 5, 1) * 24;
        return (
          <span
            key={`${loc.slug}-${s.cat}`}
            title={`${meta.label}: ${fmtKm(s.km)}`}
            className={`absolute inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${meta.chip} text-white shadow-md ring-2 ring-white animate-[spotlight-pop_0.4s_ease-out_both] dark:ring-slate-900`}
            style={{ left: `${50 + r * Math.cos(angle)}%`, top: `${50 + r * Math.sin(angle)}%`, animationDelay: `${i * 70}ms` }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        );
      })}
      <div className="absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
        <svg viewBox="0 0 50 50" className="absolute inset-0 -rotate-90">
          <circle cx="25" cy="25" r="22" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="url(#spot-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - loc.score / 100)}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          <defs>
            <linearGradient id="spot-grad" x1="0" x2="1">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center leading-none">
          <div className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{loc.score}</div>
          <div className="mt-0.5 text-[7px] font-semibold uppercase tracking-wider text-slate-400">{loc.verdict}</div>
        </div>
      </div>
    </div>
  );
}
