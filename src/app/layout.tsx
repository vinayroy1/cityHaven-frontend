import type { Metadata, Viewport } from "next";
import { GoogleAdsenseDeferred } from "@/components/common/GoogleAdsenseDeferred";
import "../styles/globals.css";
import { Providers } from "./providers";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { SITE_URL, SOCIAL_LINKS, OG_IMAGE_URL } from "@/constants/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Awasio: Buy, Rent & Sell Property, PGs & Flatmates",
    template: "%s | Awasio",
  },
  description:
    "Buy, rent or sell homes, flats, plots, PGs and commercial spaces, find flatmates and explore new projects on Awasio. Post your property free.",
  keywords: [
    "real estate india",
    "property for rent",
    "pg and flatmates",
    "property advisors",
    "builder floors delhi",
    "apartments gurugram",
    "flats in noida",
    "homes in mumbai",
    "villas in bengaluru",
    "property in pune",
    "book site visit",
  ],
  authors: [{ name: "Awasio" }],
  creator: "Awasio",
  publisher: "Awasio",
  openGraph: {
    title: "Awasio: Buy, Rent & Sell Property, PGs & Flatmates",
    description:
      "Buy, rent or sell homes, flats, plots, PGs and commercial spaces, find flatmates and explore new projects on Awasio.",
    siteName: "Awasio",
    locale: "en_IN",
    type: "website",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio: find your next home, the easy way" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awasio: Buy, Rent & Sell Property, PGs & Flatmates",
    description:
      "Buy, rent or sell homes, flats, plots, PGs and commercial spaces, find flatmates and explore new projects on Awasio.",
    site: `@${SOCIAL_LINKS.x.handle}`,
    creator: `@${SOCIAL_LINKS.x.handle}`,
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "VhfeKH6SSoiyonmucg-FUq01ZsJbrBm7lSBVRnsDkAg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className="antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-150"
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <MobileBottomNav />
        </Providers>
        <GoogleAdsenseDeferred />
      </body>
    </html>
  );
}
