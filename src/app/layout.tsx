import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { WelcomeCreditModal } from "@/components/marketing/WelcomeCreditModal";
import { buildCanonical, SITE_URL } from "@/constants/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Awasio - Verified Real Estate & Local Advisors",
    template: "%s | Awasio",
  },
  description:
    "Discover verified homes, apartments, builder floors, and connect with certified RERA real estate advisors across India's top cities on Awasio.",
  keywords: [
    "real estate india",
    "verified property search",
    "rera verified agents",
    "property advisors",
    "builder floors delhi",
    "apartments gurugram",
    "flats in noida",
    "homes in mumbai",
    "villas in bengaluru",
    "property in pune",
    "book site visit",
  ],
  authors: [{ name: "Awasio Real Estate" }],
  creator: "Awasio",
  publisher: "Awasio",
  alternates: { canonical: buildCanonical("/") },
  openGraph: {
    title: "Awasio - Verified Real Estate & Certified Local Advisors",
    description:
      "Search, shortlist, and book in-person site walkthroughs for verified residential and commercial properties across India.",
    url: buildCanonical("/"),
    siteName: "Awasio",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awasio - Verified Real Estate & Certified Local Advisors",
    description:
      "Search verified properties and book private walkthroughs with certified RERA advisors.",
    creator: "@awasio",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
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
        <link rel="preconnect" href="https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7884603260618662"
          crossOrigin="anonymous"
        />
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
          <WelcomeCreditModal />
        </Providers>
      </body>
    </html>
  );
}
