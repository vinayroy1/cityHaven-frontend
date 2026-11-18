import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { listingPath, splitCountry, titleFromSlug } from "@/lib/seo/countryPath";
import { PANDIT_BASE, panditProfilePath } from "@/features/pandit/options";
import { PanditProfileView, loadProfile, profileMetadata } from "../_views/ProfileView";
import { DirectoryPage } from "../lib/DirectoryPage";
import { cityFromSlug, fetchPanditCities, fetchPanditDirectory } from "../lib/server-data";

export const revalidate = 120;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ segments: string[] }> };

/**
 * /pandit-vastu[/cc]/city            city page
 * /pandit-vastu[/cc]/city/<slug>     profile
 * /pandit-vastu[/cc]/city/<locality> locality page (when <slug> is not a profile)
 * India has no country segment; other countries use their ISO code (see lib/seo/countryPath).
 */
async function resolve(segments: string[]) {
  const { country, rest } = splitCountry(segments.map((s) => s.toLowerCase()));
  if (rest.length === 2) {
    const profile = await loadProfile(rest[1]);
    if (profile) return { kind: "profile" as const, profile };
  }
  if (rest.length !== 1 && rest.length !== 2) return null;
  const city = await cityFromSlug(rest[0]);
  const locality = rest[1] ? titleFromSlug(rest[1]) : null;
  return { kind: "place" as const, country, city, locality };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).segments);
  if (!r) return {};
  if (r.kind === "profile") return profileMetadata(r.profile);
  const dir = await fetchPanditDirectory(r.city, r.locality);
  const total = dir.data?.pagination.total ?? 0;
  const where = [r.locality, r.city].filter(Boolean).join(", ");
  const title = `Pandit for Puja & Vastu Consultant in ${where} – Dakshina & Reviews | Awasio`;
  const description = `${total ? `${total} ` : ""}pandits and vastu consultants in ${where} for griha pravesh, bhoomi pujan, katha, havan, wedding and vastu checks. Compare dakshina, languages and reviews.`;
  const url = buildCanonical(listingPath(PANDIT_BASE, r.city, r.locality, dir.data?.items[0]?.countryCode ?? r.country));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Thin pages stay out of the index until they have listings.
    robots: total ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

export default async function PanditRoute({ params }: Props) {
  const segments = (await params).segments;
  const path = `${PANDIT_BASE}/${segments.join("/")}`;
  const r = await resolve(segments);
  if (!r) notFound();

  if (r.kind === "profile") {
    const canonical = panditProfilePath(r.profile);
    if (canonical !== path) permanentRedirect(canonical);
    return <PanditProfileView p={r.profile} />;
  }

  const [dir, cities] = await Promise.all([fetchPanditDirectory(r.city, r.locality), fetchPanditCities()]);
  if (!dir.ok) throw new Error("pandit API unavailable");
  const items = dir.data?.items ?? [];
  // An empty city / area still renders (empty state, noindex) so picking it never lands on a 404.
  const canonical = listingPath(PANDIT_BASE, r.city, r.locality, items[0]?.countryCode ?? r.country);
  if (canonical !== path) permanentRedirect(canonical);
  return <DirectoryPage city={r.city} locality={r.locality} country={r.country} items={items} total={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />;
}
