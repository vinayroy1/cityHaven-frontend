import React from "react";
import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing & Contact Packs",
  description:
    "Transparent pricing for verified owner contact unlocks, property listing plans, and enterprise team workspaces on Awasio.",
  alternates: { canonical: buildCanonical("/pricing") },
  openGraph: {
    title: "Pricing & Contact Packs | Awasio",
    description:
      "Unlock verified direct owner phone numbers on demand with zero lock-in, or get all-in-one listing memberships.",
    url: buildCanonical("/pricing"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Contact Packs | Awasio",
    description: "Transparent pricing for verified owner contacts and listing packages on Awasio.",
  },
};

const PRICING_FAQS = [
  {
    q: "How do contact unlocks work?",
    a: "Each contact pack gives you credits to view verified owner phone numbers. Unlocking a contact charges 1 credit once per property. Once unlocked, you (or your organization members) can view that contact repeatedly without paying again.",
  },
  {
    q: "Who pays for organization listings & unlocks?",
    a: "Listing management is billed to the organization that owns the listing. When an employee unlocks someone else's contact using the organization workspace, the organization's allowance is deducted and shared with authorized members.",
  },
  {
    q: "How are team seats counted?",
    a: "Seat capacity counts the owner, all active members, and unexpired pending invitations. Invitations reserve seats until accepted, revoked, or expired.",
  },
  {
    q: "Does buying a plan automatically verify my account?",
    a: "No. Verification is an independent trust and safety process. Paid plans include priority verification support, but the verified badge is granted only when KYC documents are submitted and approved.",
  },
];

export default function PricingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Awasio Verified Contact Packs & Memberships",
    description: "Direct owner phone number unlocks and verified property listing plans on Awasio.",
    brand: {
      "@type": "Brand",
      name: "Awasio",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: "199",
      highPrice: "9999",
      offerCount: "8",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <PricingClient />
    </>
  );
}
