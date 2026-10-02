import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

const columns = [
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "/contact" },
      { label: "Safety information", href: "/policies" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
  {
    title: "Awasio",
    links: [
      { label: "About us", href: "/about" },
      { label: "Find verified agents", href: "/agents" },
      { label: "Search properties", href: "/propertySearch" },
      { label: "Saved properties", href: "/favorites" },
      { label: "Contact support", href: "/contact" },
    ],
  },
];

export function FooterLinks() {
  return (
    <footer className="mt-8 sm:mt-12 overflow-x-clip border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          {/* Brand Info */}
          <div className="space-y-2.5 md:col-span-6">
            <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />
            <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Buy, rent, post and manage approved property listings across Indian cities with transparent pricing.
            </p>
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
