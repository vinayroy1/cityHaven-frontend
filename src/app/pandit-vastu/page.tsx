import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { DirectoryPage } from "./lib/DirectoryPage";
import { fetchPanditCities, fetchPanditDirectory } from "./lib/server-data";

export const revalidate = 120;

const TITLE = "Book a Pandit for Puja & Vastu Consultant near you | Awasio";
const DESCRIPTION =
  "Find verified pandits for griha pravesh, bhoomi pujan, satyanarayan katha, havan and sanskars, and vastu consultants for homes, plots and offices. Compare dakshina, languages and reviews.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: buildCanonical("/pandit-vastu") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: buildCanonical("/pandit-vastu"), type: "website", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
};

export default async function PanditDirectoryPage() {
  const [dir, cities] = await Promise.all([fetchPanditDirectory("", null, "IN"), fetchPanditCities()]);
  if (!dir.ok) throw new Error("pandit API unavailable");
  return <DirectoryPage city="" locality={null} country={null} items={dir.data?.items ?? []} total={dir.data?.pagination.total ?? 0} cities={cities.data ?? []} />;
}
