/**
 * Formats high-converting WhatsApp Listing Share Cards.
 * Used when tenants, owners, or flatmates share listings into WhatsApp groups and chats.
 *
 * WhatsApp formatting conventions:
 * - *bold text*
 * - Visual emoji bullets (🏠, 🚫, 🚇, 🛒, 🔗)
 * - Concise, information-dense lines that fit neatly inside mobile chat bubbles
 */

export type PropertyWhatsAppCardInput = {
  title?: string | null;
  bedrooms?: number | null;
  propertySubType?: string | null;
  propertyType?: string | null;
  listingType?: string | null;
  locality?: string | null;
  cityName?: string | null;
  price?: string | number | null;
  currencyCode?: string | null;
  postedAs?: string | null;
  nearbyLandmarks?: any;
  url: string;
};

export type FlatmateWhatsAppCardInput = {
  title?: string | null;
  mode?: "HAVE_ROOM" | "NEED_ROOM" | "BUDDY_UP" | string | null;
  roomType?: string | null;
  bhk?: number | string | null;
  locality?: string | null;
  cityName?: string | null;
  rent?: string | number | null;
  deposit?: string | number | null;
  habitsSummary?: string | null;
  genderPreference?: string | null;
  nearbyLandmarks?: any;
  url: string;
};

/**
 * Parses nearbyLandmarks JSON into a compact connectivity string.
 * e.g. "🚇 Metro: 650m | 🛒 Market: 200m"
 */
function extractConnectivitySnippet(nearbyLandmarks: any): string | null {
  if (!nearbyLandmarks) return null;

  try {
    const data = typeof nearbyLandmarks === "string" ? JSON.parse(nearbyLandmarks) : nearbyLandmarks;
    const parts: string[] = [];

    const formatDist = (d: number) => (d < 1 ? `${Math.round(d * 1000)}m` : `${Number(d.toFixed(1))}km`);

    // 1. Transit (Metro / Bus / Train)
    const transit = data?.transit?.[0];
    if (transit?.distanceKm != null) {
      const isMetro = /metro/i.test(transit.name || "");
      parts.push(`${isMetro ? "🚇 Metro" : "🚆 Transit"}: ${formatDist(transit.distanceKm)}`);
    }

    // 2. Lifestyle (Market / Mall) or Healthcare / Education
    const lifestyle = data?.lifestyle?.[0];
    const healthcare = data?.healthcare?.[0];

    if (lifestyle?.distanceKm != null) {
      parts.push(`🛒 Market: ${formatDist(lifestyle.distanceKm)}`);
    } else if (healthcare?.distanceKm != null) {
      parts.push(`🏥 Hospital: ${formatDist(healthcare.distanceKm)}`);
    }

    return parts.length > 0 ? parts.join(" | ") : null;
  } catch {
    return null;
  }
}

/**
 * Formats a clean currency price string if raw number is passed
 */
function formatSharePrice(price?: string | number | null): string {
  if (price == null || price === "") return "Price on Request";
  if (typeof price === "string" && (price.startsWith("₹") || price.toLowerCase().includes("lakh") || price.toLowerCase().includes("cr"))) {
    return price;
  }
  const num = Number(price);
  if (isNaN(num)) return String(price);
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * 🏠 WhatsApp Listing Share Card for Properties (Rent, Resale, PG, Commercial)
 */
export function buildPropertyWhatsAppCard(input: PropertyWhatsAppCardInput): {
  headline: string;
  badge: string;
  connectivity: string | null;
  callToAction: string;
  fullMessage: string;
  whatsappUrl: string;
} {
  const isPg = input.listingType?.toUpperCase() === "PG" || input.propertyType?.toLowerCase().includes("pg");
  const bedroomsStr = input.bedrooms ? `${input.bedrooms} BHK` : null;
  const typeStr = input.propertySubType || input.propertyType || "Property";
  const mainType = isPg ? "PG / Co-Living" : bedroomsStr ? `${bedroomsStr} ${typeStr}` : typeStr;
  const location = input.locality || input.cityName || "India";
  const formattedPrice = formatSharePrice(input.price);

  // Line 1: Main hook with key search triggers (Property Type, Locality, Rent/Price)
  const headline = `🏠 *${mainType} in ${location}* · *${formattedPrice}*`;

  // Line 2: Trust badge (Direct Owner / Zero Brokerage)
  const isOwner = (input.postedAs || "").toUpperCase() === "OWNER";
  const badge = isOwner
    ? "🚫 *Zero Brokerage · Direct Owner*"
    : "✨ *Verified Listing on Awasio*";

  // Line 3: Top Connectivity / Landmarks
  const connectivity = extractConnectivitySnippet(input.nearbyLandmarks);

  // Line 4: Clean Call to Action + URL
  const callToAction = `🔗 View full photos & direct owner contact:\n${input.url}`;

  // Assemble full copy for WhatsApp
  const lines = [headline, badge];
  if (connectivity) {
    lines.push(connectivity);
  }
  lines.push(callToAction);

  const fullMessage = lines.join("\n\n");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;

  return {
    headline,
    badge,
    connectivity,
    callToAction,
    fullMessage,
    whatsappUrl,
  };
}

/**
 * 🛏️ WhatsApp Share Card for Flatmate & Roommate Listings
 */
export function buildFlatmateWhatsAppCard(input: FlatmateWhatsAppCardInput): {
  headline: string;
  badge: string;
  connectivity: string | null;
  callToAction: string;
  fullMessage: string;
  whatsappUrl: string;
} {
  const isBuddyUp = input.mode === "BUDDY_UP";
  const isNeedRoom = input.mode === "NEED_ROOM";

  let modeHeader = "Flatmate / Room";
  if (isBuddyUp) modeHeader = "Buddy-Up Flat Search";
  else if (isNeedRoom) modeHeader = "Roommate Looking for Room";
  else if (input.roomType) modeHeader = `${input.roomType} in Flat`;

  const location = input.locality || input.cityName || "Bangalore";
  const formattedRent = formatSharePrice(input.rent);

  // Line 1: Type + Location + Rent
  const headline = `🛏️ *${modeHeader} in ${location}* · *${formattedRent}*`;

  // Line 2: Zero Brokerage & Trust
  const badge = "🚫 *Zero Brokerage · Direct Connection*";

  // Line 3: Connectivity or Habits summary
  let connectivity = extractConnectivitySnippet(input.nearbyLandmarks);
  if (!connectivity && (input.habitsSummary || input.genderPreference)) {
    const extras: string[] = [];
    if (input.genderPreference) extras.push(`Prefers: ${input.genderPreference}`);
    if (input.habitsSummary) extras.push(input.habitsSummary);
    connectivity = `✨ ${extras.join(" | ")}`;
  }

  // Line 4: CTA
  const callToAction = `🔗 View photos & direct contact on Awasio:\n${input.url}`;

  const lines = [headline, badge];
  if (connectivity) {
    lines.push(connectivity);
  }
  lines.push(callToAction);

  const fullMessage = lines.join("\n\n");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;

  return {
    headline,
    badge,
    connectivity,
    callToAction,
    fullMessage,
    whatsappUrl,
  };
}

