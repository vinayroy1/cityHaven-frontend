// Server-rendered stamp duty pages: /stamp-duty-calculator (all states) and /stamp-duty-calculator/[state].
import Link from "next/link";
import { ExternalLink, Landmark, MapPin, ShieldCheck } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { SOURCES, STAMP_DUTY_STATES, computeDuty, type StateDuty } from "@/features/stampDuty/data";
import { StampDutyCalculator } from "./StampDutyCalculator";

export const STAMP_BASE = "/stamp-duty-calculator";
export const RATES_AS_OF = "November 2026";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

const CONFIDENCE: Record<StateDuty["confidence"], { label: string; cls: string }> = {
  "two-sources": { label: "Confirmed by 2 sources", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  "single-source": { label: "Single source", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  conflicting: { label: "Sources differ", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
};

export function stateFaqs(s: StateDuty) {
  const ex = computeDuty(s, 5000000, "male", s.areas?.[0]?.id ?? "");
  const exF = computeDuty(s, 5000000, "female", s.areas?.[0]?.id ?? "");
  return [
    {
      q: `What is the stamp duty in ${s.name} in 2026?`,
      a: `Men: ${s.summary.men}. Women: ${s.summary.women}. Joint (man + woman): ${s.summary.joint}. Registration: ${s.summary.registration}.${s.summary.other ? ` Other charges: ${s.summary.other}.` : ""}`,
    },
    { q: `How much stamp duty do I pay on a ₹50 lakh property in ${s.name}?`, a: `About ${inr(ex.total)} in total for a man${s.areas ? ` (${s.areas[0].label})` : ""}, and ${inr(exF.total)} for a woman buyer, including registration where it is a percentage fee.` },
    { q: `Do women pay less stamp duty in ${s.name}?`, a: s.summary.women === s.summary.men || s.summary.women === "Same as men" ? `No. ${s.name} charges women the same stamp duty as men.` : `Yes. Women buyers pay ${s.summary.women}, compared with ${s.summary.men} for men.` },
    { q: "On which value is stamp duty charged?", a: "On the higher of the sale price (agreement value) and the government circle rate / guideline value of the property." },
  ];
}

function FaqJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  const data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

function Shell({ crumbs, title, intro, children }: { crumbs: { label: string; href?: string }[]; title: React.ReactNode; intro: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-rose-50 via-white to-amber-50/60 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="relative mx-auto max-w-6xl px-4 pb-4 pt-2 sm:px-6 sm:pb-10 sm:pt-4 lg:px-8">
            <PageBreadcrumbs items={crumbs} renderJsonLd />
            <span className="mt-3 hidden sm:inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 sm:mt-6 sm:text-xs dark:border-rose-900/60 dark:bg-slate-900/70 dark:text-rose-300">
              <Landmark className="h-3.5 w-3.5" /> Rates as of {RATES_AS_OF}
            </span>
            <h1 className="mt-1.5 text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white">{title}</h1>
            <p className="mt-2 hidden max-w-2xl text-sm sm:block leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">{intro}</p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-4 sm:space-y-12 sm:px-6 sm:py-10 lg:px-8">{children}</div>
      </main>
      <FooterLinks />
    </div>
  );
}

function SourcesBox({ s }: { s?: StateDuty }) {
  const keys = s ? s.sources : (["A", "B"] as const);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Sources and accuracy
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Rates are compiled from published 2026 state-wise guides and cross-checked against each other. States change rates by notification, so confirm the final amount with the sub-registrar office or your state&apos;s registration (IGR) portal before you pay.
      </p>
      <ul className="mt-3 space-y-1.5">
        {keys.map((k) => (
          <li key={k}>
            <a href={SOURCES[k].url} target="_blank" rel="nofollow noopener noreferrer" className="inline-flex items-center gap-1.5 text-rose-700 hover:underline dark:text-rose-400">
              {SOURCES[k].label} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StateLinks({ current }: { current?: string }) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Stamp duty by state</h2>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {STAMP_DUTY_STATES.filter((x) => x.slug !== current).map((x) => (
          <li key={x.slug}>
            <Link href={`${STAMP_BASE}/${x.slug}`} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {x.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StampDutyIndexView() {
  const faqs = [
    { q: "What is stamp duty?", a: "Stamp duty is a state tax paid by the buyer when a property sale deed is registered. Each state sets its own rate, usually between 3% and 8% of the property value." },
    { q: "Which state has the lowest stamp duty?", a: "Among the states we cover, Sikkim (1%) and Mizoram (3%) have the lowest rates; Goa starts at 3% for properties up to ₹50 lakh." },
    { q: "Do women pay less stamp duty?", a: "In many states, yes: for example Delhi, Haryana, Punjab, Uttar Pradesh, Rajasthan, Maharashtra (sole woman buyer) and Odisha charge women 1–2% less." },
    { q: "On which value is stamp duty charged?", a: "On the higher of the sale price and the government circle rate / guideline value of the property." },
  ];
  return (
    <Shell
      crumbs={[{ label: "Stamp duty calculator" }]}
      title="Stamp Duty & Registration Charges Calculator 2026"
      intro="Pick your state, enter the property value and buyer type to see stamp duty, registration fee and other charges for all Indian states."
    >
      <FaqJsonLd faqs={faqs} />
      <StampDutyCalculator />
      <section>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">State-wise stamp duty and registration charges 2026</h2>
        <ul className="mt-4 space-y-2 sm:hidden">
          {STAMP_DUTY_STATES.map((s) => (
            <li key={s.slug}>
              <Link href={`${STAMP_BASE}/${s.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-3.5 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <span className="flex items-center justify-between text-[15px] font-semibold text-slate-900 dark:text-white">
                  {s.name}
                  <span className="text-xs font-medium text-rose-600">Calculate →</span>
                </span>
                <span className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  {([["Men", s.summary.men], ["Women", s.summary.women], ["Registration", s.summary.registration]] as const).map(([k, v]) => (
                    <span key={k} className="min-w-0 rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-500">{k}</span>
                      <span className="block font-medium text-slate-800 dark:text-slate-200">{v}</span>
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Men</th>
                <th className="px-4 py-3 font-semibold">Women</th>
                <th className="px-4 py-3 font-semibold">Joint</th>
                <th className="px-4 py-3 font-semibold">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {STAMP_DUTY_STATES.map((s) => (
                <tr key={s.slug} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`${STAMP_BASE}/${s.slug}`} className="text-rose-700 hover:underline dark:text-rose-400">{s.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.summary.men}{s.summary.other ? <span className="block text-xs text-slate-500">{s.summary.other}</span> : null}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.summary.women}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.summary.joint}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.summary.registration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">Residential sale deeds. Union territories other than Delhi are not covered yet.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <SourcesBox />
    </Shell>
  );
}

export function StampDutyStateView({ s }: { s: StateDuty }) {
  const faqs = stateFaqs(s);
  const area0 = s.areas?.[0]?.id ?? "";
  const examples = [2500000, 5000000, 10000000].map((v) => ({
    v,
    men: computeDuty(s, v, "male", area0).total,
    women: computeDuty(s, v, "female", area0).total,
  }));
  const conf = CONFIDENCE[s.confidence];
  return (
    <Shell
      crumbs={[{ label: "Stamp duty calculator", href: STAMP_BASE }, { label: s.name }]}
      title={`Stamp Duty & Registration Charges in ${s.name} 2026`}
      intro={`Stamp duty in ${s.name} for men: ${s.summary.men}. Women: ${s.summary.women}. Registration: ${s.summary.registration}. Use the calculator below for your exact amount.`}
    >
      <FaqJsonLd faqs={faqs} />
      <StampDutyCalculator stateSlug={s.slug} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{s.name} rates at a glance</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${conf.cls}`}>{conf.label}</span>
          </div>
          <dl className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {[
              ["Men", s.summary.men],
              ["Women", s.summary.women],
              ["Joint (man + woman)", s.summary.joint],
              ["Registration fee", s.summary.registration],
              ...(s.summary.other ? [["Other charges", s.summary.other]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900 dark:text-white">{v}</dd>
              </div>
            ))}
          </dl>
          {s.notes.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
              {s.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Worked examples{s.areas ? ` (${s.areas[0].label})` : ""}</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2 font-semibold">Property value</th>
                <th className="pb-2 font-semibold">Man pays</th>
                <th className="pb-2 font-semibold">Woman pays</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {examples.map((e) => (
                <tr key={e.v}>
                  <td className="py-2.5 font-medium">{inr(e.v)}</td>
                  <td className="py-2.5">{inr(e.men)}</td>
                  <td className="py-2.5">{inr(e.women)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">Totals include stamp duty, other duties and percentage-based registration fees.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Stamp duty in {s.name}: FAQs</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SourcesBox s={s} />
      <StateLinks current={s.slug} />
    </Shell>
  );
}
