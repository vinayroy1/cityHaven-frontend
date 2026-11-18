import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { agentsListPath } from "@/features/advisors/paths";
import { AgentsDirectoryView } from "./components/AgentsDirectoryView";
import { fetchAdvisors } from "./lib/server-data";

export const metadata: Metadata = {
  title: { absolute: "Verified Real Estate Advisors & Local Tour Guides | Awasio" },
  description:
    "Find trusted, RERA-registered real estate advisors and local property guides across Delhi, Gurugram, Mumbai, Bengaluru, and Pune. Schedule verified in-person site visits and private property walkthroughs with zero buyer fees.",
  keywords: [
    "real estate agents",
    "verified property advisors",
    "RERA registered property agents",
    "Delhi real estate advisors",
    "Gurugram property agents",
    "Mumbai real estate brokers",
    "Bengaluru property consultants",
    "in-person site visits",
    "Awasio verified agents",
  ],
  openGraph: {
    title: "Verified Real Estate Advisors & Local Tour Guides | Awasio",
    description:
      "Connect with certified local specialists for private property walkthroughs, pricing negotiation, and verified title diligence across top Indian metros.",
    url: "https://awasio.com/agents",
    siteName: "Awasio",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Awasio Verified Real Estate Advisors",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Real Estate Advisors & Local Tour Guides | Awasio",
    description:
      "Schedule verified in-person property walkthroughs with certified local real estate specialists.",
    images: ["https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80"],
  },
  alternates: {
    canonical: "https://awasio.com/agents",
  },
};

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 80) || "";

export default async function AgentsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  // Old /agents?city=Patna links move to the path URL (/agents/patna).
  const city = one(sp.city);
  if (city && city !== "All Cities") permanentRedirect(agentsListPath(city, one(sp.locality) || null));
  const agents = await fetchAdvisors({ countryCode: "IN" });
  return <AgentsDirectoryView agents={agents} />;
}
