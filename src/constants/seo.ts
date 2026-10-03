export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://awasio.com";

export const seoDefaults = {
  title: "Awasio - Find homes & commercial spaces",
  description: "Search, list, and discover verified properties across top cities with Awasio.",
};

export const buildCanonical = (path: string = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};
