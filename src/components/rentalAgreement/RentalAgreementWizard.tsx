"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Download, Eye, FileText, Home, Loader2,
  Plus, RotateCcw, Trash2, X,
} from "lucide-react";
import { COUNTRY_LIST, getCountry, type CountryCode } from "@/config/countries";
import { getSelectedCountry } from "@/lib/country/countryStore";
import { buildAgreement, endDate, formatDate } from "@/features/rentalAgreement/buildAgreement";
import { getJurisdiction } from "@/features/rentalAgreement/jurisdictions";
import { downloadAgreementPdf, hasUnsupportedChars } from "@/features/rentalAgreement/pdf";
import type { AgreementDoc, AgreementInput, AgreementParty } from "@/features/rentalAgreement/types";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";

const DRAFT_KEY = "awasio_rental_agreement_draft_v1";
const STEPS = ["Basics", "Parties", "Rent & dates", "Rules", "Review"] as const;
const SUPPORTED: CountryCode[] = ["IN", "NP", "BD", "LK", "SG", "AE", "GB", "IE", "AU", "NZ"];
const FIXTURE_SUGGESTIONS = ["Fans", "Lights", "Geyser", "Air conditioner", "Wardrobe", "Bed", "Sofa", "Refrigerator", "Washing machine", "Modular kitchen", "Curtains", "TV"];

const today = () => new Date().toISOString().slice(0, 10);
const firstOfNextMonth = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1)).toISOString().slice(0, 10);
};
const emptyParty = (): AgreementParty => ({ name: "", relation: "", address: "", phone: "", email: "", idNumber: "" });

function defaultInput(country: CountryCode): AgreementInput {
  const pack = getJurisdiction(country);
  return {
    country,
    region: "",
    city: "",
    agreementDate: today(),
    landlords: [emptyParty()],
    tenants: [emptyParty()],
    propertyAddress: "",
    propertyType: "APARTMENT",
    configuration: "",
    areaSqft: "",
    furnishing: "SEMI",
    parking: false,
    use: "RESIDENTIAL",
    rent: 0,
    rentDueDay: 5,
    deposit: 0,
    maintenance: "INCLUDED",
    maintenanceAmount: 0,
    paymentMethod: "BANK",
    startDate: firstOfNextMonth(),
    durationMonths: pack.defaults.durationMonths,
    escalationPct: pack.defaults.escalationPct,
    noticeMonths: pack.defaults.noticeMonths,
    lockInMonths: pack.defaults.lockInMonths,
    utilities: "TENANT",
    petsAllowed: false,
    smokingAllowed: false,
    sublettingAllowed: false,
    fixtures: [],
    extraClauses: [],
    witnesses: true,
  };
}

function loadDraft(): AgreementInput {
  const country = SUPPORTED.includes(getSelectedCountry()) ? getSelectedCountry() : "IN";
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...defaultInput(country), ...(JSON.parse(raw) as Partial<AgreementInput>) };
  } catch {
    // corrupt or unavailable storage: start fresh
  }
  return defaultInput(country);
}

/* ----------------------------------------------------------------- small form kit */

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-rose-900/40";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

function Choice<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
            value === o.value
              ? "border-rose-600 bg-rose-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      aria-pressed={checked}
    >
      <span>{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

const num = (v: string) => {
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* ----------------------------------------------------------------- preview */

function AgreementPreview({ doc }: { doc: AgreementDoc }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 font-serif text-[13px] leading-relaxed text-slate-800 shadow-sm sm:p-7 dark:border-slate-700 dark:bg-slate-50">
      <h2 className="text-center text-lg font-bold uppercase tracking-wide text-slate-950">{doc.title}</h2>
      {doc.subtitle && <p className="mt-1 text-center text-xs text-slate-500">{doc.subtitle}</p>}
      <div className="mt-4 space-y-2.5">
        {doc.preamble.map((p, i) => (
          <p key={i} className="text-justify">{p}</p>
        ))}
      </div>
      <p className="mt-4 font-bold">NOW THIS AGREEMENT WITNESSES AS FOLLOWS:</p>
      <ol className="mt-2 space-y-3">
        {doc.clauses.map((c, i) => (
          <li key={c.heading + i}>
            <p className="font-bold">{i + 1}. {c.heading}</p>
            {c.body.map((b, j) => (
              <p key={j} className="mt-1 pl-4 text-justify">{i + 1}.{j + 1}&nbsp; {b}</p>
            ))}
          </li>
        ))}
      </ol>
      {doc.schedule && (
        <div className="mt-4">
          <p className="font-bold">{doc.schedule.heading}</p>
          <p className="mt-1 pl-4">{doc.schedule.items.join(", ")}</p>
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-6">
        {doc.signatures.map((s, i) => (
          <div key={i} className="pt-6">
            <div className="border-t border-slate-400 pt-1 text-xs">
              <p className="font-bold">{s.label}</p>
              <p>{s.name || "Name"}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-slate-200 pt-3 text-[11px] text-slate-500">{doc.footnote}</p>
    </article>
  );
}

/* ----------------------------------------------------------------- wizard */

export function RentalAgreementWizard() {
  const [input, setInput] = useState<AgreementInput>(loadDraft);
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  // Phones show one pane at a time; desktop shows both side by side.
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [fixtureDraft, setFixtureDraft] = useState("");
  const [clauseDraft, setClauseDraft] = useState("");

  const pack = getJurisdiction(input.country);
  const country = getCountry(input.country);
  const doc = useMemo(() => buildAgreement(input), [input]);

  // Auto-save the draft (this device only; nothing is sent to our servers).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(input));
      } catch {
        // storage full / private mode: drafts just won't persist
      }
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  const set = <K extends keyof AgreementInput>(key: K, value: AgreementInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setDownloaded(false);
  };
  const setParty = (list: "landlords" | "tenants", i: number, patch: Partial<AgreementParty>) =>
    set(list, input[list].map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const changeCountry = (code: CountryCode) => {
    const fresh = defaultInput(code);
    setInput((prev) => ({
      ...prev,
      country: code,
      region: "",
      durationMonths: fresh.durationMonths,
      noticeMonths: fresh.noticeMonths,
      escalationPct: fresh.escalationPct,
      lockInMonths: fresh.lockInMonths,
    }));
  };

  /* validation per step */
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!input.city.trim()) e.city = "Enter the city";
    input.landlords.forEach((p, i) => {
      if (!p.name.trim()) e[`landlords.${i}.name`] = "Name is required";
      if (!p.address.trim()) e[`landlords.${i}.address`] = "Address is required";
    });
    input.tenants.forEach((p, i) => {
      if (!p.name.trim()) e[`tenants.${i}.name`] = "Name is required";
      if (!p.address.trim()) e[`tenants.${i}.address`] = "Permanent address is required";
    });
    if (!input.propertyAddress.trim()) e.propertyAddress = "Enter the rented property's full address";
    if (!(input.rent > 0)) e.rent = "Enter the monthly rent";
    if (!input.startDate) e.startDate = "Pick a start date";
    if (!(input.durationMonths >= 1 && input.durationMonths <= 120)) e.durationMonths = "Between 1 and 120 months";
    if (input.rentDueDay < 1 || input.rentDueDay > 28) e.rentDueDay = "Day 1 to 28";
    return e;
  }, [input]);

  const stepFields: string[][] = [
    ["city"],
    Object.keys(errors).filter((k) => k.startsWith("landlords.") || k.startsWith("tenants.")),
    ["propertyAddress", "rent", "startDate", "durationMonths", "rentDueDay"],
    [],
    [],
  ];
  const stepValid = (s: number) => stepFields[s].every((k) => !errors[k]);
  const err = (k: string) => (showErrors ? errors[k] : undefined);

  const next = () => {
    if (!stepValid(step)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setShowErrors(false);
    setStep((s) => Math.max(s - 1, 0));
  };

  const allText = JSON.stringify([input.landlords, input.tenants, input.propertyAddress, input.city, input.region, input.configuration, input.fixtures, input.extraClauses]);
  const scriptProblem = hasUnsupportedChars(allText);

  const download = async () => {
    if (Object.keys(errors).length) {
      const first = STEPS.findIndex((_, s) => !stepValid(s));
      setShowErrors(true);
      setStep(first < 0 ? 0 : first);
      return;
    }
    if (scriptProblem) return;
    setDownloading(true);
    try {
      const tenant = (input.tenants[0]?.name || "tenant").trim().replace(/[^\w]+/g, "-").toLowerCase();
      await downloadAgreementPdf(doc, `rental-agreement-${tenant}-${input.startDate}.pdf`);
      setDownloaded(true);
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    if (!window.confirm("Clear all details and start a new agreement?")) return;
    setInput(defaultInput(input.country));
    setStep(0);
    setShowErrors(false);
    setDownloaded(false);
  };

  const moneyHint = (n: number) => (n > 0 ? `${pack.money} ${new Intl.NumberFormat(country.locale).format(n)}` : undefined);

  /* ----------------------------------------------------------- step bodies */

  const partyCards = (list: "landlords" | "tenants", role: string) => (
    <div className="space-y-4">
      {input[list].map((p, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {role} {input[list].length > 1 ? i + 1 : ""}
            </p>
            {input[list].length > 1 && (
              <button
                type="button"
                onClick={() => set(list, input[list].filter((_, idx) => idx !== i))}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" error={err(`${list}.${i}.name`)}>
              <input className={inputCls} value={p.name} onChange={(e) => setParty(list, i, { name: e.target.value })} placeholder="As on ID proof" autoComplete="off" />
            </Field>
            <Field label={pack.relationLabel}>
              <input className={inputCls} value={p.relation ?? ""} onChange={(e) => setParty(list, i, { relation: e.target.value })} placeholder={input.country === "IN" ? "S/o Ramesh Kumar" : ""} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={list === "tenants" ? "Permanent address" : "Address"} error={err(`${list}.${i}.address`)}>
                <textarea className={`${inputCls} min-h-[70px]`} value={p.address} onChange={(e) => setParty(list, i, { address: e.target.value })} />
              </Field>
            </div>
            <Field label={pack.idLabel}>
              <input className={inputCls} value={p.idNumber ?? ""} onChange={(e) => setParty(list, i, { idNumber: e.target.value })} />
            </Field>
            <Field label="Phone (optional)">
              <input className={inputCls} value={p.phone ?? ""} onChange={(e) => setParty(list, i, { phone: e.target.value })} inputMode="tel" />
            </Field>
          </div>
        </div>
      ))}
      {input[list].length < 4 && (
        <button
          type="button"
          onClick={() => set(list, [...input[list], emptyParty()])}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus className="h-3.5 w-3.5" /> Add another {role.toLowerCase()}
        </button>
      )}
    </div>
  );

  const body = [
    /* 0 Basics */
    <div key="basics" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country">
          <SearchableSelect
            value={input.country}
            onChange={(v) => v && changeCountry(v as CountryCode)}
            options={COUNTRY_LIST.filter((c) => SUPPORTED.includes(c.code)).map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
            placeholder="Select country"
            searchPlaceholder="Search country..."
            emptyMessage="No matching country"
          />
        </Field>
        <Field label={pack.regionLabel}>
          {pack.regions.length ? (
            <SearchableSelect
              value={input.region}
              onChange={(v) => setInput((prev) => ({ ...prev, region: v, city: v === prev.region ? prev.city : "" }))}
              options={pack.regions}
              placeholder={`Select ${pack.regionLabel.toLowerCase()}`}
              searchPlaceholder={`Search ${pack.regionLabel.toLowerCase()}...`}
              emptyMessage={`No matching ${pack.regionLabel.toLowerCase()}`}
            />
          ) : (
            <input className={inputCls} value={input.region} onChange={(e) => set("region", e.target.value)} />
          )}
        </Field>
        <Field label="City" error={err("city")}>
          <PropertyListingCitySelector
            value={input.city}
            selectedState={input.region}
            countryCode={input.country}
            hasError={Boolean(err("city"))}
            onChange={(c) =>
              setInput((prev) => ({
                ...prev,
                city: c.name,
                // Picking a city first fills in its state, as in the listing form.
                region: prev.region || (c.state && pack.regions.includes(c.state) ? c.state : prev.region),
              }))
            }
          />
        </Field>
        <Field label="Agreement date">
          <input type="date" className={inputCls} value={input.agreementDate} onChange={(e) => set("agreementDate", e.target.value)} />
        </Field>
      </div>
      <Field label="What are you renting?">
        <Choice
          value={input.use}
          onChange={(v) => {
            set("use", v);
            if (v === "COMMERCIAL" && !["SHOP", "OFFICE"].includes(input.propertyType)) set("propertyType", "SHOP");
            if (v === "RESIDENTIAL" && ["SHOP", "OFFICE"].includes(input.propertyType)) set("propertyType", "APARTMENT");
          }}
          options={[{ value: "RESIDENTIAL", label: "A home" }, { value: "COMMERCIAL", label: "Shop / office" }]}
        />
      </Field>
      <Field label="Property type">
        <Choice
          value={input.propertyType}
          onChange={(v) => set("propertyType", v)}
          options={
            input.use === "COMMERCIAL"
              ? [{ value: "SHOP", label: "Shop" }, { value: "OFFICE", label: "Office" }]
              : [{ value: "APARTMENT", label: "Apartment / flat" }, { value: "HOUSE", label: "House / villa" }, { value: "ROOM", label: "Room / PG" }]
          }
        />
      </Field>
      <Field label="Furnishing">
        <Choice
          value={input.furnishing}
          onChange={(v) => set("furnishing", v)}
          options={[{ value: "UNFURNISHED", label: "Unfurnished" }, { value: "SEMI", label: "Semi-furnished" }, { value: "FULL", label: "Fully furnished" }]}
        />
      </Field>
      {pack.mode !== "generate" && (
        <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {pack.mode === "official"
              ? `In ${country.name}, tenancies use an official standard contract. This tool creates a clear terms addendum to attach to it.`
              : `In ${country.name}, tenancy law sets required terms and registration steps. Check them before signing (see Review).`}
          </p>
        </div>
      )}
    </div>,

    /* 1 Parties */
    <div key="parties" className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">{input.use === "COMMERCIAL" ? "Lessor (owner)" : "Landlord (owner)"}</h3>
        {partyCards("landlords", input.use === "COMMERCIAL" ? "Lessor" : "Landlord")}
      </section>
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">{input.use === "COMMERCIAL" ? "Lessee" : "Tenant"}</h3>
        {partyCards("tenants", input.use === "COMMERCIAL" ? "Lessee" : "Tenant")}
      </section>
    </div>,

    /* 2 Rent & dates */
    <div key="rent" className="space-y-5">
      <Field label="Rented property address" error={err("propertyAddress")} hint="Flat/house number, building, street, locality, city, PIN">
        <textarea className={`${inputCls} min-h-[70px]`} value={input.propertyAddress} onChange={(e) => set("propertyAddress", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Configuration" hint="e.g. 2 BHK, Studio, Shop no. 4">
          <input className={inputCls} value={input.configuration} onChange={(e) => set("configuration", e.target.value)} />
        </Field>
        <Field label="Area in sq. ft. (optional)">
          <input className={inputCls} value={input.areaSqft} onChange={(e) => set("areaSqft", e.target.value.replace(/[^\d.,]/g, ""))} inputMode="numeric" />
        </Field>
        <Field label={`Monthly rent (${pack.money})`} error={err("rent")} hint={moneyHint(input.rent)}>
          <input className={inputCls} value={input.rent || ""} onChange={(e) => set("rent", num(e.target.value))} inputMode="numeric" placeholder="20000" />
        </Field>
        <Field label={`Security deposit (${pack.money})`} hint={moneyHint(input.deposit) ?? (input.rent ? `Common: ${pack.defaults.depositMonths} month(s) rent` : undefined)}>
          <div className="flex gap-2">
            <input className={inputCls} value={input.deposit || ""} onChange={(e) => set("deposit", num(e.target.value))} inputMode="numeric" />
            {input.rent > 0 && (
              <button type="button" onClick={() => set("deposit", input.rent * pack.defaults.depositMonths)} className="shrink-0 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-rose-400 dark:border-slate-700 dark:text-slate-300">
                {pack.defaults.depositMonths}× rent
              </button>
            )}
          </div>
        </Field>
        <Field label="Start date" error={err("startDate")}>
          <input type="date" className={inputCls} value={input.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="Duration (months)" error={err("durationMonths")} hint={input.startDate && input.durationMonths ? `Ends on ${formatDate(endDate(input.startDate, input.durationMonths))}` : undefined}>
          <input className={inputCls} value={input.durationMonths || ""} onChange={(e) => set("durationMonths", num(e.target.value))} inputMode="numeric" />
        </Field>
        <Field label="Rent due by (day of month)" error={err("rentDueDay")}>
          <input className={inputCls} value={input.rentDueDay || ""} onChange={(e) => set("rentDueDay", num(e.target.value))} inputMode="numeric" />
        </Field>
        <Field label="Rent increase on renewal (%)">
          <input className={inputCls} value={input.escalationPct} onChange={(e) => set("escalationPct", num(e.target.value))} inputMode="decimal" />
        </Field>
      </div>
      {input.country === "IN" && input.durationMonths >= 12 && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Agreements of 12 months or more generally need registration at the Sub-Registrar office. Choose 11 months to avoid this, if that suits you.
        </p>
      )}
      <Field label="Society / building maintenance">
        <Choice
          value={input.maintenance}
          onChange={(v) => set("maintenance", v)}
          options={[{ value: "INCLUDED", label: "Included in rent" }, { value: "TENANT", label: "Paid by tenant" }, { value: "NONE", label: "Not applicable" }]}
        />
      </Field>
      {input.maintenance === "TENANT" && (
        <Field label={`Approx. maintenance per month (${pack.money}, optional)`}>
          <input className={inputCls} value={input.maintenanceAmount || ""} onChange={(e) => set("maintenanceAmount", num(e.target.value))} inputMode="numeric" />
        </Field>
      )}
      <Field label="Rent paid by">
        <Choice
          value={input.paymentMethod}
          onChange={(v) => set("paymentMethod", v)}
          options={[
            { value: "BANK", label: "Bank transfer" },
            ...(input.country === "IN" ? [{ value: "UPI" as const, label: "UPI" }] : []),
            { value: "CHEQUE", label: "Cheque" },
            { value: "CASH", label: "Cash" },
            { value: "ANY", label: "Any" },
          ]}
        />
      </Field>
    </div>,

    /* 3 Rules */
    <div key="rules" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Notice period (months)">
          <input className={inputCls} value={input.noticeMonths || ""} onChange={(e) => set("noticeMonths", num(e.target.value))} inputMode="numeric" />
        </Field>
        <Field label="Lock-in period (months)" hint="Neither side can exit early. 0 = none">
          <input className={inputCls} value={input.lockInMonths} onChange={(e) => set("lockInMonths", num(e.target.value))} inputMode="numeric" />
        </Field>
      </div>
      <Field label="Electricity, water & other bills">
        <Choice
          value={input.utilities}
          onChange={(v) => set("utilities", v)}
          options={[{ value: "TENANT", label: "Tenant pays" }, { value: "LANDLORD", label: "Included in rent" }, { value: "SHARED", label: "Shared" }]}
        />
      </Field>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {input.use === "RESIDENTIAL" && <Toggle label="Pets allowed" checked={input.petsAllowed} onChange={(v) => set("petsAllowed", v)} />}
        {input.use === "RESIDENTIAL" && <Toggle label="Smoking allowed inside" checked={input.smokingAllowed} onChange={(v) => set("smokingAllowed", v)} />}
        <Toggle label="Subletting allowed (with consent)" checked={input.sublettingAllowed} onChange={(v) => set("sublettingAllowed", v)} />
        <Toggle label="Parking included" checked={input.parking} onChange={(v) => set("parking", v)} />
        <Toggle label="Add witness signature lines" checked={input.witnesses} onChange={(v) => set("witnesses", v)} />
      </div>
      {input.furnishing !== "UNFURNISHED" && (
        <Field label="Fixtures & furnishings provided" hint="Tap to add, or type your own">
          <div className="flex flex-wrap gap-1.5">
            {FIXTURE_SUGGESTIONS.filter((f) => !input.fixtures.includes(f)).map((f) => (
              <button key={f} type="button" onClick={() => set("fixtures", [...input.fixtures, f])} className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300">
                + {f}
              </button>
            ))}
          </div>
          {input.fixtures.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {input.fixtures.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {f}
                  <button type="button" aria-label={`Remove ${f}`} onClick={() => set("fixtures", input.fixtures.filter((x) => x !== f))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-2.5 flex gap-2">
            <input className={inputCls} value={fixtureDraft} onChange={(e) => setFixtureDraft(e.target.value)} placeholder="e.g. 2 ceiling fans" onKeyDown={(e) => {
              if (e.key === "Enter" && fixtureDraft.trim()) {
                e.preventDefault();
                set("fixtures", [...input.fixtures, fixtureDraft.trim()]);
                setFixtureDraft("");
              }
            }} />
            <button type="button" onClick={() => { if (fixtureDraft.trim()) { set("fixtures", [...input.fixtures, fixtureDraft.trim()]); setFixtureDraft(""); } }} className="shrink-0 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">Add</button>
          </div>
        </Field>
      )}
      <Field label="Any other terms (optional)" hint="One term per entry, in plain words">
        {input.extraClauses.map((c, i) => (
          <div key={i} className="mb-2 flex items-start gap-2 rounded-xl bg-slate-50 p-2.5 text-sm dark:bg-slate-900">
            <span className="min-w-0 flex-1">{c}</span>
            <button type="button" aria-label="Remove term" onClick={() => set("extraClauses", input.extraClauses.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input className={inputCls} value={clauseDraft} onChange={(e) => setClauseDraft(e.target.value)} placeholder="e.g. Tenant will repaint the walls before leaving" />
          <button type="button" onClick={() => { if (clauseDraft.trim()) { set("extraClauses", [...input.extraClauses, clauseDraft.trim()]); setClauseDraft(""); } }} className="shrink-0 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">Add</button>
        </div>
      </Field>
    </div>,

    /* 4 Review */
    <div key="review" className="space-y-5">
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[
          ["Rent", moneyHint(input.rent) ?? "-"],
          ["Deposit", moneyHint(input.deposit) ?? "-"],
          ["Starts", formatDate(input.startDate)],
          ["Duration", `${input.durationMonths} months`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
            <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{v}</p>
          </div>
        ))}
      </div>
      {scriptProblem && (
        <div className="flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Some details use characters the PDF can&apos;t print (for example non-English script or emoji). Please type names and addresses in English letters.</p>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Before you sign in {country.name}</p>
        <ul className="mt-2 space-y-1.5">
          {pack.validity.map((v) => (
            <li key={v} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {v}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-400">General guidance, last reviewed {pack.lastReviewed}. Not legal advice.</p>
      </div>
    </div>,
  ];

  /* ----------------------------------------------------------- layout */

  const switchView = (v: "form" | "preview") => {
    setMobileView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
      {/* Form | Preview switch (phones) */}
      <div className="sticky top-14 z-30 -mx-4 bg-slate-50/95 px-4 py-2 backdrop-blur lg:hidden dark:bg-slate-950/95">
        <div className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="tablist" aria-label="Form or preview">
          {(["form", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={mobileView === v}
              onClick={() => switchView(v)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition ${
                mobileView === v ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {v === "form" ? <FileText className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {v === "form" ? `Form · ${step + 1}/${STEPS.length}` : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <div className={`min-w-0 ${mobileView === "preview" ? "hidden lg:block" : ""}`}>
        {/* Stepper */}
        <ol className="-mx-4 mb-3 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mb-5 sm:px-0">
          {STEPS.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => (i <= step || STEPS.slice(0, i).every((_, j) => stepValid(j))) && setStep(i)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  i === step
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : i < step
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                {s}
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-3 bg-slate-300 dark:bg-slate-700" />}
            </li>
          ))}
        </ol>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
          {body[step]}

          {showErrors && !stepValid(step) && (
            <p className="mt-4 text-xs font-semibold text-rose-600">Please fill the highlighted fields to continue.</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {step > 0 && (
              <button type="button" onClick={back} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={download} disabled={downloading || scriptProblem} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Saved automatically on this device. Nothing is uploaded.</span>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold hover:text-rose-600">
              <RotateCcw className="h-3 w-3" /> Start over
            </button>
          </div>
        </div>

        {downloaded && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Your agreement is downloaded
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link href="/propertyListing" className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm hover:text-rose-600 dark:bg-slate-900 dark:text-slate-200">
                <Home className="h-4 w-4 text-rose-500" /> Owner? List your next property free
              </Link>
              <Link href={`/rent${input.city ? `/${input.city.trim().toLowerCase().replace(/\s+/g, "-")}` : ""}`} className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm hover:text-rose-600 dark:bg-slate-900 dark:text-slate-200">
                <FileText className="h-4 w-4 text-rose-500" /> Still searching? Browse rentals{input.city ? ` in ${input.city}` : ""}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Live preview: side panel on desktop; the "Preview" tab on phones */}
      <aside className={`${mobileView === "preview" ? "block" : "hidden"} lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto`}>
        <p className="mb-2 hidden text-xs font-bold uppercase tracking-wider text-slate-400 lg:block">Live preview</p>
        <AgreementPreview doc={doc} />
        <div className="mt-4 grid gap-2 lg:hidden">
          {step === STEPS.length - 1 ? (
            <button type="button" onClick={download} disabled={downloading || scriptProblem} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
            </button>
          ) : null}
          <button type="button" onClick={() => switchView("form")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <ArrowLeft className="h-4 w-4" /> Back to form
          </button>
        </div>
      </aside>
    </div>
  );
}
