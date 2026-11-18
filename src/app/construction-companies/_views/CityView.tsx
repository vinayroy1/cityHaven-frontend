import type { Metadata } from "next";
import { HardHat } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { DirectoryClient } from "@/components/construction/public/DirectoryClient";
import { constructionProfilePath } from "@/features/construction/options";
import { cityFromSlug, fetchConstructionCities, fetchConstructionDirectory } from "../lib/server-data";
import { ListYourCompany } from "../ListYourCompany";
import { listingPath, titleFromSlug } from "@/lib/seo/countryPath";

/** A city or locality page: /construction-companies[/cc]/city[/locality]. */
export type ConstructionPlace = { country: string | null; city: string; locality: string | null };

export async function loadPlace(country: string | null, citySlugValue: string, localitySlug: string | null): Promise<ConstructionPlace> {
  const city = await cityFromSlug(citySlugValue);
  return { country, city, locality: localitySlug ? titleFromSlug(localitySlug) : null };
}

export async function placeMetadata({ country, city, locality }: ConstructionPlace): Promise<Metadata> {
  const dir = await fetchConstructionDirectory(city, locality);
  const total = dir.data?.pagination.total ?? 0;
  const where = [locality, city].filter(Boolean).join(", ");
  const title = `House Construction Companies in ${where} – Rates & Quotes | Awasio`;
  const description = `${total ? `${total} ` : ""}house construction companies and contractors in ${where}. Compare construction cost per sq.ft, completed homes and warranties, and get free quotes.`;
  const url = buildCanonical(listingPath("/construction-companies", city, locality, country));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Thin pages (no companies yet) stay out of the index until they have listings.
    robots: total ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

/** Results for the place, plus where it really lives when the URL's country is wrong (or missing). */
export async function loadPlaceResults(place: ConstructionPlace) {
  const dir = await fetchConstructionDirectory(place.city, place.locality);
  if (!dir.ok) throw new Error("construction API unavailable");
  const items = dir.data?.items ?? [];
  const actual = items[0]?.countryCode ?? null;
  const canonical = listingPath("/construction-companies", place.city, place.locality, actual ?? place.country);
  return { dir, items, canonical };
}

export async function ConstructionCityView({ place, dir }: { place: ConstructionPlace; dir: Awaited<ReturnType<typeof fetchConstructionDirectory>> }) {
  const { city, locality, country } = place;
  const where = [locality, city].filter(Boolean).join(", ");
  const cities = await fetchConstructionCities();
  const items = dir.data?.items ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `House construction companies in ${where}`,
    itemListElement: items.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: buildCanonical(constructionProfilePath(p)), name: p.businessName })),
  };
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <HeaderNav />
      <main className="flex-1">
        <section className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-9">
            <div className="mb-3 hidden sm:block">
              <PageBreadcrumbs
                items={[
                  { label: "Construction companies", href: "/construction-companies" },
                  ...(locality ? [{ label: city, href: listingPath("/construction-companies", city, null, country) }, { label: locality }] : [{ label: city }]),
                ]}
                renderJsonLd={true}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <HardHat className="h-4 w-4" /> Build your home in {where}
            </div>
            <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">House construction companies in {where}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Compare construction rates per sq.ft, completed homes and warranties from builders and contractors in {where}.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
          <DirectoryClient city={city} locality={locality ?? ""} country={country} initialItems={items} initialTotal={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />
          <ListYourCompany />
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
