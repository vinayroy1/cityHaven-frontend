import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { STAMP_DUTY_BY_SLUG, STAMP_DUTY_STATES } from "@/features/stampDuty/data";
import { StampDutyStateView } from "@/components/stampDuty/StampDutyView";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return STAMP_DUTY_STATES.map((s) => ({ state: s.slug }));
}

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = STAMP_DUTY_BY_SLUG.get((await params).state);
  if (!s) return {};
  const title = `Stamp Duty in ${s.name} 2026: Rates, Registration Charges & Calculator | Awasio`;
  const description = `Stamp duty in ${s.name}: ${s.summary.men} for men, ${s.summary.women} for women, ${s.summary.joint} joint. Registration ${s.summary.registration}. Calculate the exact amount for your property.`;
  const url = buildCanonical(`/stamp-duty-calculator/${s.slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

export default async function Page({ params }: Props) {
  const s = STAMP_DUTY_BY_SLUG.get((await params).state);
  if (!s) notFound();
  return <StampDutyStateView s={s} />;
}
