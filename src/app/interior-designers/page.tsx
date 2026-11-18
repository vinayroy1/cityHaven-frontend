import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { DirectoryClient } from "./DirectoryClient";
import { fetchInteriorDirectory } from "./lib/server-data";
import { breadcrumbJsonLd } from "./lib/breadcrumbs";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";
import { listingPath } from "@/lib/seo/countryPath";
import { permanentRedirect } from "next/navigation";


type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function cityParam(raw: string | string[] | undefined): string | null {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!v || v.length > 60 || !/^[\p{L} .'-]+$/u.test(v)) return null;
  return v.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata(): Promise<Metadata> {
  const where = "India";
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
  const sp = await searchParams;
  // Old ?city= / ?locality= links move to the path URL (/interior-designers/mumbai/andheri).
  const legacyCity = cityParam(sp.city);
  if (legacyCity) permanentRedirect(listingPath("/interior-designers", legacyCity, cityParam(sp.locality)));
  // No city = every designer in India; the client loads another site country's own list.
  const city = "";
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
      />
    </>
  );
}
