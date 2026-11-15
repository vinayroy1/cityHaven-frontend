import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { DirectoryPage } from "../lib/DirectoryPage";
import { cityFromSlug, fetchPanditCities, fetchPanditDirectory } from "../lib/server-data";

export const revalidate = 120;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await cityFromSlug(slug);
  const dir = await fetchPanditDirectory(city);
  const total = dir.data?.pagination.total ?? 0;
  const title = `Pandit for Puja & Vastu Consultant in ${city} – Dakshina & Reviews | Awasio`;
  const description = `${total ? `${total} ` : ""}pandits and vastu consultants in ${city} for griha pravesh, bhoomi pujan, katha, havan, wedding and vastu checks. Compare dakshina, languages and reviews.`;
  const url = buildCanonical(`/pandit-vastu/${slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Thin pages stay out of the index until they have listings.
    robots: total ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
  };
}

export default async function PanditCityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = await cityFromSlug(slug);
  const [dir, cities] = await Promise.all([fetchPanditDirectory(city), fetchPanditCities()]);
  if (!dir.ok) throw new Error("pandit API unavailable");
  return <DirectoryPage city={city} items={dir.data?.items ?? []} total={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />;
}
