"use client";

import React from "react";
import Link from "next/link";
import { BellRing, Check, FileSearch, Mail, MessageCircle, Rocket, ScanSearch, Send, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type ReviewAccent = "violet" | "amber" | "orange" | "sky";

/** One accent per vertical. Full class strings so Tailwind keeps them. */
const ACCENT: Record<ReviewAccent, { glow: string; ring: string; chip: string; bar: string; text: string; soft: string; sweep: string }> = {
  violet: {
    glow: "from-violet-600/30 via-fuchsia-500/20 to-sky-500/20",
    ring: "border-violet-300/40",
    chip: "bg-violet-500/15 text-violet-100 ring-violet-300/30",
    bar: "from-violet-400 via-fuchsia-400 to-sky-400",
    text: "text-violet-300",
    soft: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    sweep: "rgba(167,139,250,0.55)",
  },
  amber: {
    glow: "from-amber-500/30 via-orange-500/20 to-yellow-400/20",
    ring: "border-amber-300/40",
    chip: "bg-amber-500/15 text-amber-100 ring-amber-300/30",
    bar: "from-amber-300 via-orange-400 to-yellow-300",
    text: "text-amber-300",
    soft: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    sweep: "rgba(251,191,36,0.55)",
  },
  sky: {
    glow: "from-sky-500/30 via-indigo-500/20 to-cyan-400/20",
    ring: "border-sky-300/40",
    chip: "bg-sky-500/15 text-sky-100 ring-sky-300/30",
    bar: "from-sky-300 via-indigo-300 to-cyan-300",
    text: "text-sky-300",
    soft: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    sweep: "rgba(56,189,248,0.55)",
  },
  orange: {
    glow: "from-orange-500/30 via-rose-500/20 to-amber-400/20",
    ring: "border-orange-300/40",
    chip: "bg-orange-500/15 text-orange-100 ring-orange-300/30",
    bar: "from-orange-300 via-rose-400 to-amber-300",
    text: "text-orange-300",
    soft: "bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
    sweep: "rgba(251,146,60,0.55)",
  },
};

export type ReviewAction = { label: string; hint: string; href?: string; onClick?: () => void; icon: React.ComponentType<{ className?: string }> };

type Props = {
  accent: ReviewAccent;
  /** e.g. "interior studio", "construction company", "pandit profile" */
  noun: string;
  name?: string | null;
  submittedAt?: string | null;
  /** Hours the team aims to review within. Drives the ETA bar. */
  slaHours?: number;
  /** What the reviewer looks at, shown as checklist and orbiting chips. */
  checks: string[];
  /** "While you wait" cards. */
  actions?: ReviewAction[];
  primary?: { label: string; href: string };
};

function useNow(ms = 30_000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const ago = (mins: number) => {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ${mins % 60}m ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

/** Animated "being reviewed" scanner: pulsing rings, a rotating sweep and orbiting check chips. */
function Scanner({ accent, checks }: { accent: ReviewAccent; checks: string[] }) {
  const a = ACCENT[accent];
  const chips = checks.slice(0, 4);
  return (
    <div className="relative mx-auto aspect-square w-52 sm:w-60" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cn("absolute rounded-full border", a.ring)} style={{ inset: `${i * 16}%` }} />
      ))}
      <span className={cn("absolute inset-[30%] rounded-full border-2 motion-safe:animate-ping", a.ring)} style={{ animationDuration: "2.6s" }} />
      <span
        className="absolute inset-0 rounded-full motion-safe:animate-[spin_4s_linear_infinite]"
        style={{ background: `conic-gradient(from 0deg, transparent 0deg, transparent 280deg, ${a.sweep} 360deg)`, maskImage: "radial-gradient(circle, transparent 30%, black 31%)" }}
      />
      <div className="absolute inset-[34%] flex items-center justify-center rounded-full bg-white/10 shadow-[0_0_60px_-10px] shadow-white/40 ring-1 ring-white/25 backdrop-blur">
        <ShieldCheck className="h-10 w-10 text-white sm:h-12 sm:w-12" strokeWidth={1.6} />
      </div>
      {/* chips orbit; each counter-rotates so its text stays upright */}
      <div className="absolute inset-0 motion-safe:animate-[spin_22s_linear_infinite]">
        {chips.map((c, i) => {
          const angle = (360 / chips.length) * i;
          return (
            <div key={c} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg) translateY(-50%) translate(-50%, -112px)` }}>
              <div style={{ transform: `rotate(${-angle}deg)` }}>
                <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 backdrop-blur motion-safe:animate-[spin_22s_linear_infinite_reverse]", a.chip)}>
                  <ScanSearch className="h-3 w-3" /> {c}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STEPS = [
  { label: "Submitted", icon: Send },
  { label: "Quality check", icon: FileSearch },
  { label: "Verification", icon: ShieldCheck },
  { label: "Live", icon: Rocket },
];

/** Full-width "your listing is under review" hero shared by the interior, construction and pandit flows. */
export function UnderReviewHero({ accent, noun, name, submittedAt, slaHours = 24, checks, actions = [], primary }: Props) {
  const a = ACCENT[accent];
  const now = useNow();
  const start = submittedAt ? new Date(submittedAt).getTime() : null;
  const mins = start ? Math.max(0, Math.floor((now - start) / 60_000)) : 0;
  // Never show 100%: the bar is reassurance, not a promise.
  const pct = start ? Math.min(92, Math.max(8, (mins / (slaHours * 60)) * 100)) : 18;
  const current = pct < 45 ? 1 : 2;
  const overdue = start != null && mins > slaHours * 60;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-slate-950 px-5 pb-8 pt-7 text-white sm:px-10 sm:pb-10 sm:pt-10">
        <div className={cn("absolute -inset-20 -z-10 bg-gradient-to-br blur-3xl", a.glow)} />
        <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1", a.chip)}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              Review in progress
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {name ? (
                <>
                  <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", a.bar)}>{name}</span> is with our review team
                </>
              ) : (
                <>Your {noun} is with our review team</>
              )}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              A real person checks every {noun} before it goes live, so customers trust what they see. Most reviews finish within {slaHours} hours.
            </p>

            {/* ETA */}
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{start ? `Submitted ${ago(mins)}` : "Submitted"}</span>
                <span className={cn("font-semibold", a.text)}>{overdue ? "Taking a little longer, almost there" : `Usually live within ${slaHours}h`}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={cn("relative h-full rounded-full bg-gradient-to-r transition-[width] duration-1000", a.bar)} style={{ width: `${pct}%` }}>
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)] bg-[length:200%_100%] motion-safe:animate-[shimmer_2s_linear_infinite]" />
                </div>
              </div>
            </div>
          </div>
          <Scanner accent={accent} checks={checks} />
        </div>

        {/* Steps */}
        <ol className="mt-8 grid grid-cols-4 gap-1 sm:gap-3">
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const Icon = done ? Check : s.icon;
            return (
              <li key={s.label} className="relative flex flex-col items-center text-center">
                {i < STEPS.length - 1 && (
                  <span className={cn("absolute left-1/2 top-5 h-0.5 w-full", done ? cn("bg-gradient-to-r", a.bar) : "bg-white/15")} aria-hidden />
                )}
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-1 transition",
                    done ? "bg-white text-slate-900 ring-white" : active ? "bg-slate-900 text-white ring-2 ring-white/70" : "bg-slate-900 text-white/40 ring-white/15",
                  )}
                >
                  {active && <span className="absolute inset-0 rounded-full ring-4 ring-white/20 motion-safe:animate-pulse" />}
                  <Icon className="h-4 w-4" />
                </span>
                <span className={cn("mt-2 text-[11px] font-semibold sm:text-xs", done || active ? "text-white" : "text-white/45")}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Body */}
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">What our team is checking</h3>
          <ul className="mt-3 space-y-2">
            {checks.map((c, i) => (
              <li key={c} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", a.soft)}>{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Nothing to do right now. We&apos;ll tell you the moment you&apos;re live
              <span className="ml-1 inline-flex items-center gap-1 align-middle text-emerald-700 dark:text-emerald-300">
                <MessageCircle className="h-3.5 w-3.5" /> <Mail className="h-3.5 w-3.5" />
              </span>
            </p>
          </div>
        </div>

        {actions.length > 0 && (
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-amber-500" /> While you wait, stand out from day one
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {actions.map((x) => {
                const inner = (
                  <>
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl transition group-hover:scale-110", a.soft)}>
                      <x.icon className="h-5 w-5" />
                    </span>
                    <span className="mt-3 block text-sm font-bold text-slate-900 dark:text-white">{x.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{x.hint}</span>
                  </>
                );
                const cls = "group block rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700";
                return x.href ? (
                  <Link key={x.label} href={x.href} className={cls}>{inner}</Link>
                ) : (
                  <button key={x.label} type="button" onClick={x.onClick} className={cls}>{inner}</button>
                );
              })}
            </div>
            {primary && (
              <Link href={primary.href} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-900">
                {primary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
