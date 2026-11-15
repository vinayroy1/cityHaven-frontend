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

export const revalidate = 120;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await cityFromSlug(slug);
  const dir = await fetchConstructionDirectory(city);
  const total = dir.data?.pagination.total ?? 0;
  const title = `House Construction Companies in ${city} – Rates & Quotes | Awasio`;
  const description = `${total ? `${total} ` : ""}house construction companies and contractors in ${city}. Compare construction cost per sq.ft, completed homes and warranties, and get free quotes.`;
  const url = buildCanonical(`/construction-companies/${slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Thin pages (no companies yet) stay out of the index until they have listings.
    robots: total ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

export default async function ConstructionCityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = await cityFromSlug(slug);
  const [dir, cities] = await Promise.all([fetchConstructionDirectory(city), fetchConstructionCities()]);
  if (!dir.ok) throw new Error("construction API unavailable");
  const items = dir.data?.items ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `House construction companies in ${city}`,
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
              <PageBreadcrumbs items={[{ label: "Construction companies", href: "/construction-companies" }, { label: city }]} renderJsonLd={true} />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <HardHat className="h-4 w-4" /> Build your home in {city}
            </div>
            <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">House construction companies in {city}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Compare construction rates per sq.ft, completed homes and warranties from builders and contractors in {city}.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
          <DirectoryClient city={city} initialItems={items} initialTotal={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />
          <ListYourCompany />
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
