"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, Copy, ExternalLink, HeartHandshake, ImagePlus, Link2, Loader2, Plus, ShieldCheck, Snowflake, Sparkles, Star, Trash2, Wind, X } from "lucide-react";
import { toast } from "sonner";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { COUNTRY_LIST, getCountry } from "@/config/countries";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import { stayErrorMessage, useSaveStay } from "@/features/stays/api";
import { BED_TYPES, BOOKING_PLATFORMS, FACILITIES, ROOM_FEATURES, STAY_TYPES, bookingUrlError } from "@/features/stays/options";
import type { Stay, StayInput, StayRoom } from "@/features/stays/types";
import { getSelectedCountry } from "@/lib/country/countryStore";

const emptyRoom = (): StayRoom => ({
  name: "",
  bedType: "DOUBLE",
  maxAdults: 2,
  maxChildren: 0,
  roomCount: 1,
  pricePerNight: null,
  weekendPrice: null,
  monthlyPrice: null,
  isFree: false,
  donationBased: false,
  ac: false,
  attachedBath: true,
  features: [],
  photos: [],
  bookUrl: null,
  isAvailable: true,
});

const fromStay = (s?: Stay | null): StayInput => ({
  type: s?.type ?? "HOTEL",
  name: s?.name ?? "",
  tagline: s?.tagline ?? "",
  description: s?.description ?? "",
  starRating: s?.starRating ?? null,
  countryCode: s?.countryCode ?? "IN",
  stateName: s?.stateName ?? "",
  cityName: s?.cityName ?? "",
  locality: s?.locality ?? "",
  address: s?.address ?? "",
  pincode: s?.pincode ?? "",
  latitude: s?.latitude ?? null,
  longitude: s?.longitude ?? null,
  checkInTime: s?.checkInTime ?? "12:00",
  checkOutTime: s?.checkOutTime ?? "11:00",
  coupleFriendly: s?.coupleFriendly ?? false,
  familyOnly: s?.familyOnly ?? false,
  idRequired: s?.idRequired ?? true,
  petsAllowed: s?.petsAllowed ?? false,
  alcoholAllowed: s?.alcoholAllowed ?? false,
  curfewTime: s?.curfewTime ?? "",
  houseRules: s?.houseRules ?? "",
  facilities: s?.facilities ?? [],
  coverImage: s?.coverImage ?? null,
  photos: s?.photos ?? [],
  phone: s?.phone ?? "",
  whatsapp: s?.whatsapp ?? "",
  email: s?.email ?? "",
  bookingLinks: (s?.bookingLinks as StayInput["bookingLinks"])?.length ? (s!.bookingLinks as StayInput["bookingLinks"]) : [{ platform: "WEBSITE", url: "" }],
  rooms: s?.rooms?.length ? s.rooms : [{ ...emptyRoom(), name: "Standard Room" }],
});

/** Strip empty strings to null and drop client-only fields before sending. */
function toPayload(v: StayInput, publish?: boolean): Partial<StayInput> {
  const blank = (x?: string | null) => (x && x.trim() ? x.trim() : null);
  return {
    ...v,
    tagline: blank(v.tagline),
    description: blank(v.description),
    stateName: blank(v.stateName),
    locality: blank(v.locality),
    address: blank(v.address),
    pincode: blank(v.pincode),
    checkInTime: blank(v.checkInTime),
    checkOutTime: blank(v.checkOutTime),
    curfewTime: blank(v.curfewTime),
    houseRules: blank(v.houseRules),
    phone: blank(v.phone),
    whatsapp: blank(v.whatsapp),
    email: blank(v.email) ?? "",
    bookingLinks: v.bookingLinks.filter((l) => l.url.trim()),
    rooms: v.rooms.map((r) => ({ ...r, bookUrl: blank(r.bookUrl), bedType: blank(r.bedType) })),
    ...(publish !== undefined ? { publish } : {}),
  };
}

const input =
  "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition text-ellipsis placeholder:font-normal placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const label = "text-xs font-bold text-slate-700 dark:text-slate-300";

function Card({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white dark:bg-white dark:text-slate-900">{n}</span>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        on ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function usePhotoUpload() {
  const [getUrl] = useGetPresignedUploadUrlMutation();
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | null, sub: string): Promise<string[]> => {
    if (!files?.length) return [];
    setBusy(true);
    const out: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, 8)) {
        if (!file.type.startsWith("image/")) continue;
        const p = await getUrl({ fileName: file.name, contentType: file.type, category: "stays", subFolder: sub }).unwrap();
        const r = await fetch(p.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (r.ok) out.push(p.publicUrl);
      }
      if (!out.length) toast.error("Couldn't upload photos. Try JPG or PNG.");
    } catch {
      toast.error("Photo upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
    return out;
  };
  return { upload, busy };
}

function PhotoStrip({ photos, onChange, sub, max = 12 }: { photos: string[]; onChange: (p: string[]) => void; sub: string; max?: number }) {
  const { upload, busy } = usePhotoUpload();
  return (
    <div className="flex flex-wrap gap-2">
      {photos.map((p, i) => (
        <div key={p} className="group relative h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p} alt="" className="h-full w-full object-cover" />
          {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white">Cover</span>}
          <button
            type="button"
            onClick={() => onChange(photos.filter((x) => x !== p))}
            aria-label="Remove photo"
            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {photos.length < max && (
        <label className="flex h-20 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-[11px] font-semibold text-slate-500 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {busy ? "Uploading" : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={busy}
            onChange={async (e) => {
              const urls = await upload(e.target.files, sub);
              if (urls.length) onChange([...photos, ...urls].slice(0, max));
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

function RoomEditor({ room, index, cc, onChange, onRemove, onDuplicate }: { room: StayRoom; index: number; cc: string; onChange: (r: StayRoom) => void; onRemove: () => void; onDuplicate: () => void }) {
  const set = <K extends keyof StayRoom>(k: K, v: StayRoom[K]) => onChange({ ...room, [k]: v });
  const sym = getCountry(cc).currencySymbol;
  const num = (v: string) => (v === "" ? null : Math.max(0, Number(v)));
  const urlErr = room.bookUrl ? bookingUrlError("WEBSITE", room.bookUrl) : null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Room type {index + 1}</p>
        <div className="flex gap-1">
          <button type="button" onClick={onDuplicate} title="Duplicate room type" className="rounded-lg p-1.5 text-slate-500 hover:bg-white dark:hover:bg-slate-700">
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" onClick={onRemove} title="Remove room type" className="rounded-lg p-1.5 text-rose-600 hover:bg-white dark:hover:bg-slate-700">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          Room name *
          <input className={`${input} mt-1`} value={room.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Deluxe AC Double" />
        </label>
        <label className={label}>
          Bed
          <select className={`${input} mt-1`} value={room.bedType ?? ""} onChange={(e) => set("bedType", e.target.value)}>
            {BED_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className={label}>
            Adults
            <input type="number" min={1} max={20} className={`${input} mt-1`} value={room.maxAdults} onChange={(e) => set("maxAdults", Math.max(1, Number(e.target.value) || 1))} />
          </label>
          <label className={label}>
            Kids
            <input type="number" min={0} max={10} className={`${input} mt-1`} value={room.maxChildren} onChange={(e) => set("maxChildren", Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label className={label}>
            Rooms
            <input type="number" min={1} max={500} className={`${input} mt-1`} value={room.roomCount} onChange={(e) => set("roomCount", Math.max(1, Number(e.target.value) || 1))} />
          </label>
        </div>
        {/* Comfort & Climate */}
        <div className="space-y-1 sm:col-span-2">
          <p className={label}>Room climate & bathroom</p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <Toggle on={room.ac} onChange={(v) => set("ac", v)}>
              <Snowflake className="mr-1.5 inline h-3.5 w-3.5 text-sky-500" />
              {room.ac ? "AC Room" : "Non-AC (Fan / Cooler)"}
            </Toggle>
            <Toggle on={room.attachedBath} onChange={(v) => set("attachedBath", v)}>
              <Bath className="mr-1.5 inline h-3.5 w-3.5 text-rose-500" />
              {room.attachedBath ? "Attached Bathroom" : "Shared / Common Bath"}
            </Toggle>
            <Toggle on={room.isAvailable} onChange={(v) => set("isAvailable", v)}>
              {room.isAvailable ? "✓ Active (Accepting Guests)" : "✕ Full / Inactive"}
            </Toggle>
          </div>
        </div>

        {/* Pricing Model Selection */}
        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/80 p-3 sm:col-span-2 dark:border-slate-750 dark:bg-slate-900/60">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Room Tariff & Pricing Model</p>
            <p className="text-[11px] text-slate-500">Choose how guests pay for this room type</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* Option 1: Standard Nightly Tariff */}
            <button
              type="button"
              onClick={() => onChange({ ...room, isFree: false, donationBased: false })}
              className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                !room.isFree && !room.donationBased
                  ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/30"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Fixed Nightly Rate</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Regular hotel / room tariff (e.g. ₹1,200/night)</p>
            </button>

            {/* Option 2: Donation Based */}
            <button
              type="button"
              onClick={() => onChange({ ...room, isFree: false, donationBased: true })}
              className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                room.donationBased && !room.isFree
                  ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/30"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Donation Based</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">No fixed fee; voluntary contribution / dakshina</p>
            </button>

            {/* Option 3: Completely Free Stay */}
            <button
              type="button"
              onClick={() => onChange({ ...room, isFree: true, donationBased: false, pricePerNight: null })}
              className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                room.isFree
                  ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/30"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">100% Free Stay</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Charitable / pilgrim rest house (₹0/night)</p>
            </button>
          </div>

          {/* Pricing input fields if not 100% free */}
          {!room.isFree && (
            <div className="mt-2 grid grid-cols-1 gap-2 pt-1 min-[400px]:grid-cols-3">
              <label className={label}>
                {room.donationBased ? `Suggested donation (${sym})` : `Per night rate (${sym}) *`}
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={`${input} mt-1`}
                  value={room.pricePerNight ?? ""}
                  onChange={(e) => set("pricePerNight", num(e.target.value))}
                  placeholder={room.donationBased ? "Optional (e.g. 500)" : "1200"}
                />
              </label>
              <label className={label}>
                Weekend rate ({sym})
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={`${input} mt-1`}
                  value={room.weekendPrice ?? ""}
                  onChange={(e) => set("weekendPrice", num(e.target.value))}
                  placeholder="Optional"
                />
              </label>
              <label className={label}>
                Monthly rate ({sym})
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={`${input} mt-1`}
                  value={room.monthlyPrice ?? ""}
                  onChange={(e) => set("monthlyPrice", num(e.target.value))}
                  placeholder="Optional"
                />
              </label>
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <p className={label}>Room features</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ROOM_FEATURES.map((f) => (
              <Toggle key={f} on={room.features.includes(f)} onChange={(v) => set("features", v ? [...room.features, f] : room.features.filter((x) => x !== f))}>
                {f}
              </Toggle>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className={label}>Room photos</p>
          <div className="mt-1.5">
            <PhotoStrip photos={room.photos} onChange={(p) => set("photos", p)} sub="rooms" max={8} />
          </div>
        </div>
        <label className={`${label} sm:col-span-2`}>
          Booking link for this room (optional)
          <input className={`${input} mt-1`} value={room.bookUrl ?? ""} onChange={(e) => set("bookUrl", e.target.value)} placeholder="https://…" />
          {urlErr && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{urlErr}</span>}
        </label>
      </div>
    </div>
  );
}

export function StayEditor({
  stay,
  onSaved,
}: {
  stay?: Stay | null;
  /** When set (staff-assisted mode), called after a save instead of navigating away. */
  onSaved?: (saved: Stay, published: boolean) => void;
}) {
  const router = useRouter();
  const save = useSaveStay();
  // New stays start in the portal country (header switcher); editing keeps the stay's own country.
  const [v, setV] = useState<StayInput>(() => ({
    ...fromStay(stay),
    ...(stay ? {} : { countryCode: typeof document !== "undefined" ? getSelectedCountry() : "IN" }),
  }));
  const set = <K extends keyof StayInput>(k: K, val: StayInput[K]) => setV((x) => ({ ...x, [k]: val }));
  const country = getCountry(v.countryCode);

  const problems = useMemo(() => {
    const p: string[] = [];
    if (v.name.trim().length < 3) p.push("Add the property name");
    if (!v.cityName) p.push("Pick the city");
    if (!v.rooms.length) p.push("Add at least one room type");
    v.rooms.forEach((r, i) => {
      if (r.name.trim().length < 2) p.push(`Name room type ${i + 1}`);
      if (!r.isFree && !r.donationBased && r.pricePerNight == null) p.push(`Set a nightly price for "${r.name || `room ${i + 1}`}"`);
      if (r.bookUrl && bookingUrlError("WEBSITE", r.bookUrl)) p.push(`Fix the booking link of "${r.name || `room ${i + 1}`}"`);
    });
    if (!v.phone && !v.whatsapp) p.push("Add a phone or WhatsApp number");
    v.bookingLinks.forEach((l) => {
      const e = bookingUrlError(l.platform, l.url);
      if (e) p.push(e);
    });
    return p;
  }, [v]);

  const submit = async (publish: boolean) => {
    if (publish && problems.length) {
      toast.error(problems[0]);
      return;
    }
    try {
      const saved = await save.mutateAsync({ id: stay?.id, body: toPayload(v, publish ? true : undefined) });
      toast.success(publish ? "Your stay is live 🎉" : "Draft saved");
      if (onSaved) onSaved(saved, publish);
      else router.push(publish ? `/stays/${saved.slug}` : `/dashboard/stays`);
    } catch (e) {
      toast.error(stayErrorMessage(e));
    }
  };

  const typeInfo = STAY_TYPES.find((t) => t.value === v.type)!;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-40 pt-4">
      <Link href="/dashboard/stays" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-300">
        <ArrowLeft className="h-4 w-4" /> My stays
      </Link>
      <div className="rounded-3xl bg-gradient-to-br from-rose-600 to-amber-500 p-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">{stay ? "Edit stay" : "List a stay — free"}</p>
        <h1 className="mt-1 text-2xl font-black">{v.name || "Your hotel, guest house or dharamshala"}</h1>
        <p className="mt-1 text-sm text-white/90">Add room types with nightly prices. Guests call, WhatsApp or book on your own links.</p>
      </div>

      <Card n={1} title="What kind of stay is it?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STAY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("type", t.value)}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
                v.type === t.value ? "border-rose-600 bg-rose-50 ring-2 ring-rose-600/20 dark:bg-rose-950/40" : "border-slate-200 hover:border-rose-300 dark:border-slate-700"
              }`}
            >
              <t.icon className={`h-5 w-5 ${v.type === t.value ? "text-rose-600" : "text-slate-500"}`} />
              <span className="text-sm font-bold text-slate-900 dark:text-white">{t.label}</span>
              <span className="text-[11px] leading-tight text-slate-500">{t.blurb}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          <label className={label}>
            {typeInfo.label} name *
            <input className={`${input} mt-1`} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder={v.type === "DHARAMSHALA" ? "e.g. Shri Ram Dharamshala" : "e.g. Hotel Ganga View"} />
          </label>
          <label className={label}>
            One-line highlight
            <input className={`${input} mt-1`} value={v.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} maxLength={140} placeholder="e.g. Near the ghat, river view" />
          </label>
          {(v.type === "HOTEL" || v.type === "RESORT") && (
            <div>
              <p className={label}>Star rating</p>
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => set("starRating", v.starRating === s ? null : s)} aria-label={`${s} star`}>
                    <Star className={`h-7 w-7 ${v.starRating && s <= v.starRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className={label}>
            About the property
            <textarea rows={4} className={`${input} mt-1 h-auto py-2`} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="What guests love, nearby places, food, parking…" />
          </label>
        </div>
      </Card>

      <Card n={2} title="Where is it?" hint="Guests search by city and area.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className={label}>Country</p>
            <div className="mt-1">
              <SearchableSelect
                value={v.countryCode}
                onChange={(c) => c && setV((x) => ({ ...x, countryCode: c, cityName: "", locality: "", stateName: "" }))}
                options={COUNTRY_LIST.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
                placeholder="Country"
              />
            </div>
          </div>
          <div>
            <p className={label}>City *</p>
            <div className="mt-1">
              <PropertyListingCitySelector
                value={v.cityName}
                countryCode={v.countryCode}
                onChange={(c) => setV((x) => ({ ...x, cityName: c.name, stateName: c.state ?? "", locality: "", latitude: c.lat ?? null, longitude: c.lng ?? null }))}
              />
            </div>
          </div>
          <div>
            <p className={label}>Area / locality</p>
            <div className="mt-1">
              <PropertyListingLocalitySelector
                value={v.locality ?? ""}
                cityName={v.cityName}
                countryCode={v.countryCode}
                onChange={(l) => setV((x) => ({ ...x, locality: l.name, latitude: l.lat ?? x.latitude, longitude: l.lng ?? x.longitude, pincode: l.pincode ? String(l.pincode) : x.pincode }))}
              />
            </div>
          </div>
          <label className={`${label} sm:col-span-2`}>
            Full address (shown to guests)
            <input className={`${input} mt-1`} value={v.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Street, landmark" />
          </label>
        </div>
      </Card>

      <Card n={3} title="Rooms & nightly prices" hint="Add each room type once — set how many rooms of that type you have.">
        <div className="space-y-3">
          {v.rooms.map((r, i) => (
            <RoomEditor
              key={i}
              room={r}
              index={i}
              cc={v.countryCode}
              onChange={(nr) => set("rooms", v.rooms.map((x, j) => (j === i ? nr : x)))}
              onRemove={() => set("rooms", v.rooms.filter((_, j) => j !== i))}
              onDuplicate={() => set("rooms", [...v.rooms.slice(0, i + 1), { ...r, id: undefined, name: `${r.name} (copy)`, photos: [...r.photos] }, ...v.rooms.slice(i + 1)])}
            />
          ))}
          <button
            type="button"
            onClick={() => set("rooms", [...v.rooms, emptyRoom()])}
            className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"
          >
            <Plus className="h-4 w-4" /> Add another room type
          </button>
        </div>
      </Card>

      <Card n={4} title="Property photos" hint="Front, reception, lobby, dining, view. The first photo is the cover.">
        <PhotoStrip photos={v.photos} onChange={(p) => setV((x) => ({ ...x, photos: p, coverImage: p[0] ?? null }))} sub="property" max={20} />
      </Card>

      <Card n={5} title="Facilities & house rules">
        <div className="flex flex-wrap gap-1.5">
          {FACILITIES.map((f) => (
            <Toggle key={f.value} on={v.facilities.includes(f.value)} onChange={(on) => set("facilities", on ? [...v.facilities, f.value] : v.facilities.filter((x) => x !== f.value))}>
              {f.label}
            </Toggle>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <label className={label}>
            Check-in
            <input type="time" className={`${input} mt-1`} value={v.checkInTime ?? ""} onChange={(e) => set("checkInTime", e.target.value)} />
          </label>
          <label className={label}>
            Check-out
            <input type="time" className={`${input} mt-1`} value={v.checkOutTime ?? ""} onChange={(e) => set("checkOutTime", e.target.value)} />
          </label>
          <label className={label}>
            Gate closes
            <input type="time" className={`${input} mt-1`} value={v.curfewTime ?? ""} onChange={(e) => set("curfewTime", e.target.value)} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Toggle on={v.idRequired} onChange={(x) => set("idRequired", x)}>
            ID required
          </Toggle>
          <Toggle on={v.coupleFriendly} onChange={(x) => set("coupleFriendly", x)}>
            Couple friendly
          </Toggle>
          <Toggle on={v.familyOnly} onChange={(x) => set("familyOnly", x)}>
            Families only
          </Toggle>
          <Toggle on={v.petsAllowed} onChange={(x) => set("petsAllowed", x)}>
            Pets allowed
          </Toggle>
          <Toggle on={v.alcoholAllowed} onChange={(x) => set("alcoholAllowed", x)}>
            Alcohol allowed
          </Toggle>
        </div>
        <label className={`${label} mt-3 block`}>
          Other rules
          <textarea rows={3} className={`${input} mt-1 h-auto py-2`} value={v.houseRules ?? ""} onChange={(e) => set("houseRules", e.target.value)} placeholder="e.g. Max 3 nights, veg only" />
        </label>
      </Card>

      <Card n={6} title="Contact & booking links" hint="Guests reach you directly. Add your Booking.com, Agoda or website links so they can book there.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Phone *
            <input type="tel" className={`${input} mt-1`} value={v.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder={`${country.phoneCode} ${country.phoneExample}`} />
          </label>
          <label className={label}>
            WhatsApp
            <input type="tel" className={`${input} mt-1`} value={v.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Same as phone" />
          </label>
        </div>
        <div className="mt-4 space-y-2">
          <p className={`${label} flex items-center gap-1`}>
            <Link2 className="h-3.5 w-3.5" /> Booking links
          </p>
          {v.bookingLinks.map((l, i) => {
            const err = bookingUrlError(l.platform, l.url);
            return (
              <div key={i} className="rounded-2xl border border-slate-200 p-2 dark:border-slate-700">
                <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex">
                  <select
                    className={`${input} sm:w-44 sm:shrink-0`}
                    value={l.platform}
                    onChange={(e) => set("bookingLinks", v.bookingLinks.map((x, j) => (j === i ? { ...x, platform: e.target.value } : x)))}
                  >
                    {BOOKING_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    inputMode="url"
                    className={`${input} col-span-2 row-start-2 sm:col-auto sm:row-auto`}
                    value={l.url}
                    onChange={(e) => set("bookingLinks", v.bookingLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                    placeholder="https://…"
                  />
                  <button type="button" onClick={() => set("bookingLinks", v.bookingLinks.filter((_, j) => j !== i))} aria-label="Remove link" className="col-start-2 row-start-1 flex h-11 w-11 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 sm:order-last">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {err && <p className="mt-1 px-1 text-[11px] font-semibold text-rose-600">{err}</p>}
              </div>
            );
          })}
          {v.bookingLinks.length < 8 && (
            <button
              type="button"
              onClick={() => set("bookingLinks", [...v.bookingLinks, { platform: v.bookingLinks.length ? "BOOKING_COM" : "WEBSITE", url: "" }])}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <Plus className="h-3.5 w-3.5" /> Add booking link
            </button>
          )}
          <p className="text-[11px] text-slate-500">Links must be your own listing on that site. We check the website matches the platform you choose.</p>
        </div>
      </Card>

      {/* Sticky actions */}
      <div className="fixed inset-x-0 bottom-[64px] z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:bottom-0 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <p className="hidden min-w-0 flex-1 truncate text-xs text-slate-500 sm:block">
            {problems.length ? `To publish: ${problems[0]}` : "Ready to publish ✓"}
          </p>
          {stay?.slug && (
            <Link href={`/stays/${stay.slug}`} target="_blank" className="inline-flex h-11 items-center gap-1 rounded-2xl px-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <ExternalLink className="h-4 w-4" /> Preview
            </Link>
          )}
          <button type="button" disabled={save.isPending} onClick={() => submit(false)} className="h-11 flex-1 rounded-2xl border border-slate-300 px-4 text-sm font-bold text-slate-800 sm:flex-none dark:border-slate-700 dark:text-white">
            Save draft
          </button>
          <button type="button" disabled={save.isPending} onClick={() => submit(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-rose-600 px-5 text-sm font-bold text-white disabled:opacity-60 sm:flex-none">
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BedDouble className="h-4 w-4" />}
            {stay?.status === "PUBLISHED" ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
