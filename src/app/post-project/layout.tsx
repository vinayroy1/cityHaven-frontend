import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "List Real Estate Project - Get 1,000 Free Credits on Signup | Awasio" },
  description:
    "Post new residential projects, towers, townships, and commercial developments on Awasio. Get 1,000 free welcome credits to boost your projects and reach verified buyers.",
  alternates: { canonical: buildCanonical("/post-project") },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "List Real Estate Project - Get 1,000 Free Credits on Signup | Awasio",
    description:
      "Post new residential projects, towers, townships, and commercial developments on Awasio with 1,000 free welcome credits, verified RERA badges, and direct buyer leads.",
    url: buildCanonical("/post-project"),
    type: "website",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }],
  },
};

export default function PostProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
