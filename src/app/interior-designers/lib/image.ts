/**
 * Hosts configured in next.config `images.remotePatterns`. Anything else is
 * rendered unoptimized so next/image never throws on an unknown host.
 * ui-avatars.com is deliberately excluded: it serves SVG, which the optimizer
 * rejects with a 400.
 */
const OPTIMIZABLE_HOST = /(^|\.)r2\.dev$|^images\.unsplash\.com$/i;

export function isOptimizableImage(src?: string | null): boolean {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return OPTIMIZABLE_HOST.test(new URL(src).hostname);
  } catch {
    return false;
  }
}
