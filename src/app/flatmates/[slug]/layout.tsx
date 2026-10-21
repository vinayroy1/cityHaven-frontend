import type { Metadata } from "next";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical } from "@/constants/seo";
import type { FlatmateListing } from "@/types/flatmate.types";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const endpoint = toInternalApiUrl(API_ENDPOINTS.flatmates.detail(slug));
    const response = await fetch(endpoint, { next: { revalidate: 300 } });
    if (response.ok) {
      const payload = await response.json() as { data?: FlatmateListing };
      const listing = payload.data;
      if (listing) {
        const location = [listing.locality, listing.cityName].filter(Boolean).join(", ");
        const title = `${listing.title} | Flatmate in ${location} - Awasio`;
        const description = (listing.description || `${listing.mode === "HAVE_ROOM" ? "Room available" : "Flatmate requirement"} in ${location}. Compare budget, availability and lifestyle preferences.`).slice(0, 160);
        const canonical = buildCanonical(`/flatmates/${slug}`);
        return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website", images: listing.photos?.[0] ? [listing.photos[0]] : undefined } };
      }
    }
  } catch {
    // Use the safe fallback below when the API is temporarily unavailable.
  }
  return { title: "Flatmate Listing | Awasio", robots: { index: false, follow: true } };
}

export default function FlatmateDetailLayout({ children }: Props) {
  return children;
}
