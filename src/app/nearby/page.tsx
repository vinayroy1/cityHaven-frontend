import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HeartPulse, Search, TramFront } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { NearbyFinder } from "@/components/nearby/NearbyFinder";
import { fetchNearbyData } from "@/components/nearby/NearbyPlaces";
import { CATEGORY_META, categoryOf, fmtKm, type CategoryKey, type ExplorerItem } from "@/components/nearby/nearbyCategories";
import { flattenGroups } from "@/components/nearby/LocalityGuide";
import { getGuideCities, guideCityKey } from "@/components/nearby/guideData";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Find Metro, Hospitals, Schools & Malls Near Any Locality",
  description:
    "Check nearby metro stations, hospitals, schools, colleges, malls, IT parks and airports for any locality in India, with distances and travel time. Free locality guide by Awasio.",
  alternates: { canonical: "/nearby" },
};

const POPULAR: Array<[string, string]> = [
  ["Koramangala", "Bengaluru"],
  ["Andheri West", "Mumbai"],
  ["Saket", "New Delhi"],
  ["Gachibowli", "Hyderabad"],
  ["Hinjewadi", "Pune"],
  ["Powai", "Mumbai"],
  ["Indiranagar", "Bengaluru"],
  ["Sector 62", "Noida"],
];

type Card = { name: string; city: string; slug: string; items: ExplorerItem[] };

function nearest(items: ExplorerItem[], cat: CategoryKey) {
  return [...items].filter((i) => categoryOf(i) === cat).sort((a, b) => a.distanceKm - b.distanceKm)[0];
}

async function loadPopular(): Promise<Card[]> {
  const res = await Promise.all(
    POPULAR.map(async ([locality, cityName]) => {
      const d = await fetchNearbyData({ locality, cityName });
      if (!d?.locality?.slug || !d.groups) return null;
      return {
        name: d.locality.name || locality,
        city: d.locality.cityName || cityName,
        slug: d.locality.slug,
        items: flattenGroups(d.groups),
      };
    }),
  );
  return res.filter((c): c is Card => Boolean(c));
}

const PREVIEW: CategoryKey[] = ["metro", "hospital", "school", "mall"];

export default async function NearbyIndexPage() {
  const [cards, guideCities] = await Promise.all([loadPopular(), getGuideCities()]);
  const sample = cards[0];

  return (
    <main className="min-h-screen bg-[#f7f8f6] pb-24 dark:bg-slate-950">
      <HeaderNav />

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-10" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/30" />
          <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-900/20" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:pb-16 lg:pt-14">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900">
              Free locality guide · 2.5 lakh+ localities
            </span>
            <h1 className="mt-3 text-[34px] font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Know the neighbourhood <span className="text-emerald-600">before you move.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Nearest metro, hospitals, schools, colleges, malls and airport for any locality — with walking and driving time.
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-semibold text-slate-500">
                <Search className="h-3.5 w-3.5 text-emerald-600" /> Pick a city, then your locality
              </div>
              <div className="px-1 pb-1">
                <NearbyFinder stacked />
              </div>
            </div>
          </div>

          {/* Live example card (desktop) */}
          {sample && (
            <Link
              href={`/nearby/${sample.slug}`}
              className="group relative hidden rotate-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 transition hover:rotate-0 dark:border-slate-800 dark:bg-slate-900 lg:block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Example</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{sample.name}</p>
                  <p className="text-sm text-slate-500">{sample.city}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-emerald-600" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {PREVIEW.map((cat) => {
                  const it = nearest(sample.items, cat);
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  return (
                    <div key={cat} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.dot}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{meta.label}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{it ? fmtKm(it.distanceKm) : "—"}</p>
                      <p className="truncate text-[11px] text-slate-500">{it?.name ?? "None close by"}</p>
                    </div>
                  );
                })}
              </div>
            </Link>
          )}
        </div>
      </section>

      {cards.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Popular localities</h2>
            <span className="text-xs text-slate-500">Tap to explore</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => {
              const metro = nearest(c.items, "metro") ?? nearest(c.items, "rail");
              const hosp = nearest(c.items, "hospital");
              return (
                <Link
                  key={c.slug}
                  href={`/nearby/${c.slug}`}
                  className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.city}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-600" />
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    {metro && (
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <TramFront className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                        <span className="min-w-0 flex-1 truncate">{metro.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{fmtKm(metro.distanceKm)}</span>
                      </p>
                    )}
                    {hosp && (
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <HeartPulse className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                        <span className="min-w-0 flex-1 truncate">{hosp.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{fmtKm(hosp.distanceKm)}</span>
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {guideCities.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Browse by city</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {guideCities.map((c) => (
              <Link
                key={c.id}
                href={`/nearby/city/${guideCityKey(c)}`}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
