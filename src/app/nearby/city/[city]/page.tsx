import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { getGuideCities, getGuideLocalities, guideCityKey } from "@/components/nearby/guideData";
import { NearbyFinder } from "@/components/nearby/NearbyFinder";
import { cityJsonLd } from "@/components/nearby/seo";

export const revalidate = 86400;

const load = cache((key: string) => getGuideLocalities(key));

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const d = await load(decodeURIComponent(city));
  if (!d) return { title: "City not found", robots: { index: false } };
  const n = d.localities.length.toLocaleString("en-IN");
  const title = `Best Areas to Live in ${d.city.name}: ${n} Localities with Metro, Hospitals & Schools`;
  const description = `${d.city.name} locality guide — compare ${n} areas by nearest metro station, hospitals, schools, colleges and malls, with distances and travel time.`;
  return {
    title,
    description,
    keywords: [
      `best areas to live in ${d.city.name}`,
      `${d.city.name} localities list`,
      `${d.city.name} locality guide`,
      `areas near metro in ${d.city.name}`,
      `posh areas in ${d.city.name}`,
      `${d.city.name} area wise hospitals`,
      `${d.city.name} area wise schools`,
    ],
    alternates: { canonical: `/nearby/city/${city}` },
    openGraph: { type: "website", title, description, url: `/nearby/city/${city}`, siteName: "Awasio", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GuideCityPage({ params }: Props) {
  const { city } = await params;
  const d = await load(decodeURIComponent(city));
  if (!d) notFound();
  const cities = await getGuideCities();

  const sorted = [...d.localities].sort((a, b) => a.name.localeCompare(b.name));
  const letters = new Map<string, typeof sorted>();
  for (const l of sorted) {
    const k = /[a-z]/i.test(l.name[0]) ? l.name[0].toUpperCase() : "#";
    letters.set(k, [...(letters.get(k) ?? []), l]);
  }
  const best = [...d.localities].sort((a, b) => b.landmarks - a.landmarks).slice(0, 8);

  return (
    <main className="min-h-screen bg-[#f7f8f6] pb-24 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd(d.city.name, `/nearby/city/${city}`, sorted)) }}
      />
      <HeaderNav />

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-10" />
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
          <nav className="flex items-center gap-1 text-xs text-slate-500">
            <Link href="/nearby" className="hover:text-slate-800">
              Locality guide
            </Link>
            <ChevronRight className="h-3 w-3" /> {d.city.name}
          </nav>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Best areas to live in {d.city.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Metro, hospitals, schools, colleges and malls for {d.localities.length.toLocaleString("en-IN")} localities in{" "}
            {d.city.name}. Pick an area to see everything nearby.
          </p>
          <div className="mt-5 max-w-2xl">
            <NearbyFinder defaultCity={d.city.name} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {best.length > 0 && (
          <section className="pt-7">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Best-connected areas</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {best.map((l) => (
                <Link
                  key={l.id}
                  href={`/nearby/${l.slug}`}
                  className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{l.name}</p>
                  <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">{l.landmarks} places within 3 km</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pt-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">All localities A–Z</h2>
          <div className="mt-3 flex flex-wrap gap-1">
            {[...letters.keys()].map((k) => (
              <a
                key={k}
                href={`#l-${k}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800"
              >
                {k}
              </a>
            ))}
          </div>
          <div className="mt-4 space-y-5">
            {[...letters.entries()].map(([k, list]) => (
              <div key={k} id={`l-${k}`} className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-2 text-sm font-black text-emerald-600">{k}</p>
                <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
                  {list.map((l) => (
                    <li key={l.id} className="min-w-0">
                      <Link href={`/nearby/${l.slug}`} className="flex items-center gap-1.5 truncate text-sm text-slate-700 hover:text-emerald-700 dark:text-slate-300">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-300" />
                        <span className="truncate">{l.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {cities.length > 0 && (
          <section className="pt-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Other cities</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cities
                .filter((c) => c.id !== d.city.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/nearby/city/${guideCityKey(c)}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
