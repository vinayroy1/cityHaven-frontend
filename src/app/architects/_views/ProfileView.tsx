import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, CheckCircle2, Compass, Globe2, GraduationCap, IndianRupee, Languages, MapPin, PencilRuler, RefreshCcw, ShieldCheck, Stamp, Timer } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { ContactButton, QuoteForm } from "@/components/architect/public/QuoteForm";
import { GalleryProvider, HeroGallery, PhotoGrid, ProjectPhotos } from "@/components/architect/public/ArchitectGallery";
import { CompanyAvatar } from "@/components/architect/public/CompanyAvatar";
import {
  BHK_OPTIONS,
  BUILDING_TYPE_OPTIONS,
  FACING_OPTIONS,
  FLOOR_OPTIONS,
  SERVICE_OPTIONS,
  architectProfilePath,
  formatPrice,
  label,
  plotLabel,
  providerBadge,
} from "@/features/architect/options";
import { fetchArchitectProfile } from "../lib/server-data";
import type { ArchitectProfile } from "@/features/architect/types";
import { listingPath } from "@/lib/seo/countryPath";

/** Profile for a slug; null when it is not a profile (the route then tries a locality page). */
export async function loadProfile(slug: string) {
  const res = await fetchArchitectProfile(slug);
  if (!res.ok) throw new Error("architect API unavailable");
  return res.data;
}

/** "Architect" only for COA architects; others are named by what they are. */
const roleInCity = (p: ArchitectProfile) =>
  p.providerType === "ARCHITECT" ? "Architect" : p.providerType === "ENGINEER" ? "Civil Engineer & House Planner" : "House Naksha Designer";

export function profileMetadata(p: ArchitectProfile): Metadata {
  const where = [p.locality, p.city].filter(Boolean).join(", ");
  const price = p.quoteOnly || !p.startingPrice ? "" : ` from ${formatPrice(p.startingPrice, p.startingUnit, p.countryCode)}`;
  const title = `${p.businessName} – ${roleInCity(p)} in ${p.city}${price} | Awasio`;
  const description = `${p.businessName}, ${where}. ${p.services.slice(0, 3).map((s) => label(SERVICE_OPTIONS, s)).join(", ")}. See house plans, prices and get a free naksha quote.`;
  const url = buildCanonical(architectProfilePath(p));
  const image = p.coverImage || p.workGallery[0] || p.projects[0]?.coverImage || OG_IMAGE_URL;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile", images: [{ url: image, alt: p.businessName }] },
  };
}

export function ArchitectProfileView({ p }: { p: ArchitectProfile }) {
  const where = [p.locality, p.city].filter(Boolean).join(", ");
  const gallery = Array.from(new Set([p.coverImage, ...p.workGallery, ...p.projects.flatMap((x) => x.images)].filter(Boolean) as string[]));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: p.businessName,
    url: buildCanonical(architectProfilePath(p)),
    image: gallery[0] || p.logo || undefined,
    logo: p.logo || undefined,
    description: p.about || undefined,
    address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: p.state || undefined, addressCountry: p.countryCode || "IN", streetAddress: p.locality || undefined },
    areaServed: p.worksOnline ? [{ "@type": "Country", name: "India" }] : [p.city, ...p.serviceCities].map((c) => ({ "@type": "City", name: c })),
    foundingDate: p.yearEstablished ? String(p.yearEstablished) : undefined,
    knowsLanguage: p.languages.length ? p.languages : undefined,
    priceRange: p.startingPrice && !p.quoteOnly ? `${formatPrice(p.startingPrice, p.startingUnit, p.countryCode)} onwards` : undefined,
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeaderNav />
      <main className="flex-1 pb-24 sm:pb-0">
        <GalleryProvider>
        {/* Hero */}
        <section className="relative bg-slate-900">
          <HeroGallery images={gallery} title={p.businessName} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="mx-auto flex max-w-6xl items-end gap-4 px-4 pb-5 sm:px-6">
              <CompanyAvatar
                name={p.businessName}
                logo={p.logo}
                className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white shadow-lg text-lg font-black sm:h-20 sm:w-20"
                imageClassName="h-full w-full rounded-2xl object-cover"
                alt={`${p.businessName} logo`}
              />
              <div className="min-w-0 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">
                    <PencilRuler className="h-3 w-3" /> {providerBadge(p.providerType)}
                  </span>
                  {p.coaVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold">
                      <ShieldCheck className="h-3 w-3" /> COA verified{p.coaNumber ? ` · ${p.coaNumber}` : ""}
                    </span>
                  ) : p.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold">
                      <BadgeCheck className="h-3 w-3" /> Verified by Awasio
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-1.5 text-2xl font-black leading-tight sm:text-4xl">{p.businessName}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-200"><MapPin className="h-4 w-4" /> {where}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
          <div className="mb-4 hidden sm:block">
            <PageBreadcrumbs items={[{ label: "Architects & naksha", href: "/architects" }, { label: p.city, href: listingPath("/architects", p.city, null, p.countryCode) }, { label: p.businessName }]} renderJsonLd={true} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0 space-y-6">
              {/* Key facts */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { icon: IndianRupee, k: "Starting price", v: p.quoteOnly || !p.startingPrice ? "On request" : formatPrice(p.startingPrice, p.startingUnit, p.countryCode) },
                  { icon: CalendarClock, k: "Experience", v: p.experienceYears ? `${p.experienceYears} years` : "—" },
                  { icon: Timer, k: "Naksha delivery", v: p.turnaroundDays ? `${p.turnaroundDays} days` : "—" },
                  { icon: RefreshCcw, k: "Revisions", v: p.revisionsIncluded ? `${p.revisionsIncluded} included` : "—" },
                ].map(({ icon: Icon, k, v }) => (
                  <div key={k} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <Icon className="h-4 w-4 text-sky-500" />
                    <p className="mt-1 text-[11px] text-slate-500">{k}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{v}</p>
                  </div>
                ))}
              </div>

              {p.about && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">About {p.businessName}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">{p.about}</p>
                </section>
              )}

              {/* Credentials */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Credentials</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <PencilRuler className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /> {providerBadge(p.providerType)}{p.isFirm ? " (firm)" : ""}
                  </li>
                  {p.coaVerified && (
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Registered with the Council of Architecture{p.coaNumber ? ` (${p.coaNumber})` : ""}
                    </li>
                  )}
                  {p.qualification && (
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /> {p.qualification}
                    </li>
                  )}
                  {p.canSignApprovals && (
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Stamp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Signs drawings for map approval{p.licenceAuthority ? ` (${p.licenceAuthority})` : ""}
                    </li>
                  )}
                  {p.worksOnline && (
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /> Delivers drawings online across India
                    </li>
                  )}
                  {p.siteVisit && (
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> Visits the plot / site
                    </li>
                  )}
                  {p.languages.length > 0 && (
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Languages className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /> {p.languages.join(", ")}
                    </li>
                  )}
                </ul>
              </section>

              {/* Packages */}
              {!p.quoteOnly && p.packages.length > 0 && (
                <section aria-labelledby="pkg-title">
                  <h2 id="pkg-title" className="text-lg font-bold text-slate-900 dark:text-white">Design packages</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {p.packages.map((pk, i) => (
                      <div key={pk.name} className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${i === 1 ? "border-sky-300 ring-2 ring-sky-100 dark:ring-sky-900/40" : "border-slate-200 dark:border-slate-800"}`}>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{pk.name}</p>
                        <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{formatPrice(pk.price, pk.unit, p.countryCode)}</p>
                        {pk.includes.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {pk.includes.map((x) => (
                              <li key={x} className="flex gap-1.5 text-xs text-slate-600 dark:text-slate-300"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {x}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Per sq.ft prices are on the built-up area. The final quote depends on plot size, floors and drawings needed.</p>
                </section>
              )}

              {/* Services */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Services</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.services.map((s) => (
                    <span key={s} className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">{label(SERVICE_OPTIONS, s)}</span>
                  ))}
                </div>
                {p.buildingTypes.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Designs</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.buildingTypes.map((b) => label(BUILDING_TYPE_OPTIONS, b)).join(" · ")}</p>
                  </>
                )}
                {p.serviceCities.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Also visits sites in</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.serviceCities.join(", ")}</p>
                  </>
                )}
              </section>

              {/* Projects */}
              {p.projects.length > 0 && (
                <section aria-labelledby="proj-title">
                  <h2 id="proj-title" className="text-lg font-bold text-slate-900 dark:text-white">House plans & elevations</h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {p.projects.map((pj) => (
                      <article key={pj.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <ProjectPhotos project={pj} />
                        <div className="p-3">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pj.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {[plotLabel(pj.plotWidthFt, pj.plotDepthFt, pj.plotSizeSqft), pj.facing ? label(FACING_OPTIONS, pj.facing) : "", pj.floors ? label(FLOOR_OPTIONS, pj.floors) : "", pj.bhk ? label(BHK_OPTIONS, pj.bhk) : "", pj.city ?? ""].filter(Boolean).join(" · ")}
                            {pj.vastu && <span className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-emerald-700"><Compass className="h-3 w-3" /> Vastu</span>}
                          </p>
                          {pj.description && <p className="mt-1.5 line-clamp-3 text-xs text-slate-600 dark:text-slate-300">{pj.description}</p>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {p.workGallery.length > 0 && (
                <section aria-labelledby="gal-title">
                  <h2 id="gal-title" className="text-lg font-bold text-slate-900 dark:text-white">More designs</h2>
                  <PhotoGrid images={p.workGallery} title={p.businessName} />
                </section>
              )}

            </div>

            {/* Quote panel */}
            <aside id="quote" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Get a free naksha quote</h2>
                  <p className="text-sm text-slate-500">Tell {p.businessName} about your plot. They&apos;ll call you back.</p>
                </div>
                <QuoteForm profileId={p.id} businessName={p.businessName} defaultCity={p.city} services={p.services} />
                <div className="relative py-1 text-center text-xs text-slate-400">
                  <span className="relative z-10 bg-white px-2 dark:bg-slate-900">or</span>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-800" />
                </div>
                <ContactButton profileId={p.id} />
              </div>
              <Link href={listingPath("/architects", p.city, null, p.countryCode)} className="mt-3 block text-center text-sm font-semibold text-rose-600 hover:underline">
                {`Compare more architects & naksha designers in ${p.city}`}
              </Link>
            </aside>
          </div>
        </div>

        {/* Mobile quote bar */}
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+var(--signup-bar,0px))] z-30 transition-[bottom] duration-300 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <a href="#quote" className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-sm font-bold text-white">
            Get free naksha quote
          </a>
        </div>
        </GalleryProvider>
      </main>
      <FooterLinks />
    </div>
  );
}
