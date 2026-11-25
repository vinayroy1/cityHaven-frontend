import type { Metadata } from "next";
import { PencilRuler } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { DirectoryClient } from "@/components/architect/public/DirectoryClient";
import { architectProfilePath } from "@/features/architect/options";
import { cityFromSlug, fetchArchitectCities, fetchArchitectDirectory } from "../lib/server-data";
import { ListYourCompany } from "../ListYourCompany";
import { listingPath, titleFromSlug } from "@/lib/seo/countryPath";

/** A city or locality page: /architects[/cc]/city[/locality]. */
export type ArchitectPlace = { country: string | null; city: string; locality: string | null };

export async function loadPlace(country: string | null, citySlugValue: string, localitySlug: string | null): Promise<ArchitectPlace> {
  const city = await cityFromSlug(citySlugValue);
  return { country, city, locality: localitySlug ? titleFromSlug(localitySlug) : null };
}

export async function placeMetadata({ country, city, locality }: ArchitectPlace): Promise<Metadata> {
  const dir = await fetchArchitectDirectory(city, locality);
  const total = dir.data?.pagination.total ?? 0;
  const where = [locality, city].filter(Boolean).join(", ");
  const title = `Architects & House Naksha Designers in ${where} – Prices & Quotes | Awasio`;
  const description = `${total ? `${total} ` : ""}architects, civil engineers and naksha designers for ${where}. Compare naksha prices, 3D elevations and plans by plot size and facing. Free quotes.`;
  const url = buildCanonical(listingPath("/architects", city, locality, country));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Thin pages (no listings yet) stay out of the index until they have listings.
    robots: total ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

/** Results for the place, plus where it really lives when the URL's country is wrong (or missing). */
export async function loadPlaceResults(place: ArchitectPlace) {
  const dir = await fetchArchitectDirectory(place.city, place.locality);
  if (!dir.ok) throw new Error("architect API unavailable");
  const items = dir.data?.items ?? [];
  const actual = items[0]?.countryCode ?? null;
  const canonical = listingPath("/architects", place.city, place.locality, actual ?? place.country);
  return { dir, items, canonical };
}

export async function ArchitectCityView({ place, dir }: { place: ArchitectPlace; dir: Awaited<ReturnType<typeof fetchArchitectDirectory>> }) {
  const { city, locality, country } = place;
  const where = [locality, city].filter(Boolean).join(", ");
  const cities = await fetchArchitectCities();
  const items = dir.data?.items ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Architects and naksha designers in ${where}`,
    itemListElement: items.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: buildCanonical(architectProfilePath(p)), name: p.businessName })),
  };
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <HeaderNav />
      <main className="flex-1">
        <section className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-9">
            <div className="mb-3 hidden sm:block">
              <PageBreadcrumbs
                items={[
                  { label: "Architects & naksha", href: "/architects" },
                  ...(locality ? [{ label: city, href: listingPath("/architects", city, null, country) }, { label: locality }] : [{ label: city }]),
                ]}
                renderJsonLd={true}
              />
            </div>
            <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 sm:flex">
              <PencilRuler className="h-4 w-4" /> Plan your home in {where}
            </div>
            <h1 className="text-lg font-extrabold leading-snug tracking-tight sm:mt-1 sm:font-black text-slate-950 sm:text-4xl dark:text-white">Architects & naksha designers in {where}</h1>
            <p className="mt-2 hidden max-w-2xl text-slate-600 sm:block sm:text-base dark:text-slate-300">
              Naksha, 3D elevation, structural drawings and map approval for plots in {where}. Compare prices and get free quotes.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-3 sm:px-6 sm:py-10">
          <DirectoryClient city={city} locality={locality ?? ""} country={country} initialItems={items} initialTotal={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />
          <ListYourCompany />
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
