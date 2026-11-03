/** Resolves a typed locality name (+city) to its /nearby/{slug} page. */
import { redirect } from "next/navigation";
import { fetchNearbyData } from "@/components/nearby/NearbyPlaces";

export const metadata = { robots: { index: false } };

export default async function NearbyFind({ searchParams }: { searchParams: Promise<{ locality?: string; city?: string }> }) {
  const { locality, city } = await searchParams;
  const d = locality ? await fetchNearbyData({ locality, cityName: city }) : null;
  redirect(d?.locality?.slug ? `/nearby/${encodeURIComponent(d.locality.slug)}` : "/nearby");
}
