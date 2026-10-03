import type { MetroCluster } from "@/config/regionalClusters";
import { getClusterCities } from "@/config/regionalClusters";
import type { IntentKey } from "@/components/search/searchQuery";

export interface IntentMatch {
  bedrooms?: number;
  subType?: string;
  isBhkQuery: boolean;
  isSubTypeQuery: boolean;
  isPgQuery: boolean;
  isCommercialQuery: boolean;
  isPlotQuery: boolean;
  rawMatched: string;
}

export interface IntentSuggestion {
  type: "intent";
  id: string;
  title: string;
  meta?: string;
  badge?: string;
  params: {
    cityName: string;
    intent: IntentKey;
    transaction?: "SELL" | "RENT";
    bedrooms?: number;
    subType?: string;
    q?: string;
  };
}

const BHK_REGEX = /\b([1-5])\s*(?:bhk|bed|bedroom|b\.h\.k)\b/i;
const RK_REGEX = /\b(1\s*rk|studio)\b/i;

const PG_REGEX = /\b(pg|co-?living|hostels?|rooms?|boys\s*pg|girls\s*pg|paying\s*guest)\b/i;
const COMMERCIAL_REGEX = /\b(offices?|office\s*space|coworking|it\s*parks?|shops?|retail|showrooms?|commercial|warehouses?)\b/i;
const PLOT_REGEX = /\b(plots?|lands?|residential\s*plots?|agricultural\s*lands?|farmhouse)\b/i;

const SUBTYPE_PATTERNS: { regex: RegExp; key: string; label: string; intent?: IntentKey }[] = [
  { regex: /\b(apartments?|flats?)\b/i, key: "apartment", label: "Apartments" },
  { regex: /\b(villas?)\b/i, key: "villa", label: "Villas" },
  { regex: /\b(houses?|independent\s*house)\b/i, key: "house", label: "Independent House" },
  { regex: /\b(builder\s*floors?|independent\s*floors?|floors?)\b/i, key: "builder-floor", label: "Builder Floor" },
  { regex: /\b(penthouses?)\b/i, key: "penthouse", label: "Penthouse" },
  { regex: PLOT_REGEX, key: "plot", label: "Plots / Land", intent: "PLOT" },
  { regex: /\b(offices?|office\s*space|coworking)\b/i, key: "office", label: "Office Space", intent: "COMMERCIAL" },
  { regex: /\b(shops?|showrooms?|retail)\b/i, key: "shop", label: "Shops & Showrooms", intent: "COMMERCIAL" },
  { regex: PG_REGEX, key: "pg", label: "PG / Co-living", intent: "PG" },
];

/**
 * Parses user input to identify real estate attributes (BHK count, property subtypes, category intents).
 */
export function parseQueryIntent(raw: string, activeIntent?: IntentKey): IntentMatch | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  let bedrooms: number | undefined;
  let isBhkQuery = false;
  let rawMatched = "";

  const bhkMatch = trimmed.match(BHK_REGEX);
  if (bhkMatch) {
    bedrooms = parseInt(bhkMatch[1], 10);
    isBhkQuery = true;
    rawMatched = bhkMatch[0];
  } else if (RK_REGEX.test(trimmed)) {
    bedrooms = 1;
    isBhkQuery = true;
    rawMatched = trimmed.match(RK_REGEX)?.[0] || "1 RK";
  }

  const isPgQuery = PG_REGEX.test(trimmed);
  const isCommercialQuery = COMMERCIAL_REGEX.test(trimmed);
  const isPlotQuery = PLOT_REGEX.test(trimmed);

  let subType: string | undefined;
  let isSubTypeQuery = false;

  for (const pattern of SUBTYPE_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      subType = pattern.key;
      isSubTypeQuery = true;
      rawMatched = rawMatched ? `${rawMatched} ${pattern.label}` : pattern.label;
      break;
    }
  }

  if (!isBhkQuery && !isSubTypeQuery && !isPgQuery && !isCommercialQuery && !isPlotQuery) {
    return null;
  }

  return {
    bedrooms,
    subType,
    isBhkQuery,
    isSubTypeQuery,
    isPgQuery,
    isCommercialQuery,
    isPlotQuery,
    rawMatched,
  };
}

/**
 * Generates 99acres-style dynamic template suggestions based on the detected intent,
 * user's active search tab (Buy/Rent/PG/Commercial/Plot), and the regional city cluster.
 */
export function generateIntentSuggestions(
  query: string,
  activeIntent: IntentKey,
  cluster: MetroCluster,
  maxResults: number = 6
): IntentSuggestion[] {
  const intentMatch = parseQueryIntent(query, activeIntent);
  if (!intentMatch) return [];

  const cities = getClusterCities(cluster, 5);
  const primaryCity = cities[0] || cluster.primaryCity;
  const neighborCities = cities.slice(1);
  const suggestions: IntentSuggestion[] = [];

  const bhkLabel = intentMatch.bedrooms ? `${intentMatch.bedrooms} BHK` : "";

  // =========================================================================
  // 1. PG / Co-living Category Suggestions
  // =========================================================================
  if (activeIntent === "PG" || (intentMatch.isPgQuery && !intentMatch.isCommercialQuery && !intentMatch.isPlotQuery)) {
    suggestions.push({
      type: "intent",
      id: `pg-all-${primaryCity}`,
      title: `PG & Co-living in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PG", subType: "pg" },
    });
    suggestions.push({
      type: "intent",
      id: `pg-room-${primaryCity}`,
      title: `Room for rent in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PG", subType: "pg" },
    });
    suggestions.push({
      type: "intent",
      id: `pg-single-${primaryCity}`,
      title: `Single Room PG in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PG", subType: "pg" },
    });
    suggestions.push({
      type: "intent",
      id: `pg-boys-${primaryCity}`,
      title: `Boys PG in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PG", subType: "pg" },
    });
    suggestions.push({
      type: "intent",
      id: `pg-girls-${primaryCity}`,
      title: `Girls PG in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PG", subType: "pg" },
    });

    for (const nCity of neighborCities) {
      if (suggestions.length >= maxResults) break;
      suggestions.push({
        type: "intent",
        id: `pg-${nCity}`,
        title: `PG for rent in ${nCity}`,
        params: { cityName: nCity, intent: "PG", subType: "pg" },
      });
    }

    return suggestions.slice(0, maxResults);
  }

  // =========================================================================
  // 2. Commercial Category Suggestions
  // =========================================================================
  if (activeIntent === "COMMERCIAL" || intentMatch.isCommercialQuery) {
    const isShopQuery = /\b(shops?|retail|showrooms?)\b/i.test(query);

    if (isShopQuery) {
      suggestions.push({
        type: "intent",
        id: `com-shop-${primaryCity}`,
        title: `Commercial Shops in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "COMMERCIAL", transaction: "SELL", subType: "shop" },
      });
      suggestions.push({
        type: "intent",
        id: `com-showroom-${primaryCity}`,
        title: `Showrooms for rent in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "COMMERCIAL", transaction: "RENT", subType: "shop" },
      });
    } else {
      suggestions.push({
        type: "intent",
        id: `com-office-rent-${primaryCity}`,
        title: `Commercial Office Space for rent in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "COMMERCIAL", transaction: "RENT", subType: "office" },
      });
      suggestions.push({
        type: "intent",
        id: `com-office-ready-${primaryCity}`,
        title: `Ready-to-move Office in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "COMMERCIAL", transaction: "SELL", subType: "office" },
      });
      suggestions.push({
        type: "intent",
        id: `com-shop-${primaryCity}`,
        title: `Commercial Shops for sale in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "COMMERCIAL", transaction: "SELL", subType: "shop" },
      });
    }

    for (const nCity of neighborCities) {
      if (suggestions.length >= maxResults) break;
      suggestions.push({
        type: "intent",
        id: `com-prop-${nCity}`,
        title: `Commercial Properties in ${nCity}`,
        params: { cityName: nCity, intent: "COMMERCIAL" },
      });
    }

    return suggestions.slice(0, maxResults);
  }

  // =========================================================================
  // 3. Plot / Land Category Suggestions
  // =========================================================================
  if (activeIntent === "PLOT" || intentMatch.isPlotQuery) {
    suggestions.push({
      type: "intent",
      id: `plot-res-${primaryCity}`,
      title: `Residential Plots in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PLOT", subType: "plot" },
    });
    suggestions.push({
      type: "intent",
      id: `plot-gated-${primaryCity}`,
      title: `Gated Community Plots in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PLOT", subType: "plot" },
    });
    suggestions.push({
      type: "intent",
      id: `plot-sale-${primaryCity}`,
      title: `Plots for sale in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PLOT", subType: "plot" },
    });
    suggestions.push({
      type: "intent",
      id: `plot-com-${primaryCity}`,
      title: `Commercial Land in ${primaryCity}`,
      params: { cityName: primaryCity, intent: "PLOT", subType: "plot" },
    });

    for (const nCity of neighborCities) {
      if (suggestions.length >= maxResults) break;
      suggestions.push({
        type: "intent",
        id: `plot-${nCity}`,
        title: `Residential Plots in ${nCity}`,
        params: { cityName: nCity, intent: "PLOT", subType: "plot" },
      });
    }

    return suggestions.slice(0, maxResults);
  }

  // =========================================================================
  // 4. Residential (Rent / Buy) BHK & Subtype Suggestions
  // =========================================================================
  const isRent = activeIntent === "RENT";

  if (intentMatch.isBhkQuery && intentMatch.bedrooms) {
    const bhk = intentMatch.bedrooms;

    if (isRent) {
      // 99acres RENT Pattern:
      suggestions.push({
        type: "intent",
        id: `rent-prop-${primaryCity}`,
        title: `${bhkLabel} Property for rent in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "RENT", bedrooms: bhk },
      });
      suggestions.push({
        type: "intent",
        id: `rent-apt-${primaryCity}`,
        title: `${bhkLabel} Apartments for rent in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "RENT", bedrooms: bhk, subType: "apartment" },
      });
      suggestions.push({
        type: "intent",
        id: `rent-house-${primaryCity}`,
        title: `${bhkLabel} House for rent in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "RENT", bedrooms: bhk, subType: "house" },
      });
      suggestions.push({
        type: "intent",
        id: `rent-villa-${primaryCity}`,
        title: `${bhkLabel} Villas for rent in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "RENT", bedrooms: bhk, subType: "villa" },
      });

      for (const nCity of neighborCities) {
        if (suggestions.length >= maxResults) break;
        suggestions.push({
          type: "intent",
          id: `rent-apt-${nCity}`,
          title: `${bhkLabel} Apartments for rent in ${nCity}`,
          params: { cityName: nCity, intent: "RENT", bedrooms: bhk, subType: "apartment" },
        });
      }
    } else {
      // 99acres BUY Pattern:
      suggestions.push({
        type: "intent",
        id: `buy-proj-${primaryCity}`,
        title: `${bhkLabel} Projects in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "BUY", bedrooms: bhk },
      });
      suggestions.push({
        type: "intent",
        id: `buy-apt-${primaryCity}`,
        title: `${bhkLabel} Apartments for sale in ${primaryCity}`,
        params: { cityName: primaryCity, intent: "BUY", bedrooms: bhk, subType: "apartment" },
      });

      for (const nCity of neighborCities) {
        if (suggestions.length >= maxResults) break;
        suggestions.push({
          type: "intent",
          id: `buy-proj-${nCity}`,
          title: `${bhkLabel} Projects in ${nCity}`,
          params: { cityName: nCity, intent: "BUY", bedrooms: bhk },
        });
      }
    }
  } else if (intentMatch.isSubTypeQuery && intentMatch.subType) {
    const subTypeConfig = SUBTYPE_PATTERNS.find((p) => p.key === intentMatch.subType);
    const subLabel = subTypeConfig?.label || "Properties";
    const actionLabel = isRent ? "for rent" : "for sale";

    suggestions.push({
      type: "intent",
      id: `subtype-${primaryCity}`,
      title: `${subLabel} ${actionLabel} in ${primaryCity}`,
      params: { cityName: primaryCity, intent: activeIntent, subType: intentMatch.subType },
    });

    for (const nCity of neighborCities) {
      if (suggestions.length >= maxResults) break;
      suggestions.push({
        type: "intent",
        id: `subtype-${nCity}`,
        title: `${subLabel} ${actionLabel} in ${nCity}`,
        params: { cityName: nCity, intent: activeIntent, subType: intentMatch.subType },
      });
    }
  }

  return suggestions.slice(0, maxResults);
}
