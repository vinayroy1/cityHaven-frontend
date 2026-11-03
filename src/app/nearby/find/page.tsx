/** Resolves a typed locality name (+city) to its /nearby/{slug} page. */
import { redirect } from "next/navigation";
import { fetchNearbyData } from "@/components/nearby/NearbyPlaces";

export const metadata = { robots: { index: false } };

export default async function NearbyFind({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; locality?: string; city?: string }>;
}) {
  const { slug, locality, city } = await searchParams;
  const d = slug ? await fetchNearbyData({ slug }) : locality ? await fetchNearbyData({ locality, cityName: city }) : null;
  redirect(d?.locality?.path ? `/nearby/${d.locality.path}` : "/nearby");
}
