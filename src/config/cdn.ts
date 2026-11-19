// Global Cloudflare CDN & R2 Media Configuration

/** The R2 bucket's public dev URL: rate-limited and uncached, so never shown to visitors directly. */
export const R2_ORIGIN = "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev";

/**
 * Photos are served from the bucket's custom domain: Cloudflare caches them at the edge, so they
 * skip both our server (/r2-cdn proxy) and the slow r2.dev host. /r2-cdn keeps working as a fallback.
 */
export const CLOUDFLARE_CDN_URL = (process.env.NEXT_PUBLIC_CDN_URL || "https://img.awasio.com").replace(/\/+$/, "");

/** Any R2 photo URL (r2.dev, /r2-cdn/…, awasio.com/r2-cdn/…) → the CDN URL. Other URLs unchanged. */
export function cdnImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith(`${R2_ORIGIN}/`)) return CLOUDFLARE_CDN_URL + url.slice(R2_ORIGIN.length);
  if (url.startsWith("/r2-cdn/")) return CLOUDFLARE_CDN_URL + url.slice("/r2-cdn".length);
  const m = url.match(/^https?:\/\/(?:www\.)?awasio\.com\/r2-cdn(\/.*)$/i);
  return m ? CLOUDFLARE_CDN_URL + m[1] : url;
}

export const CDN_ASSETS = {
  placeholderWebp: `${CLOUDFLARE_CDN_URL}/assets/property-placeholder.webp`,
  placeholderJpg: `${CLOUDFLARE_CDN_URL}/assets/property-placeholder.jpg`,
  placeholderSvg: `${CLOUDFLARE_CDN_URL}/assets/property-placeholder.svg`,
  logoPrimarySvg: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-logo-primary.svg`,
  logoSoftSvg: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-logo-soft.svg`,
  logoMarkSvg: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-mark.svg`,
  logoRoseConcept: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-logo-rose-concept.png`,
};

/**
 * Rewrites every R2 photo URL inside API data (nested objects / arrays) to the CDN, so all the
 * components that show it get fast URLs without each one remembering to. Public reads only: the
 * dashboard edits the stored values as they are.
 */
export function withCdnImages<T>(data: T): T {
  if (typeof data === "string") return cdnImageUrl(data) as T;
  if (Array.isArray(data)) return data.map((v) => withCdnImages(v)) as T;
  if (data && typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) out[k] = withCdnImages(v);
    return out as T;
  }
  return data;
}
