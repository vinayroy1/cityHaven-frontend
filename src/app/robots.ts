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
          "/about",
          "/contact",
          "/pricing",
          "/policies",
          "/privacy",
          "/terms",
          "/community",
        ],
        disallow: [
          "/api/",
          "/propertyListing",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
