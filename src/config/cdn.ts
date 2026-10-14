// Global Cloudflare CDN & R2 Media Configuration
export const CLOUDFLARE_CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev";

export const CDN_ASSETS = {
  placeholderWebp: `${CLOUDFLARE_CDN_URL}/assets/property-placeholder.webp`,
  placeholderJpg: `${CLOUDFLARE_CDN_URL}/assets/property-placeholder.jpg`,
  placeholderSvg: `${CLOUDFLARE_CDN_URL}/assets/property-placeholder.svg`,
  logoPrimarySvg: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-logo-primary.svg`,
  logoSoftSvg: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-logo-soft.svg`,
  logoMarkSvg: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-mark.svg`,
  logoRoseConcept: `${CLOUDFLARE_CDN_URL}/assets/logo/awasio-logo-rose-concept.png`,
};
