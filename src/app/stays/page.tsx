import type { Metadata } from "next";
import { StaysDirectory } from "./StaysDirectory";

type SearchParams = Promise<{ city?: string | string[]; locality?: string | string[] }>;
const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 80) || "";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const p = await searchParams;
  const where = [one(p.locality), one(p.city)].filter(Boolean).join(", ");
  return {
    title: where
      ? `Hotels, guest houses & dharamshalas in ${where} — nightly prices | Awasio`
      : "Hotels, Guest Houses, Lodges & Dharamshalas — Compare nightly prices | Awasio",
    description:
      "Find hotels, guest houses, homestays, hostels and dharamshalas. Compare room types and per-night prices, call the owner or book on their site.",
    alternates: { canonical: "/stays" },
  };
}

export default async function StaysPage({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const city = one(p.city);
  return <StaysDirectory key={`${city}|${one(p.locality)}`} initialCity={city} initialLocality={city ? one(p.locality) : ""} />;
}
