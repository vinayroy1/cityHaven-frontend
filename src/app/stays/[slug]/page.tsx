import type { Metadata } from "next";
import StayDetail from "./StayDetail";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical } from "@/constants/seo";
import type { Stay } from "@/features/stays/types";

const TYPE_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  GUEST_HOUSE: "Guest house",
  HOMESTAY: "Homestay",
  HOSTEL: "Hostel",
  DHARAMSHALA: "Dharamshala",
  LODGE: "Lodge",
};

async function getStay(slug: string): Promise<Stay | null> {
  try {
    const res = await fetch(toInternalApiUrl(`/v1/stays/${encodeURIComponent(slug)}`), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as Stay;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const stay = await getStay(slug);
  const canonical = buildCanonical(`/stays/${slug}`);
  if (!stay?.name) {
    return { title: { absolute: "Stay details: rooms & nightly prices | Awasio" }, alternates: { canonical } };
  }

  const kind = TYPE_LABEL[String(stay.type)] ?? "Stay";
  const where = [stay.locality, stay.cityName].filter(Boolean).join(", ");
  const title = `${stay.name}${where ? `, ${where}` : ""}: ${kind}, rooms & prices`;
  const about = (stay.description || "").replace(/\s+/g, " ").trim();
  const lead = `${kind} in ${where || "India"}. Compare room types and per-night prices, then call the owner or book directly.`;
  const raw = about ? `${lead} ${about}` : lead;
  const description = raw.length > 158 ? `${raw.slice(0, 155).replace(/\s+\S*$/, "")}…` : raw;
  const image = stay.photos?.[0];

  return {
    title: { absolute: `${title} | Awasio` },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", siteName: "Awasio", ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default function StayPage() {
  return <StayDetail />;
}
