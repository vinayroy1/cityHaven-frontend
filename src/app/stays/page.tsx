import type { Metadata } from "next";
import { StaysDirectory } from "./StaysDirectory";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import type { StaySearchParams } from "@/features/stays/types";
import type { StaySearchPage } from "@/features/stays/api";

/** First page for the default filters, so stay links are in the server HTML (India portal = default country). */
async function getInitialPage(city: string, locality: string) {
  // Same keys/order as the client's params object so the hydrated query reuses this page.
  const params: StaySearchParams = {
    countryCode: "IN",
    city: city || undefined,
    locality: locality || undefined,
    type: undefined,
    priceMax: undefined,
    ac: false,
    coupleFriendly: false,
    familyFriendly: false,
    free: false,
    sort: "recommended",
  };
  try {
    const qs = new URLSearchParams({ countryCode: "IN", sort: "recommended", page: "1" });
    if (city) qs.set("city", city);
    if (locality) qs.set("locality", locality);
    const res = await fetch(toInternalApiUrl(`/v1/stays?${qs}`), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const page = (json?.data ?? json) as StaySearchPage;
    return Array.isArray(page?.items) ? { params, page } : null;
  } catch {
    return null;
  }
}

type SearchParams = Promise<{ city?: string | string[]; locality?: string | string[] }>;
const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 80) || "";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const p = await searchParams;
  const where = [one(p.locality), one(p.city)].filter(Boolean).join(", ");
  return {
    title: { absolute: where
      ? `Hotels, guest houses & dharamshalas in ${where} — nightly prices | Awasio`
      : "Hotels, Guest Houses, Lodges & Dharamshalas — Compare nightly prices | Awasio" },
    description:
      "Find hotels, guest houses, homestays, hostels and dharamshalas. Compare room types and per-night prices, call the owner or book on their site.",
    alternates: { canonical: "/stays" },
  };
}

export default async function StaysPage({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const city = one(p.city);
  const locality = city ? one(p.locality) : "";
  const initialPage = await getInitialPage(city, locality);
  return <StaysDirectory key={`${city}|${locality}`} initialCity={city} initialLocality={locality} initialPage={initialPage} />;
}
