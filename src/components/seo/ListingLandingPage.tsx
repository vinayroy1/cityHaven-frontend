// Public, indexable landing page for a listing flow that lives behind /dashboard (login + robots-blocked).
import type { ComponentType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  Coins,
  Flame,
  HardHat,
  Hotel,
  MessageCircle,
  Paintbrush,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { LISTING_SEO, type ListingSeoKey } from "@/constants/listingSeo";
import { ListingSeoDetails } from "./ListingSeoContent";
import { ListingCtaLink } from "./ListingCtaLink";

type Icon = ComponentType<{ className?: string }>;

/** Per-page look: icon, accent and an illustrative profile card (clearly labelled "Preview", no real data). */
const THEME: Partial<Record<ListingSeoKey, { icon: Icon; eyebrow: string; cover: string; preview: { name: string; sub: string; chips: string[]; price: string } }>> = {
  interior: {
    icon: Paintbrush,
    eyebrow: "For interior designers & studios",
    cover: "from-rose-500 via-fuchsia-500 to-amber-400",
    preview: { name: "Your Design Studio", sub: "Modular kitchens · Full home interiors", chips: ["Modern", "Minimal", "Turnkey"], price: "From ₹1,400/sq ft" },
  },
  construction: {
    icon: HardHat,
    eyebrow: "For builders & contractors",
    cover: "from-amber-500 via-orange-500 to-rose-500",
    preview: { name: "Your Construction Co.", sub: "House construction · Renovation", chips: ["Turnkey", "10-yr warranty", "On time"], price: "From ₹1,800/sq ft" },
  },
  pandit: {
    icon: Flame,
    eyebrow: "For pandits & vastu experts",
    cover: "from-orange-500 via-amber-500 to-yellow-400",
    preview: { name: "Pandit / Vastu Acharya", sub: "Griha pravesh · Satyanarayan katha", chips: ["Hindi", "Sanskrit", "Online puja"], price: "Dakshina from ₹2,100" },
  },
  stay: {
    icon: Hotel,
    eyebrow: "For hotels, homestays & guest houses",
    cover: "from-sky-500 via-indigo-500 to-violet-500",
    preview: { name: "Your Homestay", sub: "Rooms · Family friendly", chips: ["Wi-Fi", "Parking", "Breakfast"], price: "From ₹1,999/night" },
  },
  advisor: {
    icon: BriefcaseBusiness,
    eyebrow: "For real estate agents & advisors",
    cover: "from-emerald-500 via-teal-500 to-sky-500",
    preview: { name: "Your Agency", sub: "Buy · Rent · New projects", chips: ["Residential", "Commercial", "Plots"], price: "Free profile" },
  },
  property: {
    icon: Building2,
    eyebrow: "For owners & brokers",
    cover: "from-rose-500 via-pink-500 to-orange-400",
    preview: { name: "2 BHK Apartment", sub: "For rent · Semi-furnished", chips: ["Parking", "Lift", "Gym"], price: "₹25,000/month" },
  },
  project: {
    icon: Building2,
    eyebrow: "For builders & developers",
    cover: "from-indigo-500 via-blue-500 to-cyan-400",
    preview: { name: "Your Project", sub: "2 & 3 BHK · RERA registered", chips: ["Clubhouse", "Pool", "Possession 2028"], price: "From ₹65 Lakh" },
  },
  flatmate: {
    icon: Users,
    eyebrow: "For flatmates & room seekers",
    cover: "from-violet-500 via-fuchsia-500 to-rose-400",
    preview: { name: "Room in 3 BHK", sub: "Looking for a flatmate", chips: ["Non-smoker", "Working", "Furnished"], price: "₹9,000/month" },
  },
};

const TRUST = [
  { icon: Coins, label: "Free listing", sub: "No listing fee" },
  { icon: Sparkles, label: "1,000 free credits", sub: "On signup" },
  { icon: ShieldCheck, label: "Verified badge", sub: "Earn client trust" },
];

function PreviewCard({ seoKey }: { seoKey: ListingSeoKey }) {
  const t = THEME[seoKey] ?? THEME.interior!;
  const I = t.icon;
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden>
      {/* soft glow */}
      <div className={`absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br ${t.cover} opacity-20 blur-3xl`} />
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
        <div className={`relative h-28 bg-gradient-to-br ${t.cover}`}>
          <svg className="absolute inset-x-0 bottom-0 h-16 w-full text-white/15" viewBox="0 0 400 100" preserveAspectRatio="none" fill="currentColor">
            <path d="M0 100V60h30V40h24v20h20V25h34v35h18V15h36v45h16V35h28v25h22V30h34v30h18V10h38v50h20V45h26v15h36v40z" />
          </svg>
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Preview</span>
        </div>
        <div className="px-5 pb-5">
          <div className="relative z-10 -mt-8 flex items-end gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-white shadow-md dark:border-slate-900">
              <I className="h-7 w-7" />
            </span>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{t.preview.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.preview.sub}</p>
          <div className="mt-2 flex items-center gap-1 text-amber-500">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span className="ml-1 text-xs font-medium text-slate-500">Client reviews</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.preview.chips.map((c) => (
              <span key={c} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{t.preview.price}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <Phone className="h-4 w-4" /> Call
            </span>
            <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </span>
          </div>
        </div>
      </div>
      {/* floating enquiry toast */}
      <div className="absolute -left-8 top-8 z-20 hidden items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl sm:flex dark:border-slate-700 dark:bg-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
          <Bell className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-bold text-slate-900 dark:text-white">New enquiry</p>
          <p className="text-[11px] text-slate-500">from a client in your city</p>
        </div>
      </div>
    </div>
  );
}

export function ListingLandingPage({ seoKey }: { seoKey: ListingSeoKey }) {
  const s = LISTING_SEO[seoKey];
  const t = THEME[seoKey] ?? THEME.interior!;
  const I = t.icon;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-rose-50 via-white to-amber-50/60 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/20" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-900/10" />
          <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-3 sm:px-6 sm:pb-16 sm:pt-4 lg:px-8">
            <PageBreadcrumbs items={[{ label: s.navLabel }]} renderJsonLd />
            <div className="mt-3 grid items-center gap-8 sm:mt-6 lg:mt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold sm:gap-2 sm:px-3 sm:py-1 sm:text-xs text-rose-700 shadow-2xs backdrop-blur dark:border-rose-900/60 dark:bg-slate-900/70 dark:text-rose-300">
                  <I className="h-3.5 w-3.5" /> {t.eyebrow}
                </span>
                <h1 className="mt-2.5 text-[22px] font-extrabold leading-snug tracking-tight sm:mt-4 sm:leading-tight text-slate-900 sm:text-5xl sm:leading-[1.1] dark:text-white">
                  {s.h1}
                </h1>
                <p className="mt-2 line-clamp-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-4 sm:line-clamp-none sm:text-lg dark:text-slate-300">{s.intro}</p>
                <div className="mt-4 flex items-center gap-3 sm:mt-7">
                  <ListingCtaLink
                    href={s.ctaHref}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-rose-600 px-4 text-sm sm:h-12 sm:w-auto sm:px-6 font-semibold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700"
                  >
                    {s.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </ListingCtaLink>
                  <a
                    href="#how-it-works"
                    className="hidden h-12 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-5 text-sm sm:inline-flex font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    See how it works
                  </a>
                </div>
                <ul className="mt-4 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
                  {TRUST.map(({ icon: TI, label, sub }) => (
                    <li key={label} className="rounded-xl border border-slate-200/80 bg-white/80 p-2.5 backdrop-blur sm:rounded-2xl sm:p-3 dark:border-slate-800 dark:bg-slate-900/70">
                      <TI className="h-4 w-4 text-rose-600 sm:h-5 sm:w-5 dark:text-rose-400" />
                      <p className="mt-1 text-xs font-semibold leading-tight sm:mt-1.5 text-slate-900 sm:text-sm dark:text-white">{label}</p>
                      <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{sub}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <PreviewCard seoKey={seoKey} />
            </div>
          </div>
        </section>
        <ListingSeoDetails seoKey={seoKey} />
      </main>
      <FooterLinks />
    </div>
  );
}
