"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Baby,
  BedDouble,
  CalendarCheck,
  Check,
  Clock,
  ExternalLink,
  IdCard,
  Images,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Snowflake,
  Star,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { NearbyLandmarksCompact, hasLandmarks, useLocalityLandmarks, type CompactLandmarks } from "@/components/nearby/NearbyLandmarksCompact";
import { stayPriceLabel } from "@/components/stays/StayCard";
import { stayErrorMessage, trackBookingClick, useStay, useStayEnquiry } from "@/features/stays/api";
import { bedLabel, facilityLabel, platformInfo, stayTypeLabel } from "@/features/stays/options";
import type { Stay, StayRoom } from "@/features/stays/types";
import { formatMoney, intlMobile, whatsappNumber } from "@/lib/money";

function roomPrice(room: StayRoom, cc: string) {
  if (room.isFree) return { main: "Free", sub: room.donationBased ? "donation welcome" : "" };
  if (room.pricePerNight == null) return { main: room.donationBased ? "Donation" : "On request", sub: "" };
  return { main: formatMoney(room.pricePerNight, cc), sub: "per night" };
}

function Gallery({ stay, onOpen }: { stay: Stay; onOpen: (i: number) => void }) {
  const photos = [stay.coverImage, ...stay.photos, ...stay.rooms.flatMap((r) => r.photos)].filter((p, i, a): p is string => !!p && a.indexOf(p) === i);
  if (!photos.length)
    return (
      <div className="flex aspect-[16/7] items-center justify-center rounded-3xl bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 text-rose-300 dark:from-slate-800 dark:to-slate-900">
        <BedDouble className="h-16 w-16" />
      </div>
    );
  return (
    <div className="relative grid h-64 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:h-[420px]">
      {photos.slice(0, 5).map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => onOpen(i)}
          className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" loading={i === 0 ? "eager" : "lazy"} />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg"
      >
        <Images className="h-4 w-4" /> {photos.length} photos
      </button>
    </div>
  );
}

function Lightbox({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-semibold">
          {i + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Close photos" className="rounded-full bg-white/10 p-2">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[i]} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
      </div>
      <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
        {photos.map((p, j) => (
          <button key={p} type="button" onClick={() => setI(j)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ${j === i ? "ring-2 ring-white" : "opacity-60"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function EnquiryDialog({ stay, room, onClose }: { stay: Stay; room?: StayRoom | null; onClose: () => void }) {
  const send = useStayEnquiry(stay.id);
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ name: "", phone: "", checkIn: today, checkOut: "", guests: 2, message: "" });
  const set = (k: keyof typeof f, v: string | number) => setF((x) => ({ ...x, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await send.mutateAsync({
        name: f.name,
        phone: f.phone,
        roomTypeId: room?.id ?? null,
        checkIn: f.checkIn || null,
        checkOut: f.checkOut || null,
        guests: Number(f.guests) || null,
        message: f.message || null,
      });
      toast.success("Enquiry sent — the property will contact you soon");
      onClose();
    } catch (err) {
      toast.error(stayErrorMessage(err));
    }
  };
  const input = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Check availability</p>
            <h3 className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">{room ? room.name : stay.name}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full bg-slate-100 p-1.5 dark:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Your name
            <input required minLength={2} className={`${input} mt-1`} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Mobile number
            <input required type="tel" minLength={7} className={`${input} mt-1`} value={f.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Check-in
            <input type="date" min={today} className={`${input} mt-1`} value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Check-out
            <input type="date" min={f.checkIn || today} className={`${input} mt-1`} value={f.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
          </label>
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Guests
            <input type="number" min={1} max={100} className={`${input} mt-1`} value={f.guests} onChange={(e) => set("guests", Number(e.target.value))} />
          </label>
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Message (optional)
            <textarea rows={3} className={`${input} mt-1 h-auto py-2`} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Arrival time, special needs…" />
          </label>
        </div>
        <button type="submit" disabled={send.isPending} className="mt-4 h-12 w-full rounded-2xl bg-rose-600 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60">
          {send.isPending ? "Sending…" : "Send enquiry"}
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-500">Your number is shared only with this property.</p>
      </form>
    </div>
  );
}

function BookingButtons({ stay, compact = false }: { stay: Stay; compact?: boolean }) {
  const links = stay.bookingLinks ?? [];
  if (!links.length) return null;
  return (
    <div className="space-y-2">
      {!compact && <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Book online</p>}
      {links.map((l) => {
        const p = platformInfo(l.platform);
        return (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="nofollow noopener noreferrer sponsored"
            onClick={() => trackBookingClick(stay.id, l.platform)}
            className={`flex h-11 w-full items-center justify-between rounded-2xl px-4 text-sm font-bold shadow-sm transition hover:opacity-90 ${p.color}`}
          >
            <span>Book on {p.label}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

/** Metro/rail, hospitals, schools & markets near the stay: saved at listing time, else looked up live. */
function NearbySection({ stay }: { stay: Stay }) {
  const stored = (stay.nearbyLandmarks ?? null) as CompactLandmarks;
  const needLive = !hasLandmarks(stored);
  const live = useLocalityLandmarks(stay.locality ?? undefined, stay.cityName, needLive);
  const data = needLive ? live.data : stored;
  if (needLive && !live.loading && !hasLandmarks(data)) return null;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">What&apos;s nearby</h2>
      <p className="mb-3 text-xs text-slate-500">Approximate distance from {stay.locality || stay.cityName}.</p>
      <NearbyLandmarksCompact data={data} loading={needLive && live.loading} />
    </section>
  );
}

export default function StayDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: stay, isLoading, error } = useStay(slug);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [enquire, setEnquire] = useState<{ room?: StayRoom | null } | null>(null);

  const photos = useMemo(
    () => (stay ? [stay.coverImage, ...stay.photos, ...stay.rooms.flatMap((r) => r.photos)].filter((p, i, a): p is string => !!p && a.indexOf(p) === i) : []),
    [stay],
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <HeaderNav />
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  if (error || !stay)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <HeaderNav />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <BedDouble className="mx-auto h-12 w-12 text-rose-400" />
          <h1 className="mt-3 text-xl font-bold">This stay isn&apos;t available</h1>
          <Link href="/stays" className="mt-4 inline-block font-semibold text-rose-600">
            Browse all stays →
          </Link>
        </div>
      </div>
    );

  const price = stayPriceLabel(stay);
  const place = [stay.locality, stay.cityName, stay.stateName].filter(Boolean).join(", ");
  const phone = stay.phone ? intlMobile(stay.phone) : "";
  const wa = stay.whatsapp || stay.phone;
  const waText = `Hi, I found ${stay.name} on Awasio. Is a room available?`;
  const rules: Array<{ ok: boolean; label: string; icon: typeof Clock }> = [
    { ok: true, label: `Check-in ${stay.checkInTime || "12:00"} · Check-out ${stay.checkOutTime || "11:00"}`, icon: Clock },
    { ok: stay.idRequired, label: stay.idRequired ? "Valid photo ID required at check-in" : "ID not mandatory", icon: IdCard },
    { ok: stay.coupleFriendly, label: stay.coupleFriendly ? "Unmarried couples welcome" : "Not couple friendly", icon: Users },
    { ok: true, label: stay.familyOnly ? "Families only" : "Families & solo guests welcome", icon: Baby },
    { ok: stay.petsAllowed, label: stay.petsAllowed ? "Pets allowed" : "No pets", icon: ShieldCheck },
    { ok: stay.alcoholAllowed, label: stay.alcoholAllowed ? "Alcohol allowed" : "No alcohol on premises", icon: ShieldCheck },
  ];
  if (stay.curfewTime) rules.push({ ok: false, label: `Gate closes at ${stay.curfewTime}`, icon: Clock });

  return (
    <div className="min-h-screen bg-slate-50 pb-32 dark:bg-slate-950 lg:pb-12">
      <HeaderNav />
      <main className="mx-auto max-w-6xl px-4 pt-4">
        <Link href="/stays" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> All stays
        </Link>
        <Gallery stay={stay} onOpen={setLightbox} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-6">
            {/* Title */}
            <section>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">{stayTypeLabel(stay.type)}</span>
                {stay.starRating ? (
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: stay.starRating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                ) : null}
                {stay.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" /> Verified by Awasio
                  </span>
                )}
                {stay.status !== "PUBLISHED" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Preview · {stay.status.toLowerCase()}</span>}
              </div>
              <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">{stay.name}</h1>
              {place && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-rose-500" /> {stay.address || place}
                </p>
              )}
              {stay.tagline && <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{stay.tagline}</p>}
            </section>

            {/* Rooms */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rooms & prices</h2>
              <p className="text-xs text-slate-500">Per-night prices set by the property. Taxes may apply.</p>
              <div className="mt-3 space-y-3">
                {stay.rooms.map((r) => {
                  const rp = roomPrice(r, stay.countryCode);
                  return (
                    <article
                      key={r.id}
                      className={`overflow-hidden rounded-3xl border bg-white shadow-xs dark:bg-slate-900 ${r.isAvailable ? "border-slate-200 dark:border-slate-800" : "border-slate-200 opacity-60 dark:border-slate-800"}`}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {r.photos[0] && (
                          <button type="button" onClick={() => setLightbox(Math.max(0, photos.indexOf(r.photos[0])))} className="h-40 shrink-0 overflow-hidden sm:h-auto sm:w-44">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.photos[0]} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                          </button>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{r.name}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {[bedLabel(r.bedType), `Sleeps ${r.maxAdults}${r.maxChildren ? ` + ${r.maxChildren} child` : ""}`, r.roomCount > 1 ? `${r.roomCount} rooms` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {r.ac && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                                  <Snowflake className="h-3 w-3" /> AC
                                </span>
                              )}
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {r.attachedBath ? "Attached bath" : "Shared bath"}
                              </span>
                              {r.features.slice(0, 5).map((f) => (
                                <span key={f} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-end justify-between gap-3 sm:flex-col sm:items-end">
                            <div className="sm:text-right">
                              <p className="text-xl font-black text-slate-900 dark:text-white">{rp.main}</p>
                              {rp.sub && <p className="text-[11px] text-slate-500">{rp.sub}</p>}
                              {r.weekendPrice ? <p className="text-[11px] text-slate-500">Weekend {formatMoney(r.weekendPrice, stay.countryCode)}</p> : null}
                              {r.monthlyPrice ? <p className="text-[11px] font-semibold text-emerald-700">Monthly {formatMoney(r.monthlyPrice, stay.countryCode)}</p> : null}
                            </div>
                            {r.isAvailable ? (
                              r.bookUrl ? (
                                <a
                                  href={r.bookUrl}
                                  target="_blank"
                                  rel="nofollow noopener noreferrer sponsored"
                                  onClick={() => trackBookingClick(stay.id, "ROOM", r.id)}
                                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white"
                                >
                                  Book room <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              ) : (
                                <button type="button" onClick={() => setEnquire({ room: r })} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white">
                                  <CalendarCheck className="h-4 w-4" /> Check availability
                                </button>
                              )
                            ) : (
                              <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800">Full right now</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {stay.description && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">About this {stayTypeLabel(stay.type).toLowerCase()}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{stay.description}</p>
              </section>
            )}

            {stay.facilities.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Facilities</h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {stay.facilities.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" /> {facilityLabel(f)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <NearbySection stay={stay} />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">House rules</h2>
              <ul className="mt-3 space-y-2">
                {rules.map((r) => (
                  <li key={r.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <r.icon className={`h-4 w-4 shrink-0 ${r.ok ? "text-emerald-600" : "text-slate-400"}`} /> {r.label}
                  </li>
                ))}
              </ul>
              {stay.houseRules && <p className="mt-3 whitespace-pre-line rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{stay.houseRules}</p>}
            </section>
          </div>

          {/* Sticky booking panel (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Starting from</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {price.main} <span className="text-sm font-medium text-slate-500">{price.sub}</span>
              </p>
              <button type="button" onClick={() => setEnquire({})} className="h-12 w-full rounded-2xl bg-rose-600 text-sm font-bold text-white transition hover:bg-rose-700">
                Check availability
              </button>
              <div className="grid grid-cols-2 gap-2">
                {phone && (
                  <a href={`tel:${phone}`} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 dark:border-slate-700 dark:text-white">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                )}
                {wa && (
                  <a
                    href={`https://wa.me/${whatsappNumber(wa)}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-sm font-bold text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>
              <BookingButtons stay={stay} />
              <p className="text-center text-[11px] text-slate-500">Awasio doesn&apos;t charge any booking fee.</p>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-[64px] z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">From</p>
            <p className="truncate text-lg font-black text-slate-900 dark:text-white">
              {price.main} <span className="text-[11px] font-medium text-slate-500">{price.sub}</span>
            </p>
          </div>
          {wa && (
            <a href={`https://wa.me/${whatsappNumber(wa)}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
          {stay.bookingLinks?.[0] ? (
            <a
              href={stay.bookingLinks[0].url}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              onClick={() => trackBookingClick(stay.id, stay.bookingLinks![0].platform)}
              className="inline-flex h-11 items-center gap-1.5 rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white"
            >
              Book <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button type="button" onClick={() => setEnquire({})} className="h-11 rounded-2xl bg-rose-600 px-4 text-sm font-bold text-white">
              Enquire
            </button>
          )}
        </div>
        {(stay.bookingLinks?.length ?? 0) > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
            {stay.bookingLinks!.slice(1).map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="nofollow noopener noreferrer sponsored"
                onClick={() => trackBookingClick(stay.id, l.platform)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${platformInfo(l.platform).color}`}
              >
                {platformInfo(l.platform).label} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && photos.length > 0 && <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />}
      {enquire && <EnquiryDialog stay={stay} room={enquire.room} onClose={() => setEnquire(null)} />}
    </div>
  );
}
