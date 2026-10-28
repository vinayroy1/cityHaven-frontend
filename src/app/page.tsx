import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "./homePage/components/HeaderNav";
import { HomeExperience } from "./homePage/components/HomeExperience";
import { FooterLinks } from "./homePage/components/FooterLinks";
import { SITE_URL, buildCanonical } from "@/constants/seo";
import { CDN_ASSETS } from "@/config/cdn";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";

async function getInitialFreshListings(): Promise<PropertySearchItem[]> {
  try {
    const endpoint = toInternalApiUrl(
      `${API_ENDPOINTS.propertyListing.search}?listingType=SELL&pageSize=8&sort=newest`
    );
    const res = await fetch(endpoint, {
      next: { revalidate: 300 }, // 5 min ISR cache
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: PropertySearchItem[] } };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Awasio - Find Verified Homes, Apartments & Local Property Advisors",
  description:
    "Explore verified properties for sale & rent across Delhi, Gurugram, Noida, Mumbai, Bengaluru, and Pune. Connect with RERA-certified advisors for private walkthroughs.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Awasio - Verified Properties & Certified Local Advisors",
    description:
      "Find luxury builder floors, gated apartments, villas, and book private site visits directly with certified RERA real estate advisors.",
    url: SITE_URL,
    type: "website",
    siteName: "Awasio",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Awasio - Verified Real Estate" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awasio - Verified Real Estate & Certified Local Advisors",
    description:
      "Search verified properties and book private walkthroughs with certified RERA advisors.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default async function RootPage() {
  const initialFreshListings = await getInitialFreshListings();
  const firstCard = initialFreshListings[0];
  const lcpImage = firstCard ? toResultCardProps(firstCard).images?.[0] : null;

  // Schema.org Structured Data: WebSite with Sitelinks SearchBox & RealEstateOrganization
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Awasio",
        alternateName: [
          "Awasio Real Estate",
          "awasio.com",
          "Awasio India",
          "Awasio Properties",
        ],
        description: "Verified Real Estate Marketplace & Certified Local Advisors in India",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/buy?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
        inLanguage: "en-IN",
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${SITE_URL}/#organization`,
        name: "Awasio",
        legalName: "Awasio Real Estate",
        alternateName: ["Awasio Real Estate", "awasio.com", "Awasio Properties"],
        url: SITE_URL,
        logo: CDN_ASSETS.logoPrimarySvg,
        image: `${SITE_URL}/og-image.png`,
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
      {lcpImage && (
        <link
          rel="preload"
          as="image"
          href={lcpImage}
          fetchPriority="high"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="min-h-screen overflow-x-clip bg-white text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
        <HeaderNav />
        <HomeExperience initialFreshListings={initialFreshListings} />
        <FooterLinks />
      </div>
    </>
  );
}
