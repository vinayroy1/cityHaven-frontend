"use client";

import Link from "next/link";
import { BedDouble, Eye, MessageSquare, MousePointerClick, Pencil, Phone, Plus } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { stayPriceLabel } from "@/components/stays/StayCard";
import { useMyStayEnquiries, useMyStays } from "@/features/stays/api";
import { stayTypeLabel } from "@/features/stays/options";

const STATUS: Record<string, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-slate-200 text-slate-700",
  PAUSED: "bg-amber-100 text-amber-800",
};

export default function MyStaysPage() {
  const { data: stays, isLoading } = useMyStays();
  const { data: enquiries } = useMyStayEnquiries();

  return (
    <div className="min-h-screen bg-slate-50 pb-28 dark:bg-slate-950">
      <HeaderNav />
      <main className="mx-auto max-w-5xl px-4 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">My stays</h1>
            <p className="text-sm text-slate-500">Hotels, guest houses, lodges & dharamshalas you manage.</p>
          </div>
          <Link href="/dashboard/stays/new" className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" /> Add stay
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {isLoading && [0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />)}
          {stays?.map((s) => {
            const price = stayPriceLabel(s);
            const cover = s.coverImage || s.photos[0];
            return (
              <article key={s.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex gap-3 p-3">
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 to-amber-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <BedDouble className="m-auto mt-8 h-8 w-8 text-rose-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS[s.status] ?? STATUS.DRAFT}`}>{s.status.toLowerCase()}</span>
                      <span className="text-[11px] text-slate-500">{stayTypeLabel(s.type)}</span>
                    </div>
                    <h2 className="mt-1 line-clamp-1 font-bold text-slate-900 dark:text-white">{s.name}</h2>
                    <p className="text-xs text-slate-500">{[s.locality, s.cityName].filter(Boolean).join(", ")}</p>
                    <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {price.main} <span className="text-[11px] font-medium text-slate-500">{price.sub}</span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100 text-center text-[11px] text-slate-500 dark:border-slate-800">
                  <div className="py-2">
                    <Eye className="mx-auto h-4 w-4" /> {s.viewCount} views
                  </div>
                  <div className="border-x border-slate-100 py-2 dark:border-slate-800">
                    <MousePointerClick className="mx-auto h-4 w-4" /> {s.bookingClicks} to booking
                  </div>
                  <div className="py-2">
                    <MessageSquare className="mx-auto h-4 w-4" /> {s._count?.enquiries ?? 0} enquiries
                  </div>
                </div>
                <div className="flex gap-2 border-t border-slate-100 p-2 dark:border-slate-800">
                  <Link href={`/dashboard/stays/${s.id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white">
                    <Pencil className="h-3.5 w-3.5" /> Edit rooms & prices
                  </Link>
                  <Link href={`/stays/${s.slug}`} className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    View page
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {!isLoading && !stays?.length && (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <BedDouble className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-3 font-bold text-slate-900 dark:text-white">List your hotel, guest house or dharamshala</p>
            <p className="mt-1 text-sm text-slate-500">Add room types and nightly prices. It&apos;s free.</p>
            <Link href="/dashboard/stays/new" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white">
              <Plus className="h-4 w-4" /> Add your first stay
            </Link>
          </div>
        )}

        {!!enquiries?.length && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent enquiries</h2>
            <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {enquiries.slice(0, 20).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {e.name} <span className="text-xs font-normal text-slate-500">· {e.stay.name}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {[e.checkIn && `In ${new Date(e.checkIn).toLocaleDateString()}`, e.checkOut && `Out ${new Date(e.checkOut).toLocaleDateString()}`, e.guests && `${e.guests} guests`]
                        .filter(Boolean)
                        .join(" · ") || new Date(e.createdAt).toLocaleString()}
                    </p>
                    {e.message && <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{e.message}</p>}
                  </div>
                  <a href={`tel:${e.phone}`} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
