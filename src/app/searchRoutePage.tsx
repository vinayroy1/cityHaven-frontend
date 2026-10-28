import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SearchPageClient } from "@/app/propertySearch/SearchPageClient";
import {
  SEARCH_INTENT_SLUGS,
  buildSearchHref,
  fromSearchSlug,
  intentFromSearchSlug,
  parseSearchParams,
  type IntentKey,
} from "@/components/search/searchQuery";
import { buildCanonical } from "@/constants/seo";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import type { FlatmateListing } from "@/types/flatmate.types";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";

export type IntentSearchRouteProps = {
  params: Promise<{ intent: string; segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_BASE = rawApiUrl.replace(/\/api$/, "");
const CITY_ALIASES: Record<string, string> = { bangalore: "bengaluru", delhi: "new-delhi", gurgaon: "gurugram" };
const searchSsrCache = new Map<string, { items: (PropertySearchItem | FlatmateListing)[]; total: number; timestamp: number }>();

type RouteLocation = { state?: string; city?: string; localities: string[] };

function parseLocation(segments: string[] = []): RouteLocation | null {
  if (segments[0] === "state") {
    if (segments.length !== 2 || !segments[1]) return null;
    return { state: fromSearchSlug(segments[1]), localities: [] };
  }
  if (segments.length > 3) return null;
  const [citySegment, ...localitySegments] = segments;
  return {
    city: citySegment ? fromSearchSlug(citySegment) : undefined,
    localities: localitySegments.map(fromSearchSlug).filter(Boolean).slice(0, 2),
  };
}

function intentCopy(intent: IntentKey) {
  switch (intent) {
    case "RENT": return { listingType: "RENT", label: "Properties for Rent" } as const;
    case "PG": return { listingType: "PG", label: "PG & Co-Living Spaces" } as const;
    case "FLATMATE": return { listingType: "PG", label: "Flatmates & Shared Homes" } as const;
    case "COMMERCIAL": return { listingType: "SELL", label: "Commercial Properties" } as const;
    case "PLOT": return { listingType: "SELL", label: "Plots & Land" } as const;
    default: return { listingType: "SELL", label: "Properties for Sale" } as const;
  }
}

export async function metadataForIntentSearch({ params }: IntentSearchRouteProps): Promise<Metadata> {
  const { intent: intentSlug, segments = [] } = await params;
  const intent = intentFromSearchSlug(intentSlug);
  const location = parseLocation(segments);
  if (!intent || !location) return {};

  const copy = intentCopy(intent);
  const locationLabel = location.state ? location.state : [...location.localities, location.city].filter(Boolean).join(", ") || "India";
  let countLabel = "";
  let hasResults = true;
  try {
    const isFlatmate = intent === "FLATMATE";
    const endpoint = toInternalApiUrl(isFlatmate ? `${API_BASE}/api/v1/flatmates` : `${API_BASE}/api/v1/propertyListing/search`);
    const url = new URL(endpoint);
    url.searchParams.set("pageSize", "1");
    if (isFlatmate) {
      if (location.city) url.searchParams.set("city", location.city);
      if (location.localities[0]) url.searchParams.set("locality", location.localities[0]);
    } else {
      url.searchParams.set("listingType", copy.listingType);
      if (location.city) url.searchParams.set("cityName", location.city);
      if (location.state) url.searchParams.set("q", location.state);
      for (const locality of location.localities) url.searchParams.append("locality", locality);
      if (intent === "COMMERCIAL") url.searchParams.set("resCom", "COMMERCIAL");
    }
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (response.ok) {
      const payload = await response.json();
      const total = Number(payload?.data?.total ?? payload?.total ?? 0);
      if (total > 0) {
        countLabel = `${total} `;
      } else if (segments.length > 0) {
        hasResults = false;
      }
    }
  } catch {
    // Static metadata remains useful when the count service is unavailable.
  }

  const pageTitle = `${countLabel}${copy.label} in ${locationLabel}`;
  const description = `Explore verified ${copy.label.toLowerCase()} in ${locationLabel}. Compare prices, essential details and direct-connect listings on Awasio.`;
  const canonicalPath = `/${SEARCH_INTENT_SLUGS[intent]}${segments.length ? `/${segments.join("/")}` : ""}`;
  const canonicalUrl = buildCanonical(canonicalPath);
  const socialImage = `${process.env.NEXT_PUBLIC_SITE_URL || "https://awasio.com"}/og-image.png`;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: hasResults,
      follow: true,
      googleBot: {
        index: hasResults,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${pageTitle} | Awasio`,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Awasio",
      images: [{ url: socialImage, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | Awasio`,
      description,
      images: [socialImage],
    },
  };
}

export async function IntentSearchRoute({ params, searchParams }: IntentSearchRouteProps) {
  const { intent: intentSlug, segments = [] } = await params;
  const query = await searchParams;
  const intent = intentFromSearchSlug(intentSlug);
  const location = parseLocation(segments);
  if (!intent || !location) notFound();

  const canonicalIntent = SEARCH_INTENT_SLUGS[intent];
  const citySlug = segments[0]?.toLowerCase();
  const canonicalCity = citySlug && CITY_ALIASES[citySlug];
  if (intentSlug !== canonicalIntent || canonicalCity) {
    const normalized = canonicalCity ? [canonicalCity, ...segments.slice(1)] : segments;
    permanentRedirect(`/${canonicalIntent}${normalized.length ? `/${normalized.join("/")}` : ""}`);
  }

  const hasLegacyLocationParams = ["city", "cityName", "locality", "localities", "loc", "intent"]
    .some((key) => query[key] !== undefined);
  if (hasLegacyLocationParams) {
    const urlParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) value.forEach((entry) => urlParams.append(key, entry));
      else if (value) urlParams.set(key, value);
    }
    if (location.state) {
      for (const key of ["city", "cityName", "locality", "localities", "loc", "intent"]) urlParams.delete(key);
      const remaining = urlParams.toString();
      permanentRedirect(`/${canonicalIntent}/state/${segments[1]}${remaining ? `?${remaining}` : ""}`);
    }
    const normalizedState = parseSearchParams(urlParams);
    normalizedState.intent = intent;
    if (location.city) normalizedState.cityName = location.city;
    if (location.localities.length > 0) {
      normalizedState.localities = location.localities.map((label) => ({ label, city: location.city }));
    }
    permanentRedirect(buildSearchHref(normalizedState));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://awasio.com";
  const copy = intentCopy(intent);
  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: copy.label, item: buildCanonical(`/${canonicalIntent}`) },
  ];
  if (location.city && segments[0]) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 3,
      name: location.city,
      item: buildCanonical(`/${canonicalIntent}/${segments[0]}`),
    });
  }
  if (location.localities?.[0] && segments[1]) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 4,
      name: location.localities[0],
      item: buildCanonical(`/${canonicalIntent}/${segments[0]}/${segments[1]}`),
    });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  };

  let initialItems: (PropertySearchItem | FlatmateListing)[] = [];
  let initialTotal: number | undefined = undefined;
  let lcpImage: string | null = null;

  try {
    const isFlatmate = intent === "FLATMATE";
    const endpoint = toInternalApiUrl(
      isFlatmate ? `${API_BASE}/api/v1/flatmates` : `${API_BASE}/api/v1/propertyListing/search`
    );
    const url = new URL(endpoint);
    url.searchParams.set("pageSize", "12");
    if (isFlatmate) {
      if (location.city) url.searchParams.set("city", location.city);
      if (location.localities[0]) url.searchParams.set("locality", location.localities[0]);
    } else {
      url.searchParams.set("listingType", copy.listingType);
      if (location.city) url.searchParams.set("cityName", location.city);
      if (location.state) url.searchParams.set("q", location.state);
      for (const locality of location.localities) url.searchParams.append("locality", locality);
      if (intent === "COMMERCIAL") url.searchParams.set("resCom", "COMMERCIAL");
    }
  const cacheKey = url.toString();
  const cached = searchSsrCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 60_000) {
    initialItems = cached.items;
    initialTotal = cached.total;
    const first = initialItems[0];
    if (first) {
      lcpImage = isFlatmate
        ? (first as FlatmateListing).photos?.[0] ?? null
        : toResultCardProps(first as PropertySearchItem).images?.[0] ?? null;
    }
  } else {
    try {
      const response = await fetch(url, { next: { revalidate: 60 } });
      if (response.ok) {
        const payload = await response.json();
        initialItems = payload?.data?.items ?? payload?.items ?? [];
        initialTotal = Number(payload?.data?.total ?? payload?.total ?? initialItems.length);
        searchSsrCache.set(cacheKey, { items: initialItems, total: initialTotal, timestamp: Date.now() });
        const first = initialItems[0];
        if (first) {
          if (isFlatmate) {
            lcpImage = (first as FlatmateListing).photos?.[0] ?? null;
          } else {
            lcpImage = toResultCardProps(first as PropertySearchItem).images?.[0] ?? null;
          }
        }
      }
    } catch {
      // Gracefully fallback to client hydration
    }
  }
  } catch {
    // Outer fallback
  }

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SearchPageClient
        routeIntent={intent}
        routeCity={location.city}
        routeLocalities={location.localities}
        routeState={location.state}
        initialItems={initialItems}
        initialTotal={initialTotal}
      />
    </>
  );
}
