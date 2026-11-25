import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";
import { PropertyListingLanding } from "@/app/post-property-free/PropertyListingLanding";

export const metadata: Metadata = listingMetadata("studio1rk");

export default function List1rkStudioPage() {
  return <PropertyListingLanding seoKey="studio1rk" />;
}
