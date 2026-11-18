import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { getSimilarAgents } from "@/data/agents";
import type { Agent } from "@/data/agents";
import { agentPath, agentsListPath } from "@/features/advisors/paths";
import { AgentProfileClient } from "./AgentProfileClient";

export function profileMetadata(agent: Agent): Metadata {

  const title = `${agent.name} - Verified Real Estate Advisor in ${agent.city} | Awasio`;
  const description = `${agent.name} (${agent.agency}) is an Awasio and RERA verified property specialist in ${agent.area}, ${agent.city}. Over ${agent.experience} experience with ${agent.tours} completed walkthroughs. Specializing in ${agent.focus}.`;

  return {
    title: { absolute: title },
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
      url: `https://awasio.com${agentPath(agent)}`,
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
      canonical: `https://awasio.com${agentPath(agent)}`,
    },
  };
}

export function AgentProfileView({ agent }: { agent: Agent }) {

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
      addressCountry: agent.countryCode || "IN",
    },
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
        item: `https://awasio.com${agentsListPath(agent.city, null, agent.countryCode)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: agent.name,
        item: `https://awasio.com${agentPath(agent)}`,
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
