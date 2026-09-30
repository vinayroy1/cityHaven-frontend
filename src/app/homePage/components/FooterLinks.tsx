import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

const columns = [
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "/contact" },
      { label: "Safety information", href: "/policies" },
      { label: "Cancellation options", href: "/policies#cancellation" },
      { label: "Report concern", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "List your home", href: "/propertyListing" },
      { label: "Host resources", href: "/dashboard" },
      { label: "Community forum", href: "/community" },
      { label: "Responsible hosting", href: "/policies#hosting" },
    ],
  },
  {
    title: "CityHaven",
    links: [
      { label: "About us", href: "/about" },
      { label: "Newsroom", href: "/about" },
      { label: "Investors", href: "/about" },
      { label: "Emergency stays", href: "/homePage" },
    ],
  },
];

export function FooterLinks() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Clean, host-led stays and verified homes across top Indian cities.</p>
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
      <div className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} CityHaven. Crafted for modern stays.</div>
    </footer>
  );
}
