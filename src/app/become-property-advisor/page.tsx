import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";
import { ListingLandingPage } from "@/components/seo/ListingLandingPage";

export const metadata: Metadata = listingMetadata("advisor");

export default function Page() {
  return <ListingLandingPage seoKey="advisor" />;
}
