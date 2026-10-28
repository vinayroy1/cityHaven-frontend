import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical, SITE_URL } from "@/constants/seo";
import { fromSearchSlug, toSearchSlug } from "@/components/search/searchQuery";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import type { ProjectListing } from "@/types/project.types";
import { ProjectDetailInteractive } from "../components/ProjectDetailInteractive";
import { NewProjectsClient } from "../components/NewProjectsClient";
import { BackButton } from "@/components/common/BackButton";

export const revalidate = 60;

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

type Props = {
  params: Promise<{ segments: string[] }>;
};

const CITY_ALIASES: Record<string, string> = {
  bangalore: "bengaluru",
  delhi: "new-delhi",
  gurgaon: "gurugram",
  bombay: "mumbai",
  calcutta: "kolkata",
  madras: "chennai",
};

const getProject = cache(async (slug: string): Promise<ProjectListing | null> => {
  try {
    const rawEndpoint = API_ENDPOINTS.projects.detail(encodeURIComponent(slug));
    const endpoint = toInternalApiUrl(rawEndpoint);
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (response.status === 404 || !response.ok) return null;
    const payload = (await response.json()) as { success?: boolean; data?: any };
    const raw = payload?.data;
    if (!raw) return null;
    const cityName = raw.cityName || (typeof raw.city === "object" && raw.city ? raw.city.name : raw.city) || "";
    return {
      ...raw,
      city: cityName,
      cityName,
      configurations: Array.isArray(raw.configurations) ? raw.configurations : [],
      amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
      highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
      images: Array.isArray(raw.images) ? raw.images : [],
      salesPhone: raw.salesPhone || "",
      salesEmail: raw.salesEmail || "",
      possessionDate: raw.possessionDate || "Ready to Move",
      priceMin: Number(raw.priceMin) || 0,
      priceMax: Number(raw.priceMax) || 0,
    };
  } catch (error) {
    console.error(`[getProject] Failed to fetch project ${slug}:`, error);
    return null;
  }
});

const getInitialProjects = cache(async (city?: string, localities: string[] = []): Promise<{ items: ProjectListing[]; total: number }> => {
  try {
    const rawEndpoint = API_ENDPOINTS.projects.search;
    const endpoint = toInternalApiUrl(rawEndpoint);
    const url = new URL(endpoint);
    if (city && city !== "All") url.searchParams.set("city", city);
    if (localities.length) url.searchParams.set("locality", localities.join(","));
    url.searchParams.set("page", "1");
    url.searchParams.set("pageSize", "24");
    url.searchParams.set("sortBy", "featured");
    const response = await fetch(url, { next: { revalidate: 60 }, headers: { Accept: "application/json" } });
    if (!response.ok) return { items: [], total: 0 };
    const payload = await response.json();
    const items = payload?.data?.items ?? payload?.items ?? [];
    const total = Number(payload?.data?.total ?? payload?.total ?? items.length);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
});

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function parseLocation(segments: string[]) {
  if (segments.length === 0 || segments.length > 3) return null;
  const rawCity = segments[0].toLowerCase();
  const normalizedCitySlug = CITY_ALIASES[rawCity] || rawCity;
  const city = fromSearchSlug(normalizedCitySlug);
  const localities = segments.slice(1, 3).map(fromSearchSlug).filter(Boolean);
  return { city, localities, normalizedCitySlug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments = [] } = await params;
  if (!segments.length) return {};

  // Case 1: Single segment could be a project slug OR a city slug
  if (segments.length === 1) {
    const project = await getProject(segments[0]);
    if (project) {
      const cityName = typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "");
      const locLabel = [project.locality, cityName].filter(Boolean).join(", ") || "India";
      const devLabel = project.developerName || "Premier Developer";
      const title = `${project.name} by ${devLabel} in ${locLabel} - Price & Floor Plans`;
      const description = `Explore ${project.name} in ${locLabel}. RERA Reg: ${project.reraId || "Verified"}. Configurations, price from ${formatPrice(project.priceMin)}, floor plans & possession date.`;
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
          images: (project.images || []).map((img) => ({ url: normalizeR2Url(img) })),
        },
      };
    }

    // It's a city landing page or project category (e.g. /new-projects/bengaluru)
    const location = parseLocation(segments);
    const cityName = location?.city || fromSearchSlug(segments[0]);
    const { total: count } = location ? await getInitialProjects(location.city) : { total: 0 };
    const countLabel = count > 0 ? `${count} ` : "";
    const title = `${countLabel}New Residential Projects in ${cityName} | Awasio`;
    const description = `Explore ${countLabel || "verified "}new residential projects, luxury apartments, and township developments in ${cityName} with RERA verification, floor plans, and developer pricing.`;
    const canonical = buildCanonical(`/new-projects/${toSearchSlug(cityName)}`);

    return {
      title,
      description,
      alternates: { canonical },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: { title, description, url: canonical, type: "website" },
    };
  }

  // Case 2: Locality landing page (e.g. /new-projects/bengaluru/whitefield)
  const location = parseLocation(segments);
  if (!location) return {};
  const label = [...location.localities, location.city].join(", ");
  const { total: count } = await getInitialProjects(location.city, location.localities);
  const countLabel = count > 0 ? `${count} ` : "";
  const title = `${countLabel}New Projects in ${label} | Price & Floor Plans | Awasio`;
  const description = `Browse ${countLabel || "verified "}new residential projects, high-rises and gated societies in ${label}. Compare RERA IDs, amenities, price per sqft and developer reputation.`;
  const canonical = buildCanonical(`/new-projects/${segments.join("/")}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: count > 0,
      follow: true,
    },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function NewProjectsDynamicPage({ params }: Props) {
  const { segments = [] } = await params;
  if (!segments.length || segments.length > 3) {
    notFound();
  }

  // If 1 segment: Check if it's an existing project first
  if (segments.length === 1) {
    const project = await getProject(segments[0]);
    if (project) {
      const cityName = typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "");
      const lcpImage = project.images?.[0] ? normalizeR2Url(project.images[0]) : null;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: project.name,
        description: `Residential project by ${project.developerName} in ${project.locality}, ${cityName}. RERA ID: ${project.reraId || "Verified"}`,
        url: `${SITE_URL}/new-projects/${project.slug}`,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: project.priceMin,
          highPrice: project.priceMax,
        },
        geo:
          project.latitude && project.longitude
            ? {
                "@type": "GeoCoordinates",
                latitude: project.latitude,
                longitude: project.longitude,
              }
            : undefined,
      };

      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
          {lcpImage && (
            <link
              rel="preload"
              as="image"
              href={lcpImage}
              fetchPriority="high"
            />
          )}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <HeaderNav />

          <main className="flex-1 pb-20">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {/* Breadcrumb Bar */}
              <div className="mb-4 flex items-center justify-between">
                <BackButton fallbackHref="/new-projects" label="Back to all projects" variant="pill" size="sm" />

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                  <span>/</span>
                  <Link href="/new-projects" className="hover:underline">
                    New Projects
                  </Link>
                  {cityName && (
                    <>
                      <span>/</span>
                      <Link href={`/new-projects/${toSearchSlug(cityName)}`} className="hover:underline">
                        {cityName}
                      </Link>
                    </>
                  )}
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
  }

  // Otherwise, it is a city or locality landing page (or general project directory fallback)
  const location = parseLocation(segments);
  const city = location?.city || fromSearchSlug(segments[0]);
  const localities = location?.localities || [];

  // Redirect alias or non-canonical casing/slug if canonical location is recognized
  if (location) {
    const canonicalSegments = [toSearchSlug(location.city), ...location.localities.map(toSearchSlug)];
    if (canonicalSegments.some((value, index) => value !== segments[index])) {
      permanentRedirect(`/new-projects/${canonicalSegments.join("/")}`);
    }
  }

  const { items: initialProjects, total: initialTotal } = await getInitialProjects(city, localities);
  const firstProject = initialProjects[0];
  const lcpImage = firstProject?.images?.[0] ? normalizeR2Url(firstProject.images[0]) : null;

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "New Projects",
        item: `${SITE_URL}/new-projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city,
        item: `${SITE_URL}/new-projects/${toSearchSlug(city)}`,
      },
      ...(localities[0]
        ? [
            {
              "@type": "ListItem",
              position: 4,
              name: localities[0],
              item: `${SITE_URL}/new-projects/${toSearchSlug(city)}/${toSearchSlug(localities[0])}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {lcpImage && (
        <link
          rel="preload"
          as="image"
          href={lcpImage}
          fetchPriority="high"
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <HeaderNav />
      <main className="flex-1">
        <NewProjectsClient
          initialCity={city}
          initialLocalities={localities}
          initialProjects={initialProjects}
          initialTotal={initialTotal}
        />
      </main>
      <FooterLinks />
    </div>
  );
}
