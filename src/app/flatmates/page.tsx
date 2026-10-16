"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  Home,
  CheckCircle2,
  Utensils,
  PawPrint,
  Cigarette,
  BedDouble,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FlatmateCard } from "@/components/flatmates/FlatmateCard";
import { useSearchFlatmatesQuery } from "@/features/flatmates/api";
import type { FlatmateListingMode } from "@/types/flatmate.types";

const POPULAR_CITIES = ["Bengaluru", "Mumbai", "Delhi", "Gurgaon", "Pune", "Hyderabad", "Noida"];

export default function FlatmatesDiscoveryPage() {
  const [mode, setMode] = useState<FlatmateListingMode | "ALL">("ALL");
  const [city, setCity] = useState("Bengaluru");
  const [locality, setLocality] = useState("");
  const [gender, setGender] = useState("");
  const [roomType, setRoomType] = useState("");
  const [petsAllowed, setPetsAllowed] = useState<boolean | undefined>(undefined);
  const [preferredDiet, setPreferredDiet] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useSearchFlatmatesQuery({
    mode: mode === "ALL" ? undefined : mode,
    city: city || undefined,
    locality: locality.trim() || undefined,
    gender: gender || undefined,
    roomType: roomType || undefined,
    petsAllowed: petsAllowed,
    preferredDiet: preferredDiet || undefined,
    page,
    pageSize: 18,
  });

  const resetFilters = () => {
    setMode("ALL");
    setLocality("");
    setGender("");
    setRoomType("");
    setPetsAllowed(undefined);
    setPreferredDiet("");
    setPage(1);
  };

  const listings = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 bg-gradient-to-b from-rose-50/60 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Hero Header Area */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 py-10 px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,0.08),transparent_40%),radial-gradient(circle_at_85%_30%,rgba(245,158,11,0.08),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold w-fit">
                  <Users className="w-3.5 h-3.5" />
                  <span>Verified Roommate & Flat Sharing Network</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Find Roommates Who Share Your Vibes & Lifestyle
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Search rooms available in flats, connect with people looking for flatmates, or buddy up to rent an apartment together with 100% zero brokerage.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/flatmates/post"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 shadow-lg shadow-rose-600/25 transition active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Flatmate Requirement</span>
                </Link>
              </div>
            </div>

            {/* City Quick Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Popular Cities:
              </span>
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCity(c);
                    setLocality("");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    city.toLowerCase() === c.toLowerCase()
                      ? "bg-rose-600 text-white shadow-sm font-semibold"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                {[
                  { key: "ALL", label: "All Flatmates", icon: Users },
                  { key: "HAVE_ROOM", label: "Rooms Available", icon: Home },
                  { key: "NEED_ROOM", label: "Seeking Rooms", icon: Search },
                  { key: "BUDDY_UP", label: "Buddy Up", icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = mode === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setMode(tab.key as any);
                        setPage(1);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        active
                          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Locality Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  value={locality}
                  onChange={(e) => {
                    setLocality(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Filter by locality (e.g. HSR)..."
                  className="pl-9 h-9 rounded-2xl text-xs"
                />
              </div>
            </div>

            {/* Granular Compatibility Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Gender Filter */}
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by gender"
                  className="h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Gender: Any</option>
                  <option value="Female Only">Female Only</option>
                  <option value="Male Only">Male Only</option>
                </select>

                {/* Room Type */}
                <select
                  value={roomType}
                  onChange={(e) => {
                    setRoomType(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by room type"
                  className="h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Room: All Types</option>
                  <option value="Private Room">Private Room</option>
                  <option value="Shared Room (Twin)">Shared Room</option>
                  <option value="Whole Flat">Whole Flat</option>
                </select>

                {/* Diet */}
                <select
                  value={preferredDiet}
                  onChange={(e) => {
                    setPreferredDiet(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by dietary preference"
                  className="h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Diet: Any</option>
                  <option value="Pure Vegetarian">Pure Vegetarian</option>
                  <option value="Vegetarian & Eggetarian">Veg / Eggetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>

                {/* Pet Friendly Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setPetsAllowed(petsAllowed === true ? undefined : true);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition ${
                    petsAllowed === true
                      ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <PawPrint className="w-3 h-3" />
                  <span>Pet-friendly</span>
                </button>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            </div>
          </div>

          {/* Listings count & Active indicator */}
          <div className="my-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-900 dark:text-white">{listings.length}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{total}</span> flatmate listings in{" "}
              <span className="font-semibold text-rose-600">{city}</span>
            </div>
            {isFetching && (
              <div className="flex items-center gap-1 text-rose-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse space-y-4"
                >
                  <div className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <FlatmateCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 my-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No flatmate listings found in {city} {locality ? `(${locality})` : ""}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Be the first one to post a room or your requirement in this area and connect with thousands of active room seekers!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/flatmates/post"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 shadow-md shadow-rose-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post First Flatmate Listing</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
