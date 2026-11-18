import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical } from "@/constants/seo";
import { flatmatePath } from "@/features/flatmates/paths";
import { splitCountry } from "@/lib/seo/countryPath";
import type { FlatmateListing } from "@/types/flatmate.types";

type Props = { children: React.ReactNode; params: Promise<{ segments: string[] }> };

/** /flatmates/<slug> or /flatmates/<cc>/<slug>; anything else is not a listing URL. */
function slugOf(segments: string[]): string | null {
  const { rest } = splitCountry(segments);
  return rest.length === 1 ? rest[0] : null;
}

const getListing = cache(async (slug: string): Promise<FlatmateListing | null> => {
  try {
    const response = await fetch(toInternalApiUrl(API_ENDPOINTS.flatmates.detail(slug)), { next: { revalidate: 300 } });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: FlatmateListing };
    return payload.data ?? null;
  } catch {
    // The page shows its own error state when the API is temporarily unavailable.
    return null;
  }
});

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const slug = slugOf((await params).segments);
  const listing = slug ? await getListing(slug) : null;
  if (listing) {
    const location = [listing.locality, listing.cityName].filter(Boolean).join(", ");
    const title = `${listing.title} | Flatmate in ${location} - Awasio`;
    const description = (listing.description || `${listing.mode === "HAVE_ROOM" ? "Room available" : "Flatmate requirement"} in ${location}. Compare budget, availability and lifestyle preferences.`).slice(0, 160);
    const canonical = buildCanonical(flatmatePath(listing));
    return { title: { absolute: title }, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website", images: listing.photos?.[0] ? [listing.photos[0]] : undefined } };
  }
  return { title: { absolute: "Flatmate Listing | Awasio" }, robots: { index: false, follow: true } };
}

export default async function FlatmateDetailLayout({ children, params }: Props) {
  const segments = (await params).segments;
  const slug = slugOf(segments);
  if (!slug) notFound();
  // One URL per listing: India unprefixed, other countries under their code.
  const listing = await getListing(slug);
  if (listing?.slug) {
    const canonical = flatmatePath(listing);
    if (canonical !== `/flatmates/${segments.join("/")}`) permanentRedirect(canonical);
  }
  return children;
}
