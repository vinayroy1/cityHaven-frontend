import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { DirectoryClient } from "./DirectoryClient";
import { fetchInteriorDirectory } from "./lib/server-data";
import { breadcrumbJsonLd } from "./lib/breadcrumbs";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";


type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function cityParam(raw: string | string[] | undefined): string | null {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!v || v.length > 60 || !/^[\p{L} .'-]+$/u.test(v)) return null;
  return v.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const city = cityParam((await searchParams).city);
  const where = city ?? "India";
  const title = `Best Interior Designers & Studios in ${where}`;
  const description = `Compare verified interior designers, architects and modular studios in ${where}. See real portfolios, material brands, per sq.ft. pricing and warranties, then get free quotes on Awasio.`;
  const url = buildCanonical("/interior-designers");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Awasio", images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InteriorDesignersDirectoryPage({ searchParams }: { searchParams: SearchParams }) {
  const urlCity = cityParam((await searchParams).city);
  // No city in the URL = every designer in India (no more Mumbai default).
  const city = urlCity ?? "";
  const initialData = await fetchInteriorDirectory(city);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Interior designers", path: "/interior-designers" },
    ]),
    ...(initialData?.items?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Interior designers in ${city || "India"}`,
            itemListElement: initialData.items.slice(0, 20).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.displayName || p.businessName || p.fullName || "Interior designer",
              url: buildCanonical(interiorProfilePath({ primaryCity: p.primaryCity || city, slug: p.slug })),
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <DirectoryClient
        initialCity={city}
        initialState=""
        initialData={initialData}
        cityFromUrl={!!urlCity}
      />
    </>
  );
}
