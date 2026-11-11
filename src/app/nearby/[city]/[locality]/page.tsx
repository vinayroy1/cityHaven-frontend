import type { Metadata } from "next";
import { CityView, cityViewMetadata } from "../../_views/CityView";
import { LocalityView, localityViewMetadata } from "../../_views/LocalityView";
import { isCountryPrefix } from "../../_views/prefix";

export const revalidate = 86400;

/** India: /nearby/{city}/{locality}. Other countries: /nearby/{prefix}/{city} (their city page). */
type Props = { params: Promise<{ city: string; locality: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, locality } = await params;
  const [a, b] = [decodeURIComponent(city), decodeURIComponent(locality)];
  return isCountryPrefix(a) ? cityViewMetadata(`${a.toLowerCase()}/${b}`) : localityViewMetadata(a, b);
}

export default async function Page({ params }: Props) {
  const { city, locality } = await params;
  const [a, b] = [decodeURIComponent(city), decodeURIComponent(locality)];
  return isCountryPrefix(a) ? <CityView cityKey={`${a.toLowerCase()}/${b}`} /> : <LocalityView ck={a} lk={b} />;
}
