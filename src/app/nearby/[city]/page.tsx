import { OG_IMAGE_URL } from "@/constants/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { ChevronRight } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { getGuideCities, getGuideCityPage, guideCityKey } from "@/components/nearby/guideData";
import { fetchNearbyData } from "@/components/nearby/NearbyPlaces";
import { NearbyFinder } from "@/components/nearby/NearbyFinder";
import { cityJsonLd } from "@/components/nearby/seo";

export const revalidate = 86400;

const load = cache((key: string) => getGuideCityPage(key.toLowerCase()));

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const d = await load(decodeURIComponent(city));
  if (!d) return { title: "Locality guide", robots: { index: false } };
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
    alternates: { canonical: `/nearby/${d.city.key}` },
    robots: d.indexable ? undefined : { index: false, follow: true },
    openGraph: { type: "website", title, description, url: `/nearby/${d.city.key}`, siteName: "Awasio", locale: "en_IN", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GuideCityPage({ params }: Props) {
  const { city } = await params;
  const d = await load(decodeURIComponent(city));
  if (!d) {
    // Legacy single-segment locality URL (/nearby/{oldSlug}) → /nearby/{city}/{locality}.
    const legacy = await fetchNearbyData({ slug: decodeURIComponent(city) });
    if (legacy?.locality?.path) permanentRedirect(`/nearby/${legacy.locality.path}`);
    notFound();
  }
  if (d.city.key !== city.toLowerCase()) permanentRedirect(`/nearby/${d.city.key}`);
  const cityKey = d.city.key;
  const cities = await getGuideCities();

  const best = [...d.localities].sort((a, b) => b.landmarks - a.landmarks).slice(0, 12);

  return (
    <main className="min-h-screen bg-[#f7f8f6] pb-24 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd(d.city.name, `/nearby/${cityKey}`, best.map((l) => ({ name: l.name, slug: `${cityKey}/${l.key}` })))) }}
      />
      <HeaderNav />

      <section className="relative z-10 border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-10" />
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose-100/60 blur-3xl dark:bg-rose-950/20" />
        </div>
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
                  href={`/nearby/${cityKey}/${l.key}`}
                  className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{l.name}</p>
                  <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">{l.landmarks} places within 3 km</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {cities.length > 0 && (
          <section className="pt-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Other cities</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cities
                .filter((c) => c.id !== d.city.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/nearby/${guideCityKey(c)}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
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
