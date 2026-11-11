import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { CityView, cityViewMetadata } from "../_views/CityView";
import { isCountryPrefix } from "../_views/prefix";

export const revalidate = 86400;

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  return cityViewMetadata(decodeURIComponent(city));
}

export default async function GuideCityPage({ params }: Props) {
  const { city } = await params;
  // "/nearby/ae" alone has no page yet: the guide home lists every country.
  if (isCountryPrefix(city)) permanentRedirect("/nearby");
  return <CityView cityKey={decodeURIComponent(city)} />;
}
