import type { Metadata } from "next";
import { PencilRuler } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { DirectoryClient } from "@/components/architect/public/DirectoryClient";
import { architectProfilePath } from "@/features/architect/options";
import { fetchArchitectCities, fetchArchitectDirectory } from "./lib/server-data";
import { ListYourCompany } from "./ListYourCompany";

export const revalidate = 120;

const TITLE = "Architects & House Naksha Designers near you | Awasio";
const DESCRIPTION =
  "Find COA-verified architects, civil engineers and house naksha designers. Compare naksha prices, 3D elevations and plans by plot size and facing. Free quotes.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: buildCanonical("/architects") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: buildCanonical("/architects"), type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
};

export default async function ArchitectDirectoryPage() {
  const [dir, cities] = await Promise.all([fetchArchitectDirectory("", null, "IN"), fetchArchitectCities()]);
  if (!dir.ok) throw new Error("architect API unavailable");
  const items = dir.data?.items ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Architects and house naksha designers",
    itemListElement: items.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: buildCanonical(architectProfilePath(p)), name: p.businessName })),
  };
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(244,63,94,0.10),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-10">
            <div className="mb-3 hidden sm:block">
              <PageBreadcrumbs items={[{ label: "Architects & naksha" }]} renderJsonLd={true} />
            </div>
            <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 sm:flex">
              <PencilRuler className="h-4 w-4" /> Plan your home
            </div>
            <h1 className="text-lg font-extrabold leading-snug tracking-tight sm:mt-1 sm:font-black text-slate-950 sm:text-4xl dark:text-white">
              Architects <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">& house naksha designers</span>
            </h1>
            <p className="mt-2 hidden max-w-2xl text-slate-600 sm:block sm:text-base dark:text-slate-300">
              Get a naksha, 3D elevation, structural drawings or map approval. Compare prices and designs by plot size and facing, then get free quotes.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-3 sm:px-6 sm:py-10">
          <DirectoryClient city="" locality="" country={null} initialItems={items} initialTotal={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />
          <ListYourCompany />
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
