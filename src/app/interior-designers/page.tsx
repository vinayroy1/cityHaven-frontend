import type { Metadata } from "next";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { DirectoryClient } from "./DirectoryClient";
import { fetchInteriorDirectory } from "./lib/server-data";
import { breadcrumbJsonLd } from "./lib/breadcrumbs";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";


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

// Old ?city= / ?locality= links are moved to the path URL by src/proxy.ts (a real 308), so this
// page doesn't read the query string and stays cacheable (ISR + Cloudflare).
export const revalidate = 60;

export default async function InteriorDesignersDirectoryPage() {
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
