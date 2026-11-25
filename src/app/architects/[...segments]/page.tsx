import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { splitCountry } from "@/lib/seo/countryPath";
import { architectProfilePath } from "@/features/architect/options";
import { ArchitectProfileView, loadProfile, profileMetadata } from "../_views/ProfileView";
import { ArchitectCityView, loadPlace, loadPlaceResults, placeMetadata } from "../_views/CityView";

export const revalidate = 120;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ segments: string[] }> };

/**
 * /architects[/cc]/city            city page
 * /architects[/cc]/city/<slug>     company profile
 * /architects[/cc]/city/<locality> locality page (when <slug> is not a company)
 * India has no country segment; other countries use their ISO code (see lib/seo/countryPath).
 */
async function resolve(segments: string[]) {
  const { country, rest } = splitCountry(segments.map((s) => s.toLowerCase()));
  if (rest.length === 2) {
    const profile = await loadProfile(rest[1]);
    if (profile) return { kind: "profile" as const, profile };
  }
  if (rest.length !== 1 && rest.length !== 2) return null;
  const place = await loadPlace(country, rest[0], rest[1] ?? null);
  return { kind: "place" as const, place };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).segments);
  if (!r) return {};
  return r.kind === "profile" ? profileMetadata(r.profile) : placeMetadata(r.place);
}

export default async function ArchitectRoute({ params }: Props) {
  const segments = (await params).segments;
  const path = `/architects/${segments.join("/")}`;
  const r = await resolve(segments);
  if (!r) notFound();

  if (r.kind === "profile") {
    const canonical = architectProfilePath(r.profile);
    if (canonical !== path) permanentRedirect(canonical);
    return <ArchitectProfileView p={r.profile} />;
  }

  // An empty city / area still renders (empty state, noindex) so picking it never lands on a 404.
  const { dir, canonical } = await loadPlaceResults(r.place);
  if (canonical !== path) permanentRedirect(canonical);
  return <ArchitectCityView place={r.place} dir={dir} />;
}
