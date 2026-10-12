import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { buildCanonical, SITE_URL } from "@/constants/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
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
      <head />
      <body
        className="antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-150"
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
