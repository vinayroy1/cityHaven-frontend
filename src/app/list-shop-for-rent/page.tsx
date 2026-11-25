import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";
import { PropertyListingLanding } from "@/app/post-property-free/PropertyListingLanding";

export const metadata: Metadata = listingMetadata("shop");

export default function ListShopForRentPage() {
  return <PropertyListingLanding seoKey="shop" />;
}
