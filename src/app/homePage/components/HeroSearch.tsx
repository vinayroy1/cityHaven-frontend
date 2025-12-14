"use client";

import React from "react";
import { Building2, User, Search, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export type ListingType = "SELL" | "RENT" | "PG";

type HeroSearchProps = {
  initialLocation?: string;
  initialListingType?: ListingType;
  onSearch?: (params: { location: string; listingType: ListingType }) => void;
  onListingTypeChange?: (listingType: ListingType) => void;
  variant?: "default" | "embedded";
  eyebrowText?: string | null;
  className?: string;
};

const TABS: { key: ListingType; label: string }[] = [
  { key: "SELL", label: "Buy" },
  { key: "RENT", label: "Rent" },
  { key: "PG", label: "PG / Co-living" },
];

export function HeroSearch({
  initialLocation = "",
  initialListingType = "SELL",
  onSearch,
  onListingTypeChange,
  variant = "default",
  eyebrowText = "Find your perfect home, PG, land or workspace in your city",
  className = "",
}: HeroSearchProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<ListingType>(initialListingType);
  const [location, setLocation] = React.useState(initialLocation);

  React.useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  React.useEffect(() => {
    setActiveTab(initialListingType);
  }, [initialListingType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedLocation = location.trim();
    if (onSearch) {
      onSearch({ location: normalizedLocation, listingType: activeTab });
      return;
    }

    const params = new URLSearchParams();
    if (normalizedLocation) params.set("q", normalizedLocation);
    params.set("listingType", activeTab);
    router.push(`/propertySearch?${params.toString()}`);
  };

  const handleTabChange = (tab: ListingType) => {
    setActiveTab(tab);
    onListingTypeChange?.(tab);
  };

  const isEmbedded = variant === "embedded";
  const sectionClasses = `${
    isEmbedded ? "relative w-full" : "relative mx-auto mt-10 max-w-5xl px-4 md:px-6"
  } ${className}`.trim();
  const cardClasses = isEmbedded
    ? "relative overflow-hidden rounded-2xl border border-white/70 bg-white px-3 py-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] sm:px-4"
    : "relative overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.6)] backdrop-blur";
  const innerPadding = isEmbedded ? "px-2 py-3 sm:px-3" : "px-4 py-5 md:px-6";

  return (
    <section className={sectionClasses}>
      {!isEmbedded && (
        <div
          className="absolute inset-x-8 -top-10 h-40 rounded-[28px] bg-gradient-to-r from-rose-500/25 via-amber-400/20 to-emerald-400/25 blur-3xl"
          aria-hidden
        />
      )}
      <div className={cardClasses}>
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 25%, rgba(244,63,94,0.12), transparent 28%), radial-gradient(circle at 80% 8%, rgba(248,113,113,0.18), transparent 24%), radial-gradient(circle at 82% 86%, rgba(16,185,129,0.14), transparent 26%)",
          }}
          aria-hidden
        />
        <div className={`relative z-10 ${innerPadding}`}>
          {eyebrowText && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">{eyebrowText}</p>
            </div>
          )}

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold text-slate-700">
              {TABS.map((tab) => {
                const icon = tab.key === "PG" ? <User className="h-4 w-4 text-sky-500" /> : <Home className="h-4 w-4 text-red-500" />;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                      activeTab === tab.key
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                        : "bg-white text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {icon}
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative flex w-full items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-rose-200">
                <Building2 className="h-4 w-4 text-rose-500" />
                <input
                  className="w-full bg-transparent pr-10 md:pr-0 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                  placeholder="Search locality, project, builder or landmark"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  aria-label="Search locality, project, builder or landmark"
                />
                <button
                  type="submit"
                  className="absolute right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow md:hidden"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </label>

              <button
                type="submit"
                className="hidden items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-22px_rgba(15,23,42,0.6)] md:inline-flex"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
