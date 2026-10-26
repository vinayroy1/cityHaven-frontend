import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "List Real Estate Project - Developer & Builder Portal | Awasio",
  description:
    "Post new residential projects, towers, townships, and commercial developments on Awasio. Verified RERA listings with interactive floor plans and direct buyer inquiries.",
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
    title: "List Real Estate Project - Developer & Builder Portal | Awasio",
    description:
      "Post new residential projects, towers, townships, and commercial developments on Awasio with verified RERA badges and direct buyer leads.",
    url: buildCanonical("/post-project"),
    type: "website",
  },
};

export default function PostProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
