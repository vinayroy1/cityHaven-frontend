"use client";
/**
 * Home page promotional banner carousel. Swipeable (scroll-snap) with a peek of the next slide on
 * mobile, auto-advances every 5s, pauses on hover/touch. Slides are a static list for now; move
 * them to the backend later (image, href, city, start/end dates, priority).
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BadgePercent, Building2, ChevronLeft, ChevronRight, Hotel, Paintbrush, PlusCircle, Zap, type LucideIcon } from "lucide-react";

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  cta: string;
  href: string;
  icon: LucideIcon;
  bg: string;
  accent: string;
  chips: string[];
  sponsored?: boolean;
  /** Opens the sign-up / welcome-credits dialog instead of navigating. */
  opensCredits?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: "post-free",
    eyebrow: "For owners",
    title: "Post your property FREE",
    highlight: "· 0% commission",
    body: "No brokerage, no hidden charges. Live in 2 minutes, reach verified buyers & tenants.",
    cta: "Post property free",
    href: "/propertyListing",
    icon: PlusCircle,
    bg: "from-slate-950 via-slate-900 to-rose-800",
    accent: "text-amber-300",
    chips: ["0% commission", "Zero brokerage", "Live in 2 min", "Verified leads", "WhatsApp alerts"],
  },  {
    id: "free-credits",
    eyebrow: "Welcome bonus",
    title: "Sign up & get",
    highlight: "1,000 free credits",
    body: "Unlock verified buyer & tenant contacts and boost your listings, on us.",
    cta: "Claim free credits",
    href: "/propertyListing",
    opensCredits: true,
    icon: Zap,
    bg: "from-amber-500 via-orange-500 to-rose-500",
    accent: "text-rose-950",
    chips: ["1,000 credits free", "Unlock contacts", "Boost listings"],
  },

  {
    id: "projects",
    eyebrow: "New launches",
    title: "RERA-approved",
    highlight: "new projects",
    body: "Compare builders, floor plans and prices in one place.",
    cta: "Explore projects",
    href: "/new-projects",
    icon: Building2,
    bg: "from-slate-800 via-slate-700 to-rose-700",
    accent: "text-amber-300",
    chips: ["Floor plans", "Price lists", "Site visits"],
  },
  {
    id: "stays",
    eyebrow: "Hotels & stays",
    title: "Moving to a new city?",
    highlight: "Stay first.",
    body: "Short and long stays near offices, metros and hospitals.",
    cta: "Find a stay",
    href: "/stays",
    icon: Hotel,
    bg: "from-amber-500 via-orange-400 to-rose-400",
    accent: "text-rose-900",
    chips: ["Daily & monthly", "Near metro", "Instant contact"],
  },
  {
    id: "interiors",
    eyebrow: "Interiors",
    title: "Design your dream home",
    highlight: "with top designers",
    body: "Browse portfolios and get quotes from interior designers near you.",
    cta: "Meet designers",
    href: "/interior-designers",
    icon: Paintbrush,
    bg: "from-rose-700 via-rose-600 to-pink-500",
    accent: "text-amber-200",
    chips: ["Portfolios", "Free quotes", "Modular kitchens"],
  },

];

const AUTO_MS = 5000;

export function HomeBannerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const n = (i + SLIDES.length) % SLIDES.length;
    const slide = track.children[n] as HTMLElement | undefined;
    if (slide) track.scrollTo({ left: slide.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || "0"), behavior: "smooth" });
  }, []);

  // Track the visible slide as the user swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i));
      },
      { root: track, threshold: 0.6 },
    );
    Array.from(track.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => goTo(index + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, paused, goTo]);

  const track = (id: string) => {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer?.push({ event: "home_banner_click", banner_id: id });
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      className="group/carousel relative mt-3 sm:mt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
    >
      <div
        ref={trackRef}
        className="relative -mx-4 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((s, i) => {
          return (
            <Link
              key={s.id}
              href={s.href}
              data-i={i}
              onClick={(e) => {
                track(s.id);
                if (s.opensCredits) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("awasio:open-welcome-credits", { detail: { returnUrl: window.location.pathname } }));
                }
              }}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}: ${s.title} ${s.highlight}`}
              className={`group relative isolate flex min-h-[150px] w-[88%] shrink-0 snap-start items-center overflow-hidden rounded-2xl px-4 py-4 text-white shadow-md transition hover:shadow-xl sm:min-h-[190px] sm:w-full sm:px-8 sm:py-6 bg-gradient-to-br ${s.bg}`}
            >
              {/* Soft decoration over the gradient */}
              <div aria-hidden className="absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
              <div aria-hidden className="absolute -bottom-20 right-1/3 -z-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
              <s.icon aria-hidden className="absolute -bottom-6 right-4 -z-10 h-32 w-32 rotate-[-12deg] text-white/15 transition duration-500 group-hover:rotate-0 group-hover:scale-105 sm:right-56 sm:h-44 sm:w-44" />

              <div className="flex w-full items-end justify-between gap-3 sm:items-center">
                <div className="min-w-0 max-w-[85%] sm:max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur-sm">
                      <BadgePercent className="h-3 w-3" /> {s.eyebrow}
                    </span>
                    {s.sponsored && <span className="text-[10px] font-medium text-white/70">Sponsored</span>}
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-tight drop-shadow-sm sm:text-3xl">
                    {s.title} <span className={s.accent}>{s.highlight}</span>
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-white/85 sm:text-sm">{s.body}</p>
                  <div className="mt-2.5 hidden flex-wrap gap-1.5 sm:flex">
                    {s.chips.map((c) => (
                      <span key={c} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition group-hover:gap-3 sm:inline-flex">
                  {s.cta} <ArrowRight className="h-4 w-4 text-rose-600" />
                </span>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-lg sm:hidden">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Arrows (desktop) */}
      <button
        type="button"
        aria-label="Previous offer"
        onClick={() => goTo(index - 1)}
        className="absolute left-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 opacity-0 shadow-lg transition hover:bg-white group-hover/carousel:opacity-100 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next offer"
        onClick={() => goTo(index + 1)}
        className="absolute right-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 opacity-0 shadow-lg transition hover:bg-white group-hover/carousel:opacity-100 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="mt-2 flex justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to offer ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-rose-600" : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700"}`}
          />
        ))}
      </div>
    </section>
  );
}
