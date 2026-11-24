import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { StampDutyIndexView } from "@/components/stampDuty/StampDutyView";

export const revalidate = 86400;

const TITLE = "Stamp Duty Calculator 2026: State-wise Stamp Duty & Registration Charges | Awasio";
const DESCRIPTION =
  "Calculate stamp duty and registration charges for property in every Indian state. Rates for men, women and joint buyers in Maharashtra, Delhi, UP, Karnataka, Haryana and more, updated for 2026.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: buildCanonical("/stamp-duty-calculator") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: buildCanonical("/stamp-duty-calculator"), type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
};

export default function Page() {
  return <StampDutyIndexView />;
}
