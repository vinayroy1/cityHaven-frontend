import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import FlatmatesDiscoveryPage from "@/app/flatmates/page";
import { buildCanonical } from "@/constants/seo";
import { fromSearchSlug } from "@/components/search/searchQuery";

type Props = { params: Promise<{ segments?: string[] }> };

const CITY_ALIASES: Record<string, string> = { bangalore: "bengaluru", delhi: "new-delhi", gurgaon: "gurugram" };

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

  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalUrl },
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
  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Flatmates", item: buildCanonical("/flatmates") },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FlatmatesDiscoveryPage initialCity={city} initialLocality={locality} />
    </>
  );
}
