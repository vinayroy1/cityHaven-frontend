import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  FileCheck2,
  Heart,
  HelpCircle,
  IndianRupee,
  Layers,
  MapPin,
  PhoneCall,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buildCanonical, SITE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { getAllProjects, getProjectBySlug } from "@/data/projectsData";
import { ProjectDetailInteractive } from "./ProjectDetailInteractive";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found - Awasio",
      description: "The requested residential project could not be found.",
    };
  }

  const title = `${project.name} by ${project.developerName} in ${project.locality}, ${project.city} - Price & Floor Plans`;
  const description = `Explore ${project.name} in ${project.locality}, ${project.city}. RERA Reg: ${project.reraId}. Configurations, price from ${formatPrice(project.priceMin)}, floor plans & possession date.`;
  const canonical = buildCanonical(`/new-projects/${project.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: project.images.map((img) => ({ url: img })),
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: `Residential project by ${project.developerName} in ${project.locality}, ${project.city}. RERA ID: ${project.reraId}`,
    url: `${SITE_URL}/new-projects/${project.slug}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: project.priceMin,
      highPrice: project.priceMax,
    },
    geo: project.latitude && project.longitude ? {
      "@type": "GeoCoordinates",
      latitude: project.latitude,
      longitude: project.longitude,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeaderNav />

      <main className="flex-1 pb-20">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb Bar */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/new-projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to all projects</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <Link href="/new-projects" className="hover:underline">New Projects</Link>
              <span>/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{project.city}</span>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white">{project.name}</span>
            </div>
          </div>

          {/* Interactive Project Client View */}
          <ProjectDetailInteractive project={project} />
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
