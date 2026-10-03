import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import {
  ALL_AGENTS,
  getAgentById,
  getAllAgentIds,
  getSimilarAgents,
} from "@/data/agents";
import { AgentProfileClient } from "./AgentProfileClient";

interface PageProps {
  params: Promise<{ agentId: string }>;
}

export async function generateStaticParams() {
  return getAllAgentIds().map((agentId) => ({ agentId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { agentId } = await params;
  const agent = getAgentById(agentId);

  if (!agent) {
    return {
      title: "Real Estate Advisor Not Found | Awasio",
      description: "The requested verified real estate advisor profile could not be found.",
    };
  }

  const title = `${agent.name} - Verified Real Estate Advisor in ${agent.city} | Awasio`;
  const description = `${agent.name} (${agent.agency}) is an Awasio and RERA verified property specialist in ${agent.area}, ${agent.city}. Over ${agent.experience} experience with ${agent.tours} completed walkthroughs. Specializing in ${agent.focus}.`;

  return {
    title,
    description,
    keywords: [
      agent.name,
      `${agent.city} real estate agent`,
      `property advisor ${agent.area}`,
      `${agent.city} property walkthrough`,
      `RERA agent ${agent.reraId}`,
      agent.agency,
      "Awasio verified agent",
    ],
    openGraph: {
      title,
      description,
      url: `https://awasio.com/agents/${agent.id}`,
      siteName: "Awasio",
      images: [
        {
          url: agent.avatar,
          width: 600,
          height: 600,
          alt: `${agent.name} - Real Estate Advisor`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [agent.avatar],
    },
    alternates: {
      canonical: `https://awasio.com/agents/${agent.id}`,
    },
  };
}

export default async function AgentPage({ params }: PageProps) {
  const { agentId } = await params;
  const agent = getAgentById(agentId);

  if (!agent) {
    notFound();
  }

  const similarAgents = getSimilarAgents(agent.id, agent.city, 3);

  // Schema.org RealEstateAgent JSON-LD for Google Rich Results
  const realEstateAgentSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    jobTitle: agent.role,
    image: agent.avatar,
    telephone: agent.phone,
    email: agent.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: agent.area,
      addressRegion: agent.city,
      addressCountry: "IN",
    },
    priceRange: "₹₹₹₹",
    knowsAbout: agent.services,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Government Real Estate License",
      recognizedBy: {
        "@type": "Organization",
        name: "Real Estate Regulatory Authority (RERA)",
      },
      validIn: {
        "@type": "AdministrativeArea",
        name: agent.city,
      },
    },
    worksFor: {
      "@type": "RealEstateAgent",
      name: agent.agency,
    },
  };

  // Schema.org BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://awasio.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Verified Advisors",
        item: "https://awasio.com/agents",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: agent.city,
        item: `https://awasio.com/agents?city=${encodeURIComponent(agent.city)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: agent.name,
        item: `https://awasio.com/agents/${agent.id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <HeaderNav />

      <AgentProfileClient agent={agent} similarAgents={similarAgents} />

      <FooterLinks />
    </div>
  );
}
