import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";
import { PropertyListingLanding } from "@/app/post-property-free/PropertyListingLanding";

export const metadata: Metadata = listingMetadata("rentFlat");

export default function RentOutFlatPage() {
  return <PropertyListingLanding seoKey="rentFlat" />;
}
