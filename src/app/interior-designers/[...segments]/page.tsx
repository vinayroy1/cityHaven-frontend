import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";
import { listingPath, splitCountry, titleFromSlug } from "@/lib/seo/countryPath";
import { DirectoryClient } from "../DirectoryClient";
import { fetchInteriorDirectory, fetchInteriorProfile } from "../lib/server-data";
import { breadcrumbJsonLd, cityLabel } from "../lib/breadcrumbs";
import { InteriorProfileView, profileMetadata } from "./ProfileRoute";

export const revalidate = 60;

// Pages are rendered on first visit, then cached (ISR) — without this the route is fully dynamic.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ segments: string[] }> };

const BASE = "/interior-designers";

/**
 * /interior-designers[/cc]/city            city page
 * /interior-designers[/cc]/city/<slug>     designer profile
 * /interior-designers[/cc]/city/<locality> locality page (when <slug> is not a designer)
 * India has no country segment; other countries use their ISO code (see lib/seo/countryPath).
 */
async function resolve(segments: string[]) {
  const { country, rest } = splitCountry(segments.map((s) => s.toLowerCase()));
  if (rest.length === 2) {
    const profile = await fetchInteriorProfile(rest[1]);
    if (profile) return { kind: "profile" as const, profile, city: rest[0], slug: rest[1] };
  }
  if (rest.length !== 1 && rest.length !== 2) return null;
  const city = cityLabel(rest[0]);
  const locality = rest[1] ? titleFromSlug(rest[1]) : null;
  const data = await fetchInteriorDirectory(city, locality);
  const items = data?.items ?? [];
  // The results decide the real country (an unprefixed Dubai page moves to /ae/dubai).
  const actual = items[0]?.countryCode ?? country;
  return { kind: "place" as const, country, city, locality, data, items, canonical: listingPath(BASE, city, locality, actual) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).segments);
  if (!r) return {};
  if (r.kind === "profile") return profileMetadata(r.profile, r.city);
  const where = [r.locality, r.city].filter(Boolean).join(", ");
  const title = `Best Interior Designers & Studios in ${where}`;
  const description = `Compare verified interior designers, architects and modular studios in ${where}. See real portfolios, material brands, per sq.ft. pricing and warranties, then get free quotes on Awasio.`;
  const url = buildCanonical(r.canonical);
  return {
    title,
    description,
    alternates: { canonical: url },
    // Thin pages stay out of the index until they have designers.
    robots: r.items.length ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website", siteName: "Awasio", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InteriorDesignersRoute({ params }: Props) {
  const segments = (await params).segments;
  const path = `${BASE}/${segments.join("/")}`;
  const r = await resolve(segments);
  if (!r) notFound();

  if (r.kind === "profile") {
    const canonical = interiorProfilePath(r.profile);
    if (canonical !== path) permanentRedirect(canonical);
    return <InteriorProfileView profile={r.profile} city={r.city} slug={r.slug} />;
  }

  // An empty city / area still renders (empty state, noindex) so picking it never lands on a 404.
  if (r.canonical !== path) permanentRedirect(r.canonical);

  const where = [r.locality, r.city].filter(Boolean).join(", ");
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Interior designers", path: BASE },
      { name: r.city, path: listingPath(BASE, r.city, null, r.country) },
      ...(r.locality ? [{ name: r.locality, path: r.canonical }] : []),
    ]),
    ...(r.items.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Interior designers in ${where}`,
            itemListElement: r.items.slice(0, 20).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.displayName || p.businessName || p.fullName || "Interior designer",
              url: buildCanonical(interiorProfilePath({ primaryCity: p.primaryCity || r.city, slug: p.slug, countryCode: p.countryCode })),
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <DirectoryClient key={path} initialCity={r.city} initialLocality={r.locality ?? ""} country={r.country} initialState="" initialData={r.data} />
    </>
  );
}
