import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import type { InteriorProfile } from "@/types/interior.types";
import { fetchInteriorProfile } from "../../lib/server-data";
import { breadcrumbJsonLd, cityLabel } from "../../lib/breadcrumbs";
import { profileName } from "../../components/profile/utils";
import { ProfilePageClient } from "./ProfilePageClient";

export const revalidate = 60;

type Params = Promise<{ city: string; slug: string }>;

const profilePath = (p: InteriorProfile, citySlug: string) =>
  `/interior-designers/${encodeURIComponent((p.primaryCity || citySlug).toLowerCase())}/${p.slug}`;

function clip(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city, slug } = await params;
  const profile = await fetchInteriorProfile(slug);
  if (!profile) {
    return {
      title: "Interior designer not found",
      robots: { index: false, follow: true },
      alternates: { canonical: buildCanonical(`/interior-designers/${city}/${slug}`) },
    };
  }
  const name = profileName(profile);
  const cityName = profile.primaryCity || cityLabel(city);
  const title = `${name} – Interior Designer in ${cityName}`;
  const summary = (profile.tagline || profile.about || "").trim();
  const description = clip(
    `${summary ? `${summary.replace(/[.\s]+$/, "")}. ` : ""}${name} is an interior designer in ${cityName}. View portfolio, pricing and reviews on Awasio.`,
  );
  const url = buildCanonical(profilePath(profile, city));
  const image = profile.coverBanner || profile.logo || undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: "Awasio",
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}

function businessJsonLd(p: InteriorProfile, url: string) {
  const rating = Number(p.rating);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": url,
    name: profileName(p),
    url,
    description: p.tagline || p.about || undefined,
    image: p.coverBanner || p.logo || undefined,
    logo: p.logo || undefined,
    telephone: p.isPhonePublic && p.primaryPhone ? p.primaryPhone : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.primaryLocality || p.primaryCity,
      addressRegion: p.primaryCity,
      addressCountry: "IN",
    },
    areaServed: (p.serviceCities?.length ? p.serviceCities : [p.primaryCity]).filter(Boolean),
    ...(p.reviewCount > 0 && rating > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: p.reviewCount } }
      : {}),
  };
}

export default async function InteriorProfileDetailPage({ params }: { params: Params }) {
  const { city, slug } = await params;
  const profile = await fetchInteriorProfile(slug);

  const cityName = profile?.primaryCity || cityLabel(city);
  const trail = [
    { name: "Home", path: "/" },
    { name: "Interior designers", path: "/interior-designers" },
    { name: cityName, path: `/interior-designers?city=${encodeURIComponent(cityName)}` },
    ...(profile ? [{ name: profileName(profile), path: profilePath(profile, city) }] : []),
  ];
  const jsonLd: object[] = [breadcrumbJsonLd(trail)];
  if (profile) jsonLd.push(businessJsonLd(profile, buildCanonical(profilePath(profile, city))));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProfilePageClient slug={slug} citySlug={city} initialProfile={profile} />
    </>
  );
}
