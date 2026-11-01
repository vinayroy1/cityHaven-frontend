/**
 * Request a right-sized rendition from image CDNs that support URL resizing.
 * Unsplash URLs get `w`/`q` rewritten; anything else is returned unchanged.
 */
export function sizedImageUrl(url: string | null | undefined, width: number, quality = 70): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname !== "images.unsplash.com") return url;
    u.searchParams.set("w", String(width));
    u.searchParams.set("q", String(quality));
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return url;
  }
}
