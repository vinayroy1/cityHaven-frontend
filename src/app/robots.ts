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
          "/dashboard/",
          "/admin/",
          "/api/",
          "/auth/",
          "/login",
          "/propertyListing",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
