const R2_ORIGIN = "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev";

/** Widths Next's image optimizer accepts (default deviceSizes + imageSizes). */
const OPTIMIZER_WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];

/**
 * Request a right-sized rendition of an image.
 * - Unsplash: `w`/`q` rewritten on their CDN.
 * - Our R2 photos (`/r2-cdn/...` or the r2.dev host): served through Next's optimizer
 *   (`/_next/image`), which resizes and caches them, instead of the full-size original.
 * Anything else is returned unchanged.
 */
export function sizedImageUrl(url: string | null | undefined, width: number, quality = 70): string {
  if (!url) return "";
  if (url.startsWith("/_next/image")) return url;

  let r2Url: string | null = null;
  if (url.startsWith("/r2-cdn/")) r2Url = R2_ORIGIN + url.slice("/r2-cdn".length);

  try {
    const u = new URL(r2Url ?? url, "https://awasio.com");
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", String(quality));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }
    const isR2 = u.hostname.endsWith(".r2.dev") || (u.hostname.endsWith("awasio.com") && u.pathname.startsWith("/r2-cdn/"));
    // The optimizer rejects SVG (400) and gains nothing on it.
    if (!isR2 || /\.svg$/i.test(u.pathname)) return url;
    const src = u.hostname.endsWith(".r2.dev") ? u.toString() : R2_ORIGIN + u.pathname.slice("/r2-cdn".length) + u.search;
    const w = OPTIMIZER_WIDTHS.find((x) => x >= width) ?? 1920;
    // Next 16 only accepts the configured qualities (default [75]).
    return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
  } catch {
    return url;
  }
}
