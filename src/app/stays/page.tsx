import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { StaysDirectory } from "./StaysDirectory";
import { listingPath } from "@/lib/seo/countryPath";
import { getInitialPage, staysMetadata } from "./serverData";

type SearchParams = Promise<{ city?: string | string[]; locality?: string | string[] }>;
const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 80) || "";

export async function generateMetadata(): Promise<Metadata> {
  return staysMetadata("", "/stays");
}

export default async function StaysPage({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  // Old ?city= / ?locality= links move to the path URL (/stays/varanasi/dashashwamedh).
  const city = one(p.city);
  if (city) permanentRedirect(listingPath("/stays", city, one(p.locality) || null));
  const initialPage = await getInitialPage("", "");
  return <StaysDirectory initialPage={initialPage} />;
}
