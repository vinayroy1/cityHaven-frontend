export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cityhaven.com";

export const seoDefaults = {
  title: "CityHaven - Find homes & commercial spaces",
  description: "Search, list, and discover verified properties across top cities with CityHaven.",
};

export const buildCanonical = (path: string = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};
