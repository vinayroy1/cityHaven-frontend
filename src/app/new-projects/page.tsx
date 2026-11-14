import React from "react";
import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { NewProjectsClient } from "./components/NewProjectsClient";
import { sizedImageUrl } from "@/app/homePage/lib/homeImage";
import { getInitialProjects } from "./lib/initialProjects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "New Projects & Township Developments - Awasio" },
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
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }],
  },
};

export default async function NewProjectsPage() {
  const { items: initialProjects, total: initialTotal } = await getInitialProjects();
  const firstImage = initialProjects[0]?.images?.[0];
  // Must match the first card's src in NewProjectsClient (same resized rendition).
  const lcpImage = firstImage ? sizedImageUrl(firstImage, 640) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {lcpImage && <link rel="preload" as="image" href={lcpImage} fetchPriority="high" />}
      <HeaderNav />

      <main className="flex-1">
        <NewProjectsClient initialProjects={initialProjects} initialTotal={initialTotal} />
      </main>

      <FooterLinks />
    </div>
  );
}
