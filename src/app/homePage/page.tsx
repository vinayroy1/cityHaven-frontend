import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "./components/HeaderNav";
import { HomeExperience } from "./components/HomeExperience";
import { FooterLinks } from "./components/FooterLinks";
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
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <HomeExperience />
      <FooterLinks />
    </div>
  );
}
