import React from "react";
import Link from "next/link";

const columns = [
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "/contact" },
      { label: "Safety information", href: "/policies" },
      { label: "Cancellation options", href: "/policies#cancellation" },
      { label: "Report concern", href: "/contact" },
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
      { label: "Careers", href: "/about" },
      { label: "Newsroom", href: "/about" },
      { label: "Investors", href: "/about" },
      { label: "Emergency stays", href: "/homePage" },
    ],
  },
];

export function FooterLinks() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-200">CH</span>
            <span className="tracking-tight">CityHaven</span>
          </div>
          <p className="text-sm text-slate-600">Clean, host-led stays and verified homes across top Indian cities.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-slate-900">{col.title}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              {col.links.map((link) => (
                <Link key={link.label} className="hover:text-red-500" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} CityHaven. Crafted for modern stays.</div>
    </footer>
  );
}
