"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Banknote, Megaphone, ShieldCheck, Home, X } from "lucide-react";
import { loadPersistedDraft, clearPersistedDraft } from "@/features/propertyListing/storage";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: <Home className="h-5 w-5 text-red-500" />, title: "Buy / Rent", description: "Browse flats, villas, plots, and commercial spaces.", href: "/propertySearch" },
  { icon: <Megaphone className="h-5 w-5 text-amber-500" />, title: "List Property Free", description: "Post your property and reach verified buyers.", href: "/propertyListing", type: "list" as const },
  { icon: <Banknote className="h-5 w-5 text-emerald-500" />, title: "Home Loans", description: "Compare offers and get instant eligibility checks.", href: "/home-loans" },
  { icon: <ShieldCheck className="h-5 w-5 text-sky-500" />, title: "Price Trends", description: "Check city-wise rates and transaction insights.", href: "/price-trends" },
  { icon: <Building2 className="h-5 w-5 text-indigo-500" />, title: "New Projects", description: "Discover RERA approved projects and builders.", href: "/new-projects" },
];

export function QuickActions() {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const handleListClick = () => {
    const persisted = loadPersistedDraft();
    if (persisted?.form) {
      setHasDraft(true);
      setShowPrompt(true);
    } else {
      router.push("/propertyListing");
    }
  };

  const handleStartFresh = () => {
    clearPersistedDraft();
    setShowPrompt(false);
    router.push("/propertyListing");
  };

  const handleResume = () => {
    setShowPrompt(false);
    router.push("/propertyListing");
  };

  return (
    <section className="mx-auto mt-8 hidden max-w-6xl px-6 md:block">
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPrompt(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-900">Resume your listing?</p>
                <p className="mt-1 text-sm text-slate-600">
                  We found a saved property draft. Continue from where you left off or start a fresh listing.
                </p>
              </div>
              <button type="button" onClick={() => setShowPrompt(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleStartFresh}>
                Start fresh
              </Button>
              <Button className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800" onClick={handleResume}>
                Resume draft
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 rounded-2xl border border-slate-100 px-4 py-3 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">{item.icon}</div>
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-600">{item.description}</p>
            {item.type === "list" ? (
              <button
                type="button"
                onClick={handleListClick}
                className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow hover:-translate-y-0.5"
              >
                Continue
              </button>
            ) : (
              <Link href={item.href} className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900">
                Go
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
