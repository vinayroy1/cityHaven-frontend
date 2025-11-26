import React from "react";
import Link from "next/link";
import { Building2, Banknote, Megaphone, ShieldCheck, Home } from "lucide-react";

const actions = [
  { icon: <Home className="h-5 w-5 text-red-500" />, title: "Buy / Rent", description: "Browse flats, villas, plots, and commercial spaces.", href: "/propertySearch" },
  { icon: <Megaphone className="h-5 w-5 text-amber-500" />, title: "List Property Free", description: "Post your property and reach verified buyers.", href: "/propertyListing" },
  { icon: <Banknote className="h-5 w-5 text-emerald-500" />, title: "Home Loans", description: "Compare offers and get instant eligibility checks.", href: "/home-loans" },
  { icon: <ShieldCheck className="h-5 w-5 text-sky-500" />, title: "Price Trends", description: "Check city-wise rates and transaction insights.", href: "/price-trends" },
  { icon: <Building2 className="h-5 w-5 text-indigo-500" />, title: "New Projects", description: "Discover RERA approved projects and builders.", href: "/new-projects" },
];

export function QuickActions() {
  return (
    <section className="mx-auto mt-8 hidden max-w-6xl px-6 md:block">
      <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex flex-col gap-2 rounded-2xl border border-slate-100 px-4 py-3 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">{item.icon}</div>
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
