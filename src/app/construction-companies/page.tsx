import type { Metadata } from "next";
import { HardHat } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { DirectoryClient } from "@/components/construction/public/DirectoryClient";
import { constructionProfilePath } from "@/features/construction/options";
import { fetchConstructionCities, fetchConstructionDirectory } from "./lib/server-data";
import { ListYourCompany } from "./ListYourCompany";

export const revalidate = 120;

const TITLE = "House Construction Companies & Contractors near you | Awasio";
const DESCRIPTION =
  "Compare verified house construction companies and contractors. See rates per sq.ft, completed homes and warranties, and get free quotes for building your house.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: buildCanonical("/construction-companies") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: buildCanonical("/construction-companies"), type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
};

export default async function ConstructionDirectoryPage() {
  const [dir, cities] = await Promise.all([fetchConstructionDirectory(""), fetchConstructionCities()]);
  if (!dir.ok) throw new Error("construction API unavailable");
  const items = dir.data?.items ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "House construction companies",
    itemListElement: items.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: buildCanonical(constructionProfilePath(p)), name: p.businessName })),
  };
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(251,191,36,0.16),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(244,63,94,0.10),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10">
            <div className="mb-3 hidden sm:block">
              <PageBreadcrumbs items={[{ label: "Construction companies" }]} renderJsonLd={true} />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <HardHat className="h-4 w-4" /> Build your home
            </div>
            <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              House construction companies <span className="bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">& contractors</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Compare rates per sq.ft, completed homes and warranties. Get free quotes from builders who construct on your plot.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
          <DirectoryClient city="" initialItems={items} initialTotal={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />
          <ListYourCompany />
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
