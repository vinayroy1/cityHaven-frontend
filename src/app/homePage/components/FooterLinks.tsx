import React from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

const columns = [
  {
    title: "Support & Legal",
    links: [
      { label: "Help Centre", href: "/contact" },
      { label: "Community Forum", href: "/community" },
      { label: "Safety information", href: "/policies" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
  {
    title: "Tools & Portals",
    links: [
      { label: "EMI Calculator", href: "/emi-calculator" },
      { label: "Home Loans", href: "/home-loans" },
      { label: "Price Trends", href: "/price-trends" },
      { label: "Pricing & Plans", href: "/pricing" },
      { label: "Find verified agents", href: "/agents" },
      { label: "Blog & Guides", href: "/blog" },
    ],
  },
];

export function FooterLinks() {
  return (
    <footer className="mt-4 overflow-x-clip border-t border-slate-200 bg-white sm:mt-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto hidden max-w-6xl px-4 py-6 sm:block sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-8">
          {/* Brand Info */}
          <div className="space-y-2.5 md:col-span-6">
            <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />
            <p className="hidden sm:block max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Buy, rent, post and manage approved property listings across Indian cities with transparent pricing.
            </p>
            {/* Compact Horizontal Contact Pills (Single-line row on mobile, saves vertical height) */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <a
                href="tel:+918848510629"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-rose-400"
                aria-label="Call Helpline +91-8848510629"
              >
                <Phone className="h-3 w-3 text-rose-500 shrink-0" />
                <span>+91-8848510629</span>
              </a>
              <a
                href="mailto:contact@awasio.com"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-rose-400"
                aria-label="Email contact@awasio.com"
              >
                <Mail className="h-3 w-3 text-rose-500 shrink-0" />
                <span>contact@awasio.com</span>
              </a>
            </div>
          </div>

          {/* Links: 2 side-by-side columns on mobile and desktop */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:col-span-6">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {col.title}
                </p>
                <div className="mt-2.5 flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      href={link.href}
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-3.5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © 2026 Awasio. Property search and listing management.
      </div>
    </footer>
  );
}
