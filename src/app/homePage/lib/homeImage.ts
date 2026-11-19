import { CLOUDFLARE_CDN_URL, cdnImageUrl } from "@/config/cdn";

/** Widths Next's image optimizer accepts (default deviceSizes + imageSizes). */
const OPTIMIZER_WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];

/**
 * Request a right-sized rendition of an image.
 * - Unsplash: `w`/`q` rewritten on their CDN.
 * - Our R2 photos (img.awasio.com, `/r2-cdn/...` or the r2.dev host): served through Next's optimizer
 *   (`/_next/image`), which resizes and caches them, instead of the full-size original.
 * Anything else is returned unchanged.
 */
export function sizedImageUrl(url: string | null | undefined, width: number, quality = 70): string {
  if (!url) return "";
  if (url.startsWith("/_next/image")) return url;

  // R2 photos are fetched by the optimizer from the CDN (cached at Cloudflare), not from r2.dev.
  const cdnUrl = cdnImageUrl(url);
  const isR2 = cdnUrl !== url || url.startsWith(`${CLOUDFLARE_CDN_URL}/`);

  try {
    const u = new URL(cdnUrl, "https://awasio.com");
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", String(quality));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }
    // The optimizer rejects SVG (400) and gains nothing on it.
    if (!isR2) return url;
    if (/\.svg$/i.test(u.pathname)) return cdnUrl;
    const src = u.toString();
    const w = OPTIMIZER_WIDTHS.find((x) => x >= width) ?? 1920;
    // Next 16 only accepts the configured qualities (default [75]).
    return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
  } catch {
    return url;
  }
}
