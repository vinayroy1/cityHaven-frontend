import type { Metadata } from "next";
import { listingMetadata } from "@/components/seo/ListingSeoContent";

export const metadata: Metadata = listingMetadata("project");

export default function PostProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
