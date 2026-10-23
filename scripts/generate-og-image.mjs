import sharp from "sharp";
import fs from "fs";
import path from "path";

const width = 1200;
const height = 630;

// High-end branded SVG for Awasio
const svgOverlay = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)" />

  <!-- Ambient Glow -->
  <circle cx="200" cy="150" r="220" fill="#f43f5e" opacity="0.18" filter="url(#glow)" />
  <circle cx="1000" cy="480" r="240" fill="#6366f1" opacity="0.15" filter="url(#glow)" />

  <!-- Subtle Grid lines -->
  <g stroke="#334155" stroke-opacity="0.25" stroke-width="1">
    <line x1="0" y1="210" x2="${width}" y2="210" />
    <line x1="0" y1="420" x2="${width}" y2="420" />
    <line x1="400" y1="0" x2="400" y2="${height}" />
    <line x1="800" y1="0" x2="800" y2="${height}" />
  </g>

  <!-- Brand Card Container -->
  <rect x="80" y="80" width="1040" height="470" rx="32" fill="#0f172a" fill-opacity="0.6" stroke="#334155" stroke-opacity="0.5" stroke-width="2" />

  <!-- Top Badge -->
  <g transform="translate(140, 140)">
    <rect width="210" height="40" rx="20" fill="url(#roseGradient)" fill-opacity="0.2" stroke="#f43f5e" stroke-width="1.5" />
    <text x="105" y="25" fill="#fb7185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" letter-spacing="1.5" text-anchor="middle">VERIFIED PROPERTIES</text>
  </g>

  <!-- Main Headline -->
  <text x="140" y="270" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" letter-spacing="-1.5">
    Awasio
  </text>

  <!-- Gradient Tagline -->
  <text x="140" y="340" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500">
    Find verified homes, apartments &amp; local property advisors
  </text>

  <!-- Key Pillars / Badges at bottom -->
  <g transform="translate(140, 420)">
    <!-- 100% Verified -->
    <rect x="0" y="0" width="180" height="50" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="90" y="31" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600" text-anchor="middle">✓ 100% Verified</text>

    <!-- Zero Brokerage Options -->
    <rect x="200" y="0" width="220" height="50" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="310" y="31" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600" text-anchor="middle">✓ Direct Owner Connect</text>

    <!-- Top Metros -->
    <rect x="440" y="0" width="210" height="50" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="545" y="31" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600" text-anchor="middle">✓ India's Top Cities</text>
  </g>

  <!-- Domain watermark bottom right -->
  <text x="1040" y="515" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" text-anchor="end">
    awasio.com
  </text>
</svg>
`;

async function main() {
  const outputPath = path.resolve(process.cwd(), "public", "og-image.png");
  await sharp(Buffer.from(svgOverlay))
    .png({ quality: 95 })
    .toFile(outputPath);
  console.log(`[SUCCESS] Generated ${outputPath}`);
}

main().catch(console.error);
