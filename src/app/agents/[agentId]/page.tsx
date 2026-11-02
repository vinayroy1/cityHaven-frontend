import React, { cache } from "react";
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
import type { Agent } from "@/data/agents";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { AgentProfileClient } from "./AgentProfileClient";

// Static demo agents first; otherwise resolve a published backend advisor by slug or id.
const resolveAgent = cache(async (agentId: string): Promise<Agent | null> => {
  const local = getAgentById(agentId);
  if (local) return local;
  try {
    const res = await fetch(API_ENDPOINTS.advisors.detail(encodeURIComponent(agentId)), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Partial<Agent> & Record<string, unknown> };
    const raw = json?.data;
    if (!raw) return null;
    const str = (v: unknown, fallback = "") => (typeof v === "string" && v ? v : fallback);
    return {
      ...(raw as Agent),
      id: String(raw.id),
      name: str(raw.name, "Advisor"),
      role: str(raw.role, "Real Estate Advisor"),
      agency: str(raw.agency, "Independent Advisor"),
      reraId: str(raw.reraId),
      city: str(raw.city),
      area: str(raw.area),
      focus: str(raw.focus),
      avatar: str(raw.avatar),
      phone: str(raw.phone),
      email: str(raw.email),
      experience: str(raw.experience),
      services: Array.isArray(raw.services) ? raw.services : [],
      languages: Array.isArray(raw.languages) ? raw.languages : [],
      tours: str(raw.tours, "0"),
      rating: String(raw.rating ?? "5.0"),
      bio: str(raw.bio),
      responseTime: str(raw.responseTime, str(raw.responseTimeText, "Within a few hours")),
      featuredListings: Array.isArray(raw.featuredListings) ? raw.featuredListings : [],
      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    } as Agent;
  } catch {
    return null;
  }
});

interface PageProps {
  params: Promise<{ agentId: string }>;
}

export async function generateStaticParams() {
  return getAllAgentIds().map((agentId) => ({ agentId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { agentId } = await params;
  const agent = await resolveAgent(agentId);

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
  const agent = await resolveAgent(agentId);

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
