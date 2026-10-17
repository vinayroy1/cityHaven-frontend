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
  const title = `Find Rooms & Compatible Flatmates in ${location} | Awasio`;
  const description = `Browse rooms offered, room seekers and buddy-up listings in ${location}. Compare budget, move-in date and lifestyle compatibility before connecting.`;
  const path = `/flatmate${segments.length ? `/${segments.join("/")}` : ""}`;
  return { title, description, alternates: { canonical: buildCanonical(path) }, openGraph: { title, description, url: buildCanonical(path), type: "website" } };
}

export default async function FlatmateSearchPage({ params }: Props) {
  const { segments = [] } = await params;
  if (segments.length > 2) notFound();
  const alias = segments[0] && CITY_ALIASES[segments[0].toLowerCase()];
  if (alias) permanentRedirect(`/flatmate/${alias}${segments[1] ? `/${segments[1]}` : ""}`);
  return <FlatmatesDiscoveryPage initialCity={segments[0] ? fromSearchSlug(segments[0]) : ""} initialLocality={segments[1] ? fromSearchSlug(segments[1]) : ""} />;
}
