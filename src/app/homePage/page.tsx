import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "./components/HeaderNav";
import { HomeExperience } from "./components/HomeExperience";
import { FooterLinks } from "./components/FooterLinks";
import { seoDefaults, buildCanonical, OG_IMAGE_URL } from "@/constants/seo";

export const metadata: Metadata = {
  title: seoDefaults.title,
  description: seoDefaults.description,
  alternates: { canonical: buildCanonical("/") },
  openGraph: {
    title: seoDefaults.title,
    description: seoDefaults.description,
    url: buildCanonical("/"),
    type: "website",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <HomeExperience />
      <FooterLinks />
    </div>
  );
}
