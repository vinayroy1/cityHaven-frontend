import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "./components/HeaderNav";
import { HeroSearch } from "./components/HeroSearch";
import { QuickActions } from "./components/QuickActions";
import { ListingSection } from "./components/ListingSection";
import { AppPromo } from "./components/AppPromo";
import { InspirationGrid } from "./components/InspirationGrid";
import { FooterLinks } from "./components/FooterLinks";
import { popularListings, weekendGetaways, cityCollections, inspirationLinks } from "./data";
import { seoDefaults, buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: seoDefaults.title,
  description: seoDefaults.description,
  alternates: { canonical: buildCanonical("/homePage") },
  openGraph: {
    title: seoDefaults.title,
    description: seoDefaults.description,
    url: buildCanonical("/homePage"),
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <HeaderNav />
      <HeroSearch enableFiltersButton />
      <QuickActions />
      <ListingSection title="Popular homes in Gurgaon District" listings={popularListings} cta="View all" />
      <ListingSection title="Available this weekend" listings={weekendGetaways} cta="See more" />
      {cityCollections.map((block) => (
        <ListingSection key={block.heading} title={block.heading} listings={block.listings} cta="View more" />
      ))}
      <AppPromo />
      <InspirationGrid groups={inspirationLinks} />
      <FooterLinks />
    </main>
  );
}
