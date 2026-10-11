import React from "react";
import type { Metadata } from "next";
import { buildCanonical, SITE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { NewProjectsClient } from "./components/NewProjectsClient";
import { getAllProjects } from "@/data/projectsData";

export const metadata: Metadata = {
  title: "New Projects & Township Developments - Awasio",
  description:
    "Explore RERA-verified new residential projects, luxury high-rises, and gated communities across Noida, Gurugram, Mumbai, and Bengaluru directly from developers.",
  alternates: { canonical: buildCanonical("/new-projects") },
  openGraph: {
    title: "New Projects & Township Developments - Awasio",
    description:
      "Explore RERA-verified new residential projects, luxury high-rises, and gated communities across top Indian metros.",
    url: buildCanonical("/new-projects"),
    type: "website",
    siteName: "Awasio",
  },
};

export default function NewProjectsPage() {
  const initialProjects = getAllProjects();

  // Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "RERA Approved New Residential Projects in India",
    description: "Browse verified residential real estate projects with floor plans, pricing, and possession timelines.",
    itemListElement: initialProjects.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateListing",
        name: p.name,
        description: `${p.name} by ${p.developerName} in ${p.locality}, ${p.city}. RERA: ${p.reraId}`,
        url: `${SITE_URL}/new-projects/${p.slug}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeaderNav />

      <main className="flex-1">
        <NewProjectsClient initialProjects={initialProjects} />
      </main>

      <FooterLinks />
    </div>
  );
}
