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

// =========================================================================
// 4. COMPREHENSIVE NATURAL LANGUAGE SLOT-FILLER & RESOLVER
// Handles arbitrary good/bad/colloquial real estate search strings.
// =========================================================================

export interface ExtractedQuerySlots {
  intent?: IntentKey;
  transaction?: "SELL" | "RENT";
  bedroomsMin?: number;
  subType?: string;
  priceMax?: number;
  priceMin?: number;
  postedAs?: "OWNER" | "AGENT" | "BUILDER";
  remainingLocationQuery: string;
  hasExtractedFilters: boolean;
}

/**
 * Parses numeric and unit expressions like "20k", "15000", "50 lacs", "1.5 cr".
 */
export function parseBudgetExpression(numStr: string, unitStr?: string): number | undefined {
  const val = parseFloat(numStr);
  if (isNaN(val) || val <= 0) return undefined;

  const u = (unitStr || "").toLowerCase().trim();
  if (u.startsWith("k") || u.startsWith("thou")) return Math.round(val * 1_000);
  if (u.startsWith("l")) return Math.round(val * 100_000);
  if (u.startsWith("cr")) return Math.round(val * 10_000_000);

  // If no unit provided: If value < 500, assume in Lakhs (e.g. "under 50" -> 50 Lakhs)
  if (val < 500) return Math.round(val * 100_000);
  return Math.round(val);
}

/**
 * Robust slot-filler that normalizes noisy colloquial user inputs:
 * Extracts BHK, Intent (Rent/Buy/PG), Budget caps, Owner/Brokerage, and leaves clean location tokens.
 */
export function extractSlotsFromQuery(rawQuery: string): ExtractedQuerySlots {
  let text = rawQuery.toLowerCase().trim();
  if (!text) {
    return { remainingLocationQuery: "", hasExtractedFilters: false };
  }

  const result: Partial<ExtractedQuerySlots> = {};
  let filterCount = 0;

  // 1. Brokerage / Direct Owner
  if (/\b(no\s*brokerage|without\s*brokerage|zero\s*brokerage|direct\s*owner|by\s*owner|owner\s*only)\b/i.test(text)) {
    result.postedAs = "OWNER";
    filterCount++;
    text = text
      .replace(/\b(no|without|zero)\s*brokerage\b/gi, " ")
      .replace(/\b(direct|by)?\s*owner\s*(only)?\b/gi, " ");
  }

  // 2. Intent & Transaction
  if (/\b(for\s*rent|on\s*rent|to\s*rent|rent|rental|lease|to\s*let)\b/i.test(text)) {
    result.intent = "RENT";
    result.transaction = "RENT";
    filterCount++;
    text = text.replace(/\b(for\s*rent|on\s*rent|to\s*rent|rent|rental|lease|to\s*let)\b/gi, " ");
  } else if (/\b(for\s*sale|on\s*sale|buy|purchase|resale|invest)\b/i.test(text)) {
    result.intent = "BUY";
    result.transaction = "SELL";
    filterCount++;
    text = text.replace(/\b(for\s*sale|on\s*sale|buy|purchase|resale|invest)\b/gi, " ");
  } else if (/\b(pg|co-?living|hostel|paying\s*guest)\b/i.test(text)) {
    result.intent = "PG";
    filterCount++;
    text = text.replace(/\b(pg|co-?living|hostel|paying\s*guest)\b/gi, " ");
  }

  // 3. Bedrooms / BHK / RK / Studio
  // Matches "2bhk", "2 bhk", "3 bed", "4 bedroom", "1rk", "1 room set", "studio"
  const bhkMatch = text.match(/\b([1-6])\s*(?:bhk|bed|bedroom|br|b\.h\.k)\b/i);
  if (bhkMatch) {
    result.bedroomsMin = parseInt(bhkMatch[1], 10);
    filterCount++;
    text = text.replace(bhkMatch[0], " ");
  } else if (/\b(1\s*rk|studio|1\s*room\s*set)\b/i.test(text)) {
    result.bedroomsMin = 1;
    filterCount++;
    text = text.replace(/\b(1\s*rk|studio|1\s*room\s*set)\b/gi, " ");
  }

  // 4. Subtypes (Apartment / Flat / Villa / Plot / Penthouse / Office)
  if (/\b(flats?|apartments?)\b/i.test(text)) {
    result.subType = "apartment";
    filterCount++;
    text = text.replace(/\b(flats?|apartments?)\b/gi, " ");
  } else if (/\b(villas?|independent\s*house|bungalow|kothi)\b/i.test(text)) {
    result.subType = "villa";
    filterCount++;
    text = text.replace(/\b(villas?|independent\s*house|bungalow|kothi)\b/gi, " ");
  } else if (/\b(penthouses?)\b/i.test(text)) {
    result.subType = "penthouse";
    filterCount++;
    text = text.replace(/\b(penthouses?)\b/gi, " ");
  } else if (/\b(builder\s*floors?|floors?)\b/i.test(text)) {
    result.subType = "builder-floor";
    filterCount++;
    text = text.replace(/\b(builder\s*floors?|floors?)\b/gi, " ");
  } else if (/\b(plots?|lands?|farmhouse)\b/i.test(text)) {
    result.intent = "PLOT";
    result.subType = "plot";
    filterCount++;
    text = text.replace(/\b(plots?|lands?|farmhouse)\b/gi, " ");
  } else if (/\b(offices?|office\s*space|coworking)\b/i.test(text)) {
    result.intent = "COMMERCIAL";
    result.subType = "office";
    filterCount++;
    text = text.replace(/\b(offices?|office\s*space|coworking)\b/gi, " ");
  } else if (/\b(shops?|showrooms?|retail)\b/i.test(text)) {
    result.intent = "COMMERCIAL";
    result.subType = "shop";
    filterCount++;
    text = text.replace(/\b(shops?|showrooms?|retail)\b/gi, " ");
  }

  // 5. Budget Max Match (e.g. "under 20k", "below 1.5 cr", "under 50 lacs", "max 25000", "< 30000")
  const budgetMaxRegex = /(?:under|below|max|within|less\s*than|<)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|l|lac|lakh|cr|crore)?\b/i;
  const budgetMaxMatch = text.match(budgetMaxRegex);
  if (budgetMaxMatch) {
    const parsed = parseBudgetExpression(budgetMaxMatch[1], budgetMaxMatch[2]);
    if (parsed) {
      result.priceMax = parsed;
      filterCount++;
      text = text.replace(budgetMaxMatch[0], " ");
    }
  }

  // 6. Budget Min Match (e.g. "above 20k", "min 50 lacs", "> 1 cr")
  const budgetMinRegex = /(?:above|min|minimum|greater\s*than|>)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|l|lac|lakh|cr|crore)?\b/i;
  const budgetMinMatch = text.match(budgetMinRegex);
  if (budgetMinMatch) {
    const parsed = parseBudgetExpression(budgetMinMatch[1], budgetMinMatch[2]);
    if (parsed) {
      result.priceMin = parsed;
      filterCount++;
      text = text.replace(budgetMinMatch[0], " ");
    }
  }

  // 7. Remove connective prepositions & noise tokens ("in", "at", "near", "around", "urgent", "need", "looking for")
  const cleanedLocation = text
    .replace(/\b(in|at|near|around|for|need|looking\s*for|urgent|required|want)\b/gi, " ")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    ...result,
    remainingLocationQuery: cleanedLocation,
    hasExtractedFilters: filterCount > 0,
  };
}

/**
 * Converts a raw search query text + existing SearchState into a fully resolved SearchState with
 * extracted intents, BHKs, price boundaries, refine options, and resolved location chips.
 */
export async function resolveSearchQueryToState(
  rawQuery: string,
  currentState: import("@/components/search/searchQuery").SearchState
): Promise<import("@/components/search/searchQuery").SearchState> {
  const trimmed = rawQuery.trim();
  if (!trimmed) return currentState;

  const slots = extractSlotsFromQuery(trimmed);

  let nextIntent = slots.intent ?? currentState.intent;
  let nextTransaction = slots.transaction ?? currentState.transaction;
  let nextBedrooms = slots.bedroomsMin ?? currentState.bedroomsMin;
  let nextPriceMax = slots.priceMax ?? currentState.priceMax;
  let nextPriceMin = slots.priceMin ?? currentState.priceMin;

  const nextRefine = { ...currentState.refine };
  if (slots.subType) {
    nextRefine.subType = Array.from(new Set([...nextRefine.subType, slots.subType]));
  }
  if (slots.postedAs) {
    nextRefine.postedAs = Array.from(new Set([...nextRefine.postedAs, slots.postedAs]));
  }

  let nextLocalities = [...currentState.localities];
  let nextCity = currentState.cityName;

  // If we have a remaining geographic term (e.g. "chattarpur", "saket", "gurgaon")
  if (slots.remainingLocationQuery && slots.remainingLocationQuery.length >= 2) {
    try {
      const { fetchAwasioSuggestions } = await import("@/lib/awasioSuggestions");
      const resp = await fetchAwasioSuggestions(slots.remainingLocationQuery, {
        limit: 5,
        city: nextCity,
      });

      const topResult = resp.data?.[0];
      if (topResult) {
        if (topResult.type === "CITY" && topResult.location?.city) {
          nextCity = topResult.location.city;
        } else if (topResult.type === "LOCALITY" || topResult.type === "PROJECT") {
          const locName = topResult.title || topResult.location?.locality || slots.remainingLocationQuery;
          const locCity = topResult.location?.city || nextCity;
          if (!nextLocalities.some((l) => l.label.toLowerCase() === locName.toLowerCase())) {
            nextLocalities.push({
              label: locName,
              city: locCity,
              locality: locName,
            });
          }
          if (locCity && !nextCity) {
            nextCity = locCity;
          }
        }
      } else {
        // Fallback: If no server suggestion matched, treat remaining text as a locality chip or keyword
        const term = slots.remainingLocationQuery;
        if (!nextLocalities.some((l) => l.label.toLowerCase() === term.toLowerCase())) {
          nextLocalities.push({ label: term, city: nextCity || term });
        }
      }
    } catch (_) {
      // Offline / API error fallback: preserve as locality
      const term = slots.remainingLocationQuery;
      if (!nextLocalities.some((l) => l.label.toLowerCase() === term.toLowerCase())) {
        nextLocalities.push({ label: term, city: nextCity || term });
      }
    }
  }

  return {
    ...currentState,
    intent: nextIntent,
    transaction: nextTransaction,
    bedroomsMin: nextBedrooms,
    priceMax: nextPriceMax,
    priceMin: nextPriceMin,
    refine: nextRefine,
    localities: nextLocalities,
    cityName: nextCity,
    q: "", // clear raw query text since all entities have been resolved into state
  };
}


