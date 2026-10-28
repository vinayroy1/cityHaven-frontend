import React from "react";
import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { NewProjectsClient } from "./components/NewProjectsClient";

export const revalidate = 60;

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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        <NewProjectsClient />
      </main>

      <FooterLinks />
    </div>
  );
}
