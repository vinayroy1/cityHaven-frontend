/**
 * SEO for the locality guide: keyword-rich titles/descriptions built from real data, keyword
 * lists matching common Indian search phrasing, FAQ (rendered visibly AND as FAQPage schema),
 * and JSON-LD (BreadcrumbList, Place with geo, ItemList of nearby places).
 */
import type { Metadata } from "next";
import { SITE_URL } from "@/constants/seo";
import { CATEGORY_META, categoryOf, fmtKm, travel, type CategoryKey, type ExplorerItem } from "./nearbyCategories";

export type LocalitySeoInput = {
  name: string;
  city: string;
  slug: string;
  pincode?: string;
  coordinates?: { lat: number; lng: number };
  items: ExplorerItem[];
  indexable?: boolean;
};

export type Faq = { q: string; a: string };

function byCat(items: ExplorerItem[]) {
  const m = new Map<CategoryKey, ExplorerItem[]>();
  for (const it of [...items].sort((a, b) => a.distanceKm - b.distanceKm)) {
    const c = categoryOf(it);
    if (c) m.set(c, [...(m.get(c) ?? []), it]);
  }
  return m;
}

const names = (l: ExplorerItem[] | undefined, n: number) =>
  (l ?? []).slice(0, n).map((i) => `${i.name} (${fmtKm(i.distanceKm)})`).join(", ");

export function localityFaqs(p: LocalitySeoInput): Faq[] {
  const m = byCat(p.items);
  const place = `${p.name}, ${p.city}`;
  const faqs: Faq[] = [];
  const metro = m.get("metro")?.[0];
  const rail = m.get("rail")?.[0];
  if (metro) {
    faqs.push({
      q: `Which is the nearest metro station to ${p.name}?`,
      a: `${metro.name} is the nearest metro station to ${place}, about ${fmtKm(metro.distanceKm)} away (${travel(metro.distanceKm)}).${
        (m.get("metro")?.length ?? 0) > 1 ? ` Other nearby metro stations: ${names(m.get("metro")?.slice(1), 3)}.` : ""
      }`,
    });
  }
  if (rail) {
    faqs.push({
      q: `Which railway station is nearest to ${p.name}?`,
      a: `${rail.name} is the nearest railway station, around ${fmtKm(rail.distanceKm)} from ${p.name}.`,
    });
  }
  const hosp = m.get("hospital");
  if (hosp?.length) {
    faqs.push({
      q: `Which hospitals are near ${p.name}?`,
      a: `Hospitals near ${place} include ${names(hosp, 5)}. There are ${hosp.length} hospitals within 5 km.`,
    });
  }
  const sch = m.get("school");
  if (sch?.length) {
    faqs.push({
      q: `What are the best schools near ${p.name}?`,
      a: `Schools close to ${p.name} include ${names(sch, 5)} — ${sch.length} schools within 4 km.`,
    });
  }
  const col = m.get("college");
  if (col?.length) {
    faqs.push({ q: `Which colleges are near ${p.name}?`, a: `Colleges near ${place}: ${names(col, 4)}.` });
  }
  const mall = m.get("mall");
  if (mall?.length) {
    faqs.push({ q: `Which malls are near ${p.name}?`, a: `Nearby malls include ${names(mall, 4)}.` });
  }
  const air = m.get("airport")?.[0];
  if (air) {
    faqs.push({
      q: `How far is ${p.name} from the airport?`,
      a: `${air.name} is about ${fmtKm(air.distanceKm)} from ${p.name} — roughly ${travel(air.distanceKm)}.`,
    });
  }
  if (p.pincode) {
    faqs.push({ q: `What is the pincode of ${p.name}, ${p.city}?`, a: `The pincode of ${place} is ${p.pincode}.` });
  }
  faqs.push({
    q: `Is ${p.name} a good place to live?`,
    a: `${p.name} has ${p.items.filter((i) => i.distanceKm <= 2).length} key places (metro, hospitals, schools, malls) within 2 km${
      metro ? `, with ${metro.name} metro ${fmtKm(metro.distanceKm)} away` : ""
    }. Compare rents and homes for sale in ${p.name} on Awasio — direct from owners with zero brokerage.`,
  });
  return faqs;
}

export function localityMetadata(p: LocalitySeoInput): Metadata {
  const m = byCat(p.items);
  const metro = m.get("metro")?.[0];
  const hospN = m.get("hospital")?.length ?? 0;
  const schN = m.get("school")?.length ?? 0;
  const place = `${p.name}, ${p.city}`;

  const title = `${place}: Metro, Hospitals, Schools${p.pincode ? ` & Pincode ${p.pincode}` : ""}`;
  const counts = [
    hospN ? `${hospN} hospitals` : null,
    schN ? `${schN} schools` : null,
    m.get("mall")?.length ? `${m.get("mall")!.length} malls` : null,
  ].filter(Boolean);
  const description = [
    metro ? `Nearest metro to ${p.name}: ${metro.name} (${fmtKm(metro.distanceKm)}).` : null,
    counts.length ? `${counts.join(", ")} nearby.` : null,
    `Distances, travel time & directions for ${place}${p.pincode ? ` (${p.pincode})` : ""}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const keywords = [
    `${p.name} ${p.city}`,
    `nearest metro station to ${p.name}`,
    `metro near ${p.name}`,
    `hospitals near ${p.name}`,
    `schools near ${p.name}`,
    `colleges near ${p.name}`,
    `malls near ${p.name}`,
    `${p.name} to airport distance`,
    p.pincode ? `${p.name} pincode` : null,
    p.pincode ? `${p.pincode} pincode area` : null,
    `flats for rent in ${p.name}`,
    `PG in ${p.name}`,
    `${p.name} locality review`,
    `is ${p.name} a good place to live`,
  ].filter(Boolean) as string[];

  const url = `${SITE_URL}/nearby/${p.slug}`;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/nearby/${p.slug}` },
    robots: p.indexable ? { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } : { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      title: `What's near ${place}? Metro, hospitals, schools & more`,
      description,
      siteName: "Awasio",
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title: `What's near ${place}?`, description },
    other: p.coordinates
      ? {
          "geo.region": "IN",
          "geo.placename": place,
          "geo.position": `${p.coordinates.lat};${p.coordinates.lng}`,
          ICBM: `${p.coordinates.lat}, ${p.coordinates.lng}`,
        }
      : undefined,
  };
}

export function localityJsonLd(p: LocalitySeoInput, faqs: Faq[], cityHref?: string) {
  const url = `${SITE_URL}/nearby/${p.slug}`;
  const crumbs = [
    { name: "Locality guide", item: `${SITE_URL}/nearby` },
    ...(cityHref ? [{ name: p.city, item: `${SITE_URL}${cityHref}` }] : []),
    { name: p.name, item: url },
  ];
  const nearby = [...p.items].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 25);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Place",
      name: `${p.name}, ${p.city}`,
      url,
      address: { "@type": "PostalAddress", addressLocality: p.name, addressRegion: p.city, postalCode: p.pincode, addressCountry: "IN" },
      ...(p.coordinates ? { geo: { "@type": "GeoCoordinates", latitude: p.coordinates.lat, longitude: p.coordinates.lng } } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Places near ${p.name}, ${p.city}`,
      numberOfItems: nearby.length,
      itemListElement: nearby.map((it, i) => {
        const c = categoryOf(it);
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": c === "hospital" ? "Hospital" : c === "school" ? "School" : c === "college" ? "CollegeOrUniversity" : c === "mall" ? "ShoppingCenter" : c === "airport" ? "Airport" : c === "metro" ? "SubwayStation" : c === "rail" ? "TrainStation" : c === "bus" ? "BusStation" : "Place",
            name: it.name,
            description: c ? `${CATEGORY_META[c].label.replace(/s$/, "")}, ${fmtKm(it.distanceKm)} from ${p.name}` : undefined,
            ...(it.lat != null && it.lng != null ? { geo: { "@type": "GeoCoordinates", latitude: it.lat, longitude: it.lng } } : {}),
          },
        };
      }),
    },
    ...(faqs.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
  ];
}

/** City guide page: CollectionPage + breadcrumb + ItemList of localities. */
export function cityJsonLd(city: string, cityHref: string, localities: Array<{ name: string; slug: string }>) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Locality guide", item: `${SITE_URL}/nearby` },
        { "@type": "ListItem", position: 2, name: city, item: `${SITE_URL}${cityHref}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${city} locality guide`,
      url: `${SITE_URL}${cityHref}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: localities.length,
        itemListElement: localities.slice(0, 100).map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: l.name,
          url: `${SITE_URL}/nearby/${l.slug}`,
        })),
      },
    },
  ];
}
