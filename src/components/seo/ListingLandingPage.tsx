// Public, indexable landing page for a listing flow that lives behind /dashboard (login + robots-blocked).
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { LISTING_SEO, type ListingSeoKey } from "@/constants/listingSeo";
import { ListingSeoDetails, ListingSeoHero } from "./ListingSeoContent";

export function ListingLandingPage({ seoKey }: { seoKey: ListingSeoKey }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-rose-50/70 via-white to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
            <PageBreadcrumbs items={[{ label: LISTING_SEO[seoKey].navLabel }]} renderJsonLd />
            <ListingSeoHero seoKey={seoKey} cta />
          </div>
        </div>
        <ListingSeoDetails seoKey={seoKey} />
      </main>
      <FooterLinks />
    </div>
  );
}
