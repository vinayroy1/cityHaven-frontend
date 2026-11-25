import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";
import { PropertyListingLanding } from "@/app/post-property-free/PropertyListingLanding";

export const metadata: Metadata = listingMetadata("warehouse");

export default function ListWarehouseGodownPage() {
  return <PropertyListingLanding seoKey="warehouse" />;
}
