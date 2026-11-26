import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import type { InteriorProfile } from "@/types/interior.types";
import { breadcrumbJsonLd, cityLabel } from "../lib/breadcrumbs";
import { listingPath } from "@/lib/seo/countryPath";
import { profileName } from "../components/profile/utils";
import { ProfilePageClient } from "./ProfilePageClient";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";

const profilePath = (p: InteriorProfile, citySlug: string) => interiorProfilePath({ primaryCity: p.primaryCity || citySlug, slug: p.slug });

function clip(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function profileMetadata(profile: InteriorProfile, city: string): Metadata {
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
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": url,
    name: profileName(p),
    url,
    description: p.tagline || p.about || undefined,
    image: p.coverBanner || p.logo || undefined,
    logo: p.logo || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.primaryLocality || p.primaryCity,
      addressRegion: p.primaryCity,
      addressCountry: p.countryCode || "IN",
    },
    areaServed: (p.serviceCities?.length ? p.serviceCities : [p.primaryCity]).filter(Boolean),
  };
}

export function InteriorProfileView({ profile, city, slug }: { profile: InteriorProfile; city: string; slug: string }) {
  const cityName = profile?.primaryCity || cityLabel(city);
  const trail = [
    { name: "Home", path: "/" },
    { name: "Interior designers", path: "/interior-designers" },
    { name: cityName, path: listingPath("/interior-designers", cityName, null, profile.countryCode) },
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
