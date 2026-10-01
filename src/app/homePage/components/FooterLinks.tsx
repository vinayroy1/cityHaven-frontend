import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

const columns = [
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "/contact" },
      { label: "Safety information", href: "/policies" },
      { label: "Report concern", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
  {
    title: "Owners & teams",
    links: [
      { label: "Post property", href: "/propertyListing" },
      { label: "Owner dashboard", href: "/dashboard" },
      { label: "Organization workspace", href: "/dashboard/organization" },
      { label: "Plans & credits", href: "/pricing" },
    ],
  },
  {
    title: "CityHaven",
    links: [
      { label: "About us", href: "/about" },
      { label: "Search properties", href: "/propertySearch" },
      { label: "Saved properties", href: "/favorites" },
      { label: "Contact support", href: "/contact" },
    ],
  },
];

export function FooterLinks() {
  return (
    <footer className="mt-14 overflow-x-clip border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 md:col-span-1">
          <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Buy, rent, post and manage approved property listings across Indian cities.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{col.title}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
              {col.links.map((link) => (
                <Link key={link.label} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">© 2026 CityHaven. Property search and listing management.</div>
    </footer>
  );
}
