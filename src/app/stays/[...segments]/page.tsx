import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { listingPath, splitCountry, titleFromSlug } from "@/lib/seo/countryPath";
import { stayPath } from "@/features/stays/options";
import StayDetail from "./StayDetail";
import { getStay, stayMetadata } from "./StayMeta";
import { StaysDirectory } from "../StaysDirectory";
import { getInitialPage, staysMetadata } from "../serverData";

export const revalidate = 300;

type Props = { params: Promise<{ segments: string[] }> };

/**
 * /stays[/cc]/<slug>             stay detail (the slug already names the place)
 * /stays[/cc]/<city>             city page (when the single segment is not a stay)
 * /stays[/cc]/<city>/<locality>  locality page
 * India has no country segment; other countries use their ISO code (see lib/seo/countryPath).
 */
async function resolve(segments: string[]) {
  const { country, rest } = splitCountry(segments.map((s) => s.toLowerCase()));
  if (rest.length === 1) {
    const stay = await getStay(rest[0]);
    if (stay?.slug) return { kind: "stay" as const, stay };
  }
  if (rest.length !== 1 && rest.length !== 2) return null;
  const city = titleFromSlug(rest[0]);
  const locality = rest[1] ? titleFromSlug(rest[1]) : "";
  const initialPage = await getInitialPage(city, locality);
  const items = initialPage?.page.items ?? [];
  const actual = items[0]?.countryCode ?? country;
  return { kind: "place" as const, country, city, locality, initialPage, items, canonical: listingPath("/stays", city, locality || null, actual) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).segments);
  if (!r) return {};
  if (r.kind === "stay") return stayMetadata(r.stay);
  return {
    ...staysMetadata([r.locality, r.city].filter(Boolean).join(", "), r.canonical),
    // Thin pages stay out of the index until they have stays.
    ...(r.items.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function StaysRoute({ params }: Props) {
  const segments = (await params).segments;
  const path = `/stays/${segments.join("/")}`;
  const r = await resolve(segments);
  if (!r) notFound();

  if (r.kind === "stay") {
    const canonical = stayPath(r.stay);
    if (canonical !== path) permanentRedirect(canonical);
    return <StayDetail slug={r.stay.slug} />;
  }

  // An empty city / area still renders (empty state, noindex) so picking it never lands on a 404.
  if (r.canonical !== path) permanentRedirect(r.canonical);
  return <StaysDirectory key={path} initialCity={r.city} initialLocality={r.locality} country={r.country} initialPage={r.initialPage} />;
}
