import { COUNTRY_PREFIXES } from "@/app/nearby/_views/prefix";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/propertySearch",
          "/search/",
          "/buy",
          "/rent",
          "/pg",
          "/flatmate",
          "/commercial",
          "/plot",
          "/properties/",
          "/agents",
          "/agents/",
          "/new-projects",
          "/price-trends",
          "/home-loans",
          "/emi-calculator",
          "/rental-agreement",
          "/area-converter",
          "/nearby",
          "/about",
          "/contact",
          "/pricing",
          "/policies",
          "/privacy",
          "/terms",
          "/community",
          "/propertyListing",
          "/post-project",
          "/flatmates/post",
        ],
        disallow: [
          "/api/",
          "/login",
          "/signup",
          "/dashboard/",
          "/admin/",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/nearby/sitemap.xml`,
      // Other countries: one file each, kept apart from the Indian guide sitemap.
      ...COUNTRY_PREFIXES.map((p) => `${SITE_URL}/nearby/sitemaps/${p}.xml`),
    ],
  };
}
