import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowRight, Building2, ChevronRight, Home, MapPin, Users } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { fetchNearbyData } from "@/components/nearby/NearbyPlaces";
import { HighlightTiles, ScoreRing, connectivityScore, flattenGroups } from "@/components/nearby/LocalityGuide";
import { LocalityExplorer } from "@/components/nearby/LocalityExplorer";
import { LocalityFaq } from "@/components/nearby/LocalityFaq";
import { NearbyFinder } from "@/components/nearby/NearbyFinder";
import { toSearchSlug } from "@/components/search/searchQuery";
import { getGuideCities, guideCityKey } from "@/components/nearby/guideData";
import { localityFaqs, localityJsonLd, localityMetadata, type LocalitySeoInput } from "@/components/nearby/seo";

const getData = cache(async (slug: string) => fetchNearbyData({ slug, expanded: true }));

type Props = { params: Promise<{ slug: string }> };

function seoInput(slug: string, d: NonNullable<Awaited<ReturnType<typeof getData>>>): LocalitySeoInput {
  return {
    name: d.locality?.name || "",
    city: d.locality?.cityName || "",
    slug,
    pincode: d.pincode,
    coordinates: d.coordinates,
    items: d.groups ? flattenGroups(d.groups) : [],
    indexable: d.indexable,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getData(decodeURIComponent(slug));
  if (!d?.locality?.name || !d.groups) return { title: "Locality not found", robots: { index: false } };
  return localityMetadata(seoInput(slug, d));
}

export default async function NearbyLocalityPage({ params }: Props) {
  const { slug } = await params;
  const d = await getData(decodeURIComponent(slug));
  if (!d?.locality?.name) notFound();

  const name = d.locality.name;
  const city = d.locality.cityName || "";
  const citySlug = city ? toSearchSlug(city) : "";
  const locSlug = toSearchSlug(name);
  const items = d.groups ? flattenGroups(d.groups) : [];
  const guideCity = (await getGuideCities()).find((c) => c.name.toLowerCase() === city.toLowerCase());
  const seo = seoInput(slug, d);
  const faqs = localityFaqs(seo);
  const jsonLd = localityJsonLd(seo, faqs, guideCity ? `/nearby/city/${guideCityKey(guideCity)}` : undefined);
  const score = items.length ? connectivityScore(items) : null;

  const homeLinks = citySlug
    ? [
        { href: `/rent/${citySlug}/${locSlug}`, label: `Rent in ${name}`, icon: Home },
        { href: `/buy/${citySlug}/${locSlug}`, label: `Buy in ${name}`, icon: Building2 },
        { href: `/flatmates?city=${encodeURIComponent(city)}`, label: `Flatmates in ${city}`, icon: Users },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f7f8f6] pb-24 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeaderNav />

      {/* Hero */}
      <section className="relative z-10 border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-10"
          />
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-7 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
          <nav className="flex items-center gap-1 text-xs text-slate-500">
            <Link href="/nearby" className="hover:text-slate-800">
              Locality guide
            </Link>
            {city && (
              <>
                <ChevronRight className="h-3 w-3" />
                {guideCity ? (
                  <Link href={`/nearby/city/${guideCityKey(guideCity)}`} className="hover:text-slate-800">
                    {city}
                  </Link>
                ) : (
                  city
                )}
              </>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900">
                <MapPin className="h-3.5 w-3.5" /> {city || "India"}
              </span>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {name}
                <span className="sr-only">, {city}: nearest metro, hospitals, schools and more</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                Everything you&apos;d live close to — metro, hospitals, schools, colleges, malls and more, with walking and
                driving time.
              </p>
            </div>

            {score && (
              <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:min-w-[300px]">
                <ScoreRing score={score.score} verdict={score.verdict} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Connectivity score</p>
                  <p className="mt-0.5 text-xs text-slate-500">{score.within2} places within 2 km</p>
                  <p className="text-xs text-slate-500">{items.length} places mapped nearby</p>
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-6">
              <HighlightTiles items={items} />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          {items.length ? (
            <>
              <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Explore around {name}</h2>
              <LocalityExplorer items={items} />
              <p className="mt-3 text-[10px] text-slate-400">
                Approximate straight-line distances from the locality centre; travel times are estimates. Map data ©
                OpenStreetMap contributors, Overture Maps.
              </p>
            </>
          ) : (
            <p className="rounded-2xl bg-white p-4 text-sm text-slate-600 dark:bg-slate-900">
              We don&apos;t have landmark data for {name} yet.
            </p>
          )}
          <LocalityFaq name={name} faqs={faqs} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          {homeLinks.length > 0 && (
            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Like it here?</p>
              <h2 className="mt-1 text-xl font-black leading-snug">Find a home in {name}</h2>
              <p className="mt-1 text-sm text-slate-300">Direct from owners · zero brokerage</p>
              <div className="mt-4 space-y-2">
                {homeLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-emerald-300" /> {label}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Compare another locality</h2>
            <NearbyFinder defaultCity={city} stacked />
          </div>
        </aside>
      </div>
    </main>
  );
}
