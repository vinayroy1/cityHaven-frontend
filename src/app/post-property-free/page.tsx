import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";
import { PropertyListingLanding } from "./PropertyListingLanding";

export const metadata: Metadata = listingMetadata("property");

export default function PostPropertyFreePage() {
  return <PropertyListingLanding seoKey="property" />;
}
