import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import FlatmatesDiscoveryPage from "@/app/flatmates/page";
import { buildCanonical, SITE_URL } from "@/constants/seo";
import { fromSearchSlug } from "@/components/search/searchQuery";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import type { FlatmateListing } from "@/types/flatmate.types";

export const revalidate = 60;

type Props = { params: Promise<{ segments?: string[] }> };

const CITY_ALIASES: Record<string, string> = { bangalore: "bengaluru", delhi: "new-delhi", gurgaon: "gurugram" };

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

const getInitialFlatmates = cache(async (city?: string, locality?: string) => {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://awasio.com/api";
    let query = "pageSize=18";
    if (city && city !== "India") query += `&city=${encodeURIComponent(city)}`;
    if (locality) query += `&locality=${encodeURIComponent(locality)}`;
    const endpoint = toInternalApiUrl(`${apiBase}/v1/flatmates?${query}`);
    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!res.ok) return { items: [] as FlatmateListing[], total: 0 };
    const payload = await res.json();
    const data = payload?.data || payload;
    return {
      items: (Array.isArray(data?.items) ? data.items : []) as FlatmateListing[],
      total: Number(data?.total ?? 0),
    };
  } catch {
    return { items: [] as FlatmateListing[], total: 0 };
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments = [] } = await params;
  const city = segments[0] ? fromSearchSlug(segments[0]) : "India";
  const locality = segments[1] ? fromSearchSlug(segments[1]) : "";
  const location = [locality, city].filter(Boolean).join(", ");
  const pageTitle = `Find Rooms & Compatible Flatmates in ${location}`;
  const description = `Browse rooms offered, room seekers and buddy-up listings in ${location}. Compare budget, move-in date and lifestyle compatibility before connecting.`;
  const path = `/flatmate${segments.length ? `/${segments.join("/")}` : ""}`;
  const canonicalUrl = buildCanonical(path);
  const socialImage = `${process.env.NEXT_PUBLIC_SITE_URL || "https://awasio.com"}/og-image.png`;

  let hasResults = true;
  if (segments.length > 0) {
    const initialData = await getInitialFlatmates(city !== "India" ? city : undefined, locality || undefined);
    if (initialData.total === 0) hasResults = false;
  }

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

export default async function FlatmateSearchPage({ params }: Props) {
  const { segments = [] } = await params;
  if (segments.length > 2) notFound();
  const alias = segments[0] && CITY_ALIASES[segments[0].toLowerCase()];
  if (alias) permanentRedirect(`/flatmate/${alias}${segments[1] ? `/${segments[1]}` : ""}`);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://awasio.com";
  const city = segments[0] ? fromSearchSlug(segments[0]) : "";
  const locality = segments[1] ? fromSearchSlug(segments[1]) : "";

  const initialData = await getInitialFlatmates(city || undefined, locality || undefined);
  const getCardImage = (item?: FlatmateListing) => {
    if (!item) return null;
    const raw = item.mode === "HAVE_ROOM" ? item.photos?.[0] : item.profile?.profilePhoto || item.photos?.[0];
    return raw ? normalizeR2Url(raw) : null;
  };
  const lcpImage1 = getCardImage(initialData.items[0]);
  const lcpImage2 = getCardImage(initialData.items[1]);

  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Flatmates", item: buildCanonical("/flatmate") },
  ];
  if (city && segments[0]) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 3,
      name: city,
      item: buildCanonical(`/flatmate/${segments[0]}`),
    });
  }
  if (locality && segments[1]) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 4,
      name: locality,
      item: buildCanonical(`/flatmate/${segments[0]}/${segments[1]}`),
    });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  };

  return (
    <>
      {lcpImage1 && (
        <link rel="preload" as="image" href={lcpImage1} fetchPriority="high" />
      )}
      {lcpImage2 && (
        <link rel="preload" as="image" href={lcpImage2} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FlatmatesDiscoveryPage
        initialCity={city}
        initialLocality={locality}
        initialItems={initialData.items}
        initialTotal={initialData.total}
      />
    </>
  );
}
