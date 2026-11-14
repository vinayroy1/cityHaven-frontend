import React from "react";
import type { Metadata } from "next";
import { HeaderNav } from "./homePage/components/HeaderNav";
import { HomeExperience } from "./homePage/components/HomeExperience";
import { FooterLinks } from "./homePage/components/FooterLinks";
import { SITE_URL, buildCanonical, SOCIAL_LINKS, SOCIAL_SAME_AS, OG_IMAGE_URL } from "@/constants/seo";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import type { ProjectListing } from "@/types/project.types";
import { sizedImageUrl } from "./homePage/lib/homeImage";
import { ALL_AGENTS } from "@/data/agents";

// Computed on the server: the full agents dataset (~700 KB) never reaches the browser.
const FEATURED_AGENTS = ALL_AGENTS.filter((a) => a.isHomepageFeatured);
import { getNearbySpotlightByCountry } from "./homePage/lib/nearbySpotlight";

const SEED_FALLBACK_LISTINGS: PropertySearchItem[] = [
  {
    id: 1136,
    title: "Villa Plot For Sale in Oragodam, varanasi",
    slug: "plot-land-res-for-sale-in-oragadam-varanasi-bc2052",
    price: 1500000,
    listingType: "SELL",
    cityName: "Varanasi",
    locality: "Oragodam",
    thumbnailUrl: "/r2-cdn/properties/photos/pan_india/prop_varanasi_plot_land_1859612846/photo_1.webp",
    media: [
      {
        id: 1,
        url: "/r2-cdn/properties/photos/pan_india/prop_varanasi_plot_land_1859612846/photo_1.webp",
        type: "IMAGE",
      },
    ],
    propertySubType: { id: 1, name: "Plot / Land", slug: "plot-land" },
    qcStatus: "APPROVED",
  } as PropertySearchItem,
];

let cachedFreshListings: PropertySearchItem[] | null = SEED_FALLBACK_LISTINGS;
let cachedFreshTime = 0;

async function getInitialFreshListings(): Promise<PropertySearchItem[]> {
  const now = Date.now();
  if (cachedFreshListings && cachedFreshListings !== SEED_FALLBACK_LISTINGS && now - cachedFreshTime < 60_000) {
    return cachedFreshListings;
  }
  try {
    const endpoint = toInternalApiUrl(
      `${API_ENDPOINTS.propertyListing.search}?listingType=SELL&pageSize=8&sort=newest&countryCode=IN`
    );
    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!res.ok) return cachedFreshListings ?? [];
    const json = (await res.json()) as { data?: { items?: PropertySearchItem[] } };
    const items = json?.data?.items ?? [];
    if (items.length > 0) {
      cachedFreshListings = items;
      cachedFreshTime = now;
    }
    return items.length > 0 ? items : (cachedFreshListings ?? []);
  } catch {
    return cachedFreshListings ?? [];
  }
}

// Mirrors normalizeProject in features/projects/api (a "use client" module, not callable here).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProject(raw: any): ProjectListing {
  const cityName =
    raw?.cityName || (typeof raw?.city === "object" && raw?.city ? raw.city.name : raw?.city) || "";
  return {
    ...raw,
    city: cityName,
    cityName,
    configurations: Array.isArray(raw?.configurations) ? raw.configurations : [],
    amenities: Array.isArray(raw?.amenities) ? raw.amenities : [],
    highlights: Array.isArray(raw?.highlights) ? raw.highlights : [],
    images: Array.isArray(raw?.images) ? raw.images : [],
    priceMin: Number(raw?.priceMin) || 0,
    priceMax: Number(raw?.priceMax) || 0,
  };
}

let cachedProjects: ProjectListing[] = [];
let cachedProjectsTime = 0;

/** Default (Mumbai) projects for the above-the-fold carousel, fetched on the server so the LCP card is in the HTML. */
async function getInitialProjects(): Promise<ProjectListing[]> {
  const now = Date.now();
  if (cachedProjects.length > 0 && now - cachedProjectsTime < 60_000) return cachedProjects;
  try {
    const endpoint = toInternalApiUrl(`${API_ENDPOINTS.projects.search}?city=Mumbai&pageSize=6`);
    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!res.ok) return cachedProjects;
    const json = (await res.json()) as { data?: { items?: unknown[] } };
    const items = (json?.data?.items ?? []).map(normalizeProject);
    if (items.length > 0) {
      cachedProjects = items;
      cachedProjectsTime = now;
    }
    return items.length > 0 ? items : cachedProjects;
  } catch {
    return cachedProjects;
  }
}

const normalizeR2Url = (url?: string | null) =>
  (url ?? "").replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");

// Must match MUMBAI_FALLBACK_PROJECTS[0] in HomeExperience when the API returns nothing.
const FALLBACK_LCP_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=640&auto=format&fit=crop&q=70";

export const revalidate = 60;

const HOME_TITLE = "Awasio: Buy, Rent & Sell Property, PGs, Flatmates & New Projects";
const HOME_DESCRIPTION =
  "Awasio is a property platform to buy, rent or sell homes, flats, plots, PGs and commercial spaces, find flatmates, explore new projects and check what's nearby. Post your property free.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: "website",
    siteName: "Awasio",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio: property for sale and rent" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    site: `@${SOCIAL_LINKS.x.handle}`,
    creator: `@${SOCIAL_LINKS.x.handle}`,
    images: [OG_IMAGE_URL],
  },
};

export default async function RootPage() {
  const [initialFreshListings, initialProjects, nearbySpotlight] = await Promise.all([
    getInitialFreshListings(),
    getInitialProjects(),
    getNearbySpotlightByCountry().catch(() => ({})),
  ]);
  // LCP candidates: preload both the first Featured Project and first Fresh Listing image so the browser downloads the visible hero immediately
  const firstProjectImage = initialProjects.length
    ? normalizeR2Url((initialProjects[0].images ?? []).find(Boolean))
    : FALLBACK_LCP_IMAGE;
  const projectLcpImage = firstProjectImage ? sizedImageUrl(firstProjectImage, 640) : null;

  const firstListingMedia = initialFreshListings[0]?.media?.[0]?.url || initialFreshListings[0]?.thumbnailUrl;
  const listingLcpImage = firstListingMedia ? sizedImageUrl(normalizeR2Url(firstListingMedia), 640) : null;

  // Schema.org structured data: WebSite (site name + search) and Organization
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Awasio",
        alternateName: ["awasio.com", "Awasio Properties"],
        description: HOME_DESCRIPTION,
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
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Awasio",
        alternateName: ["awasio.com", "Awasio Properties"],
        url: `${SITE_URL}/`,
        sameAs: SOCIAL_SAME_AS,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
        image: OG_IMAGE_URL,
        description:
          "Property platform for buying, renting and selling homes, plots, PGs and commercial spaces, with flatmate search, new projects and locality guides.",
        areaServed: [
          { "@type": "Country", name: "India" },
          { "@type": "Country", name: "Nepal" },
          { "@type": "Country", name: "Bangladesh" },
          { "@type": "Country", name: "Sri Lanka" },
        ],
      },
    ],
  };

  return (
    <>
      {projectLcpImage && (
        <link
          rel="preload"
          as="image"
          href={projectLcpImage}
          fetchPriority="high"
        />
      )}
      {listingLcpImage && (
        <link
          rel="preload"
          as="image"
          href={listingLcpImage}
          fetchPriority="high"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="min-h-screen overflow-x-clip bg-white text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
        <HeaderNav />
        <HomeExperience initialFreshListings={initialFreshListings} initialProjects={initialProjects} nearbySpotlight={nearbySpotlight} featuredAgents={FEATURED_AGENTS} />
        <FooterLinks />
      </div>
    </>
  );
}
