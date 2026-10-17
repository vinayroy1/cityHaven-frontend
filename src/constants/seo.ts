export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://awasio.com";

export const seoDefaults = {
  title: "Awasio - Find homes & commercial spaces",
  description: "Search, list, and discover verified properties across top cities with Awasio.",
};

export const buildCanonical = (path: string = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const SEO_SEARCH_INTENTS = [
  "rent",
  "buy",
  "flatmate",
  "pg",
  "commercial",
  "plot",
] as const;

export type SeoSearchIntent = (typeof SEO_SEARCH_INTENTS)[number];

export const SEO_CITIES = [
  "bengaluru",
  "delhi",
  "gurugram",
  "noida",
  "mumbai",
  "pune",
  "hyderabad",
] as const;

export type SeoCity = (typeof SEO_CITIES)[number];

export const SEO_TOP_LOCALITIES: Record<SeoCity, string[]> = {
  bengaluru: [
    "koramangala",
    "hsr-layout",
    "indiranagar",
    "whitefield",
    "bellandur",
    "electronic-city",
    "marathahalli",
    "jayanagar",
    "sarjapur-road",
  ],
  gurugram: [
    "dlf-phase-5",
    "golf-course-road",
    "sohna-road",
    "dlf-phase-1",
    "sector-56",
    "cyber-city",
  ],
  delhi: [
    "dwarka",
    "saket",
    "south-delhi",
    "rohini",
    "greater-kailash",
    "connaught-place",
    "janakpuri",
    "vasant-kunj",
  ],
  noida: [
    "sector-62",
    "sector-18",
    "noida-extension",
    "sector-137",
    "sector-76",
  ],
  mumbai: [
    "bandra-west",
    "andheri-west",
    "powai",
    "worli",
    "juhu",
    "thane-west",
  ],
  pune: [
    "hinjewadi",
    "baner",
    "wakad",
    "viman-nagar",
    "kothrud",
  ],
  hyderabad: [
    "hitech-city",
    "gachibowli",
    "kondapur",
    "madhapur",
    "jubilee-hills",
  ],
};

/**
 * Returns an array of canonical absolute URLs for all core static,
 * intent, city-level, and locality-level landing pages.
 */
export function getAllTopSeoUrls(): string[] {
  const urls: string[] = [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/agents`,
    `${SITE_URL}/new-projects`,
    `${SITE_URL}/price-trends`,
    `${SITE_URL}/pricing`,
    `${SITE_URL}/policies`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
  ];

  // Intent roots (e.g. /rent, /buy, /flatmate, /pg)
  for (const intent of SEO_SEARCH_INTENTS) {
    urls.push(`${SITE_URL}/${intent}`);
  }

  // City-level pages (e.g. /rent/bengaluru, /flatmate/bengaluru)
  for (const intent of SEO_SEARCH_INTENTS) {
    for (const city of SEO_CITIES) {
      urls.push(`${SITE_URL}/${intent}/${city}`);
    }
  }

  // Locality-level pages for high-intent search flows (rent, flatmate, pg, buy)
  const highIntentCategories: SeoSearchIntent[] = ["rent", "flatmate", "pg", "buy"];
  for (const intent of highIntentCategories) {
    for (const [city, localities] of Object.entries(SEO_TOP_LOCALITIES)) {
      for (const locality of localities) {
        urls.push(`${SITE_URL}/${intent}/${city}/${locality}`);
      }
    }
  }

  return Array.from(new Set(urls));
}

