import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "./homePage/components/HeaderNav";
import { HomeExperience } from "./homePage/components/HomeExperience";
import { FooterLinks } from "./homePage/components/FooterLinks";
import { SITE_URL, buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Awasio - Find Verified Homes, Apartments & Local Property Advisors",
  description:
    "Explore verified properties for sale & rent across Delhi, Gurugram, Noida, Mumbai, Bengaluru, and Pune. Connect with RERA-certified advisors for private walkthroughs.",
  alternates: { canonical: buildCanonical("/") },
  openGraph: {
    title: "Awasio - Verified Properties & Certified Local Advisors",
    description:
      "Find luxury builder floors, gated apartments, villas, and book private site visits directly with certified RERA real estate advisors.",
    url: buildCanonical("/"),
    type: "website",
  },
};

export default function RootPage() {
  // Schema.org Structured Data: WebSite with Sitelinks SearchBox & RealEstateOrganization
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Awasio",
        description: "Verified Real Estate Marketplace & Certified Local Advisors in India",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/propertySearch?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
        inLanguage: "en-IN",
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${SITE_URL}/#organization`,
        name: "Awasio Real Estate",
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logo/awasio-logo-primary.svg`,
        description:
          "India's transparent real estate marketplace connecting buyers and tenants with verified property listings and RERA-certified advisors.",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
        areaServed: [
          "Delhi",
          "Gurugram",
          "Noida",
          "Mumbai",
          "Bengaluru",
          "Pune",
          "Hyderabad",
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="min-h-screen overflow-x-clip bg-white text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
        <HeaderNav />
        <HomeExperience />
        <FooterLinks />
      </div>
    </>
  );
}
