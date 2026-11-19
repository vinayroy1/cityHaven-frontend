import { cdnImageUrl } from "@/config/cdn";
import { sizedImageUrl } from "@/app/homePage/lib/homeImage";
import { formatMoneyShort } from "@/lib/money";
import { getCountry } from "@/config/countries";
import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical, SITE_URL, OG_IMAGE_URL } from "@/constants/seo";
import { fromSearchSlug } from "@/components/search/searchQuery";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import type { ProjectListing } from "@/types/project.types";
import { ProjectDetailInteractive } from "../components/ProjectDetailInteractive";
import { getInitialProjects } from "../lib/initialProjects";
import { projectDetailPath, projectSearchPath, splitCountry } from "../lib/projectUrls";
import { NewProjectsClient } from "../components/NewProjectsClient";
import { BackButton } from "@/components/common/BackButton";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";

export const revalidate = 60;

// Render each page on first request, then serve it from the ISR cache and refresh it in the
// background every `revalidate` seconds. Without this, Next renders the route on every request
// (no-store), so crawler cache misses cost ~1-1.7s each.
export async function generateStaticParams() {
  return [];
}

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return cdnImageUrl(url);
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
    if (response.status === 404) return null;
    // Throw on real failures so a backend blip is not cached as a 404 (see generateStaticParams).
    if (!response.ok) throw new Error(`project API responded ${response.status}`);
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
    throw error;
  }
});

function formatPrice(value?: number, countryCode?: string | null) {
  if (!value) return "Price on request";
  return formatMoneyShort(value, countryCode || "IN");
}

function parseLocation(segments: string[]) {
  if (segments.length === 0 || segments.length > 3) return null;
  const rawCity = segments[0].toLowerCase();
  const normalizedCitySlug = CITY_ALIASES[rawCity] || rawCity;
  const city = fromSearchSlug(normalizedCitySlug);
  const localities = segments.slice(1, 3).map(fromSearchSlug).filter(Boolean);
  return { city, localities, normalizedCitySlug };
}

/**
 * Projects for a city/locality page. Unprefixed URLs are India; if India has none there but another
 * country does (e.g. /new-projects/dubai), `moveTo` is that country's prefixed URL.
 */
async function loadLocation(country: string | null, city: string, localities: string[]) {
  const result = await getInitialProjects(city, localities, country ?? "IN");
  if (country || !result.ok || result.total > 0) return { ...result, moveTo: null as string | null };
  const anywhere = await getInitialProjects(city, localities);
  const other = anywhere.items.find((p) => p.countryCode && p.countryCode !== "IN")?.countryCode;
  return { ...result, moveTo: other ? projectSearchPath(city, localities, other) : null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments: rawSegments = [] } = await params;
  const { country, rest: segments } = splitCountry(rawSegments);
  if (!segments.length) return {};

  // Case 1: Single segment could be a project slug OR a city slug
  if (segments.length === 1) {
    const project = await getProject(segments[0]);
    if (project) {
      const cityName = typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "");
      const locLabel = [project.locality, cityName].filter(Boolean).join(", ") || getCountry(project.countryCode).name;
      const devLabel = project.developerName || "Premier Developer";
      const title = `${project.name} by ${devLabel} in ${locLabel} - Price & Floor Plans`;
      const description = `Explore ${project.name} in ${locLabel}. ${project.reraId ? `RERA Reg: ${project.reraId}. ` : ""}Configurations, price from ${formatPrice(project.priceMin, project.countryCode)}, floor plans & possession date.`;
      const canonical = buildCanonical(projectDetailPath(project));

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
    const { total: count } = location ? await loadLocation(country, location.city, []) : { total: 0 };
    const countLabel = count > 0 ? `${count} ` : "";
    const title = `${countLabel}New Residential Projects in ${cityName} | Awasio`;
    const description = `Explore ${countLabel || "verified "}new residential projects, luxury apartments, and township developments in ${cityName} with RERA verification, floor plans, and developer pricing.`;
    const canonical = buildCanonical(projectSearchPath(cityName, [], country));

    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      // Thin pages (no projects yet) stay out of the index until they have listings.
      robots: {
        index: count > 0,
        follow: true,
      },
      openGraph: { title, description, url: canonical, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
    };
  }

  // Case 2: Locality landing page (e.g. /new-projects/bengaluru/whitefield)
  const location = parseLocation(segments);
  if (!location) return {};
  const label = [...location.localities, location.city].join(", ");
  const { total: count } = await loadLocation(country, location.city, location.localities);
  const countLabel = count > 0 ? `${count} ` : "";
  const title = `${countLabel}New Projects in ${label} | Price & Floor Plans | Awasio`;
  const description = `Browse ${countLabel || "verified "}new residential projects, high-rises and gated societies in ${label}. Compare RERA IDs, amenities, price per sqft and developer reputation.`;
  const canonical = buildCanonical(projectSearchPath(location.city, location.localities, country));

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: {
      index: count > 0,
      follow: true,
    },
    openGraph: { title, description, url: canonical, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

export default async function NewProjectsDynamicPage({ params }: Props) {
  const { segments: rawSegments = [] } = await params;
  const { country, rest: segments } = splitCountry(rawSegments);
  if (!segments.length || segments.length > 3) {
    notFound();
  }

  // If 1 segment: Check if it's an existing project first
  if (segments.length === 1) {
    const project = await getProject(segments[0]);
    if (project) {
      // One URL per project: India unprefixed, other countries under their code.
      const canonicalPath = projectDetailPath(project);
      if (canonicalPath !== `/new-projects/${rawSegments.join("/")}`) permanentRedirect(canonicalPath);
      const cityName = typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "");
      // Must match the hero <img> src in ProjectDetailInteractive (same resized rendition).
      const lcpImage = project.images?.[0] ? sizedImageUrl(normalizeR2Url(project.images[0]), 1080) : null;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: project.name,
        description: `Residential project by ${project.developerName} in ${project.locality}, ${cityName}.${project.reraId ? ` RERA ID: ${project.reraId}` : ""}`,
        url: `${SITE_URL}${canonicalPath}`,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: getCountry(project.countryCode).currency,
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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <BackButton fallbackHref="/new-projects" label="Back to all projects" variant="pill" size="sm" />
                <PageBreadcrumbs
                  items={[
                    { label: "New Projects", href: "/new-projects" },
                    ...(cityName ? [{ label: cityName, href: projectSearchPath(cityName, [], project.countryCode) }] : []),
                    { label: project.name },
                  ]}
                  renderJsonLd={false}
                />
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
    const canonicalPath = projectSearchPath(location.city, location.localities, country);
    if (canonicalPath !== `/new-projects/${rawSegments.join("/")}`) permanentRedirect(canonicalPath);
  }

  const { items: initialProjects, total: initialTotal, ok, moveTo } = await loadLocation(country, city, localities);
  if (moveTo) permanentRedirect(moveTo);
  // If the API failed, throw so a backend blip is never cached as an empty page (the last good page stays).
  // An empty city / area still renders (empty state, noindex), same as every other directory.
  if (!ok) throw new Error("projects API unavailable");
  const firstProject = initialProjects[0];
  // Must match the first card's src in NewProjectsClient (same resized rendition).
  const lcpImage = firstProject?.images?.[0] ? sizedImageUrl(normalizeR2Url(firstProject.images[0]), 640) : null;

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
        item: `${SITE_URL}${projectSearchPath(city, [], country)}`,
      },
      ...(localities[0]
        ? [
            {
              "@type": "ListItem",
              position: 4,
              name: localities[0],
              item: `${SITE_URL}${projectSearchPath(city, [localities[0]], country)}`,
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
          initialCountry={country}
          initialProjects={initialProjects}
          initialTotal={initialTotal}
        />
      </main>
      <FooterLinks />
    </div>
  );
}
