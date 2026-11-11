import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalityView, localityViewMetadata } from "../../../_views/LocalityView";
import { isCountryPrefix } from "../../../_views/prefix";

export const revalidate = 86400;

/** Other countries' locality pages: /nearby/{prefix}/{city}/{locality} (e.g. /nearby/ae/dubai/jumeirah). */
type Props = { params: Promise<{ city: string; locality: string; sub: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, locality, sub } = await params;
  if (!isCountryPrefix(city)) return { title: "Locality not found", robots: { index: false } };
  return localityViewMetadata(`${city.toLowerCase()}/${decodeURIComponent(locality)}`, decodeURIComponent(sub));
}

export default async function Page({ params }: Props) {
  const { city, locality, sub } = await params;
  if (!isCountryPrefix(city)) notFound();
  return <LocalityView ck={`${city.toLowerCase()}/${decodeURIComponent(locality)}`} lk={decodeURIComponent(sub)} />;
}
