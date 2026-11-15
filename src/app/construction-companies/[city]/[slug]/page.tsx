import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { BadgeCheck, Building2, CalendarClock, CheckCircle2, FileBadge2, HardHat, IndianRupee, MapPin, ShieldCheck, Users } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { ContactButton, QuoteForm } from "@/components/construction/public/QuoteForm";
import { GalleryProvider, HeroGallery, PhotoGrid, ProjectPhotos } from "@/components/construction/public/ConstructionGallery";
import {
  BUILDING_TYPE_OPTIONS,
  CERTIFICATION_OPTIONS,
  FLOOR_OPTIONS,
  IN_HOUSE_OPTIONS,
  MATERIAL_GROUPS,
  SECTOR_OPTIONS,
  SERVICE_OPTIONS,
  TURNOVER_OPTIONS,
  citySlug,
  constructionProfilePath,
  formatCr,
  formatRate,
  isInfra,
  label,
} from "@/features/construction/options";
import { fetchConstructionProfile } from "../../lib/server-data";

export const revalidate = 120;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ city: string; slug: string }> };

async function load(slug: string) {
  const res = await fetchConstructionProfile(slug);
  if (!res.ok) throw new Error("construction API unavailable");
  return res.data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: { absolute: "Construction company not found | Awasio" }, robots: { index: false } };
  const where = [p.locality, p.city].filter(Boolean).join(", ");
  if (isInfra(p)) {
    const sectors = p.sectors.slice(0, 3).map((s) => label(SECTOR_OPTIONS, s)).join(", ");
    const title = `${p.businessName} – Infrastructure Contractor in ${p.city} | Awasio`;
    const description = `${p.businessName}, ${where}. ${sectors}${p.majorClients.length ? `. Worked for ${p.majorClients.slice(0, 3).join(", ")}` : ""}. See projects and send an enquiry.`;
    const url = buildCanonical(constructionProfilePath(p));
    const image = p.coverImage || p.workGallery[0] || p.projects[0]?.coverImage || OG_IMAGE_URL;
    return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "profile", images: [{ url: image, alt: p.businessName }] } };
  }
  const rate = p.quoteOnly || !p.startingRate ? "" : ` from ${formatRate(p.startingRate)}`;
  const title = `${p.businessName} – House Construction in ${p.city}${rate} | Awasio`;
  const description = `${p.businessName}, ${where}. ${p.services.slice(0, 3).map((s) => label(SERVICE_OPTIONS, s)).join(", ")}. See rates, completed homes and get a free quote.`;
  const url = buildCanonical(constructionProfilePath(p));
  const image = p.coverImage || p.workGallery[0] || p.projects[0]?.coverImage || OG_IMAGE_URL;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile", images: [{ url: image, alt: p.businessName }] },
  };
}

export default async function ConstructionProfilePage({ params }: Props) {
  const { city, slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  if (citySlug(p.city) !== city) permanentRedirect(constructionProfilePath(p));

  const where = [p.locality, p.city].filter(Boolean).join(", ");
  const infra = isInfra(p);
  const gallery = Array.from(new Set([p.coverImage, ...p.workGallery, ...p.projects.flatMap((x) => x.images)].filter(Boolean) as string[]));
  const materials = MATERIAL_GROUPS.map((g) => ({ label: g.label, items: p.materials?.[g.key] ?? [] })).filter((g) => g.items.length);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: p.businessName,
    url: buildCanonical(constructionProfilePath(p)),
    image: gallery[0] || p.logo || undefined,
    logo: p.logo || undefined,
    description: p.about || undefined,
    address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: p.state || undefined, addressCountry: p.countryCode || "IN", streetAddress: p.locality || undefined },
    areaServed: [p.city, ...p.serviceCities].map((c) => ({ "@type": "City", name: c })),
    foundingDate: p.yearEstablished ? String(p.yearEstablished) : undefined,
    priceRange: p.startingRate && !p.quoteOnly ? `₹${p.startingRate}/sq.ft onwards` : undefined,
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
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={`${p.businessName} logo`} className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white object-cover shadow-lg sm:h-20 sm:w-20" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-amber-400 shadow-lg sm:h-20 sm:w-20">
                  <HardHat className="h-8 w-8 text-slate-900" />
                </span>
              )}
              <div className="min-w-0 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">
                    <Building2 className="h-3 w-3" /> {infra ? "Infrastructure contractor" : p.providerType === "COMPANY" ? "Construction company" : "Contractor"}
                  </span>
                  {p.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold">
                      <BadgeCheck className="h-3 w-3" /> Verified by Awasio
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 text-2xl font-black leading-tight sm:text-4xl">{p.businessName}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-200"><MapPin className="h-4 w-4" /> {where}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
          <div className="mb-4 hidden sm:block">
            <PageBreadcrumbs items={[{ label: "Construction companies", href: "/construction-companies" }, { label: p.city, href: `/construction-companies/${citySlug(p.city)}` }, { label: p.businessName }]} renderJsonLd={true} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0 space-y-6">
              {/* Key facts */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(infra
                  ? [
                      { icon: IndianRupee, k: "Largest contract", v: formatCr(p.maxContractCr) || "—" },
                      { icon: CalendarClock, k: "Experience", v: p.experienceYears ? `${p.experienceYears} years` : "—" },
                      { icon: FileBadge2, k: "Annual turnover", v: p.turnoverBand ? label(TURNOVER_OPTIONS, p.turnoverBand) : "—" },
                      { icon: Users, k: "Team", v: p.teamSize ? `${p.teamSize}+ people` : "—" },
                    ]
                  : [
                  { icon: HardHat, k: "Starting rate", v: p.quoteOnly || !p.startingRate ? "On request" : formatRate(p.startingRate) },
                  { icon: CalendarClock, k: "Experience", v: p.experienceYears ? `${p.experienceYears} years` : "—" },
                  { icon: ShieldCheck, k: "Structural warranty", v: p.structuralWarrantyYears ? `${p.structuralWarrantyYears} years` : "—" },
                  { icon: Users, k: "Team", v: p.teamSize ? `${p.teamSize}+ people` : "—" },
                ]).map(({ icon: Icon, k, v }) => (
                  <div key={k} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <Icon className="h-4 w-4 text-amber-500" />
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

              {/* Infra: sectors & credentials */}
              {infra && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sectors</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.sectors.map((s) => (
                      <span key={s} className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{label(SECTOR_OPTIONS, s)}</span>
                    ))}
                  </div>
                  {p.registrations.length > 0 && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Contractor registrations</h3>
                      <ul className="mt-1 space-y-1">
                        {p.registrations.map((r, i) => (
                          <li key={i} className="flex gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {r.authority}{r.contractorClass ? ` — ${r.contractorClass}` : ""}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {p.majorClients.length > 0 && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Worked for</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.majorClients.join(" · ")}</p>
                    </>
                  )}
                  {p.certifications.length > 0 && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Certifications</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.certifications.map((c) => label(CERTIFICATION_OPTIONS, c)).join(" · ")}</p>
                    </>
                  )}
                  {p.equipment.length > 0 && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Machinery & plants</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.equipment.join(" · ")}</p>
                    </>
                  )}
                  {p.inHouse.length > 0 && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">In-house</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.inHouse.map((b) => label(IN_HOUSE_OPTIONS, b)).join(" · ")}</p>
                    </>
                  )}
                  {p.serviceCities.length > 0 && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Also works in</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.serviceCities.join(", ")}</p>
                    </>
                  )}
                </section>
              )}

              {/* Packages */}
              {!infra && !p.quoteOnly && p.packages.length > 0 && (
                <section aria-labelledby="pkg-title">
                  <h2 id="pkg-title" className="text-lg font-bold text-slate-900 dark:text-white">Construction packages</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {p.packages.map((pk, i) => (
                      <div key={pk.name} className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${i === 1 ? "border-amber-300 ring-2 ring-amber-100 dark:ring-amber-900/40" : "border-slate-200 dark:border-slate-800"}`}>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{pk.name}</p>
                        <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                          ₹{pk.ratePerSqft.toLocaleString("en-IN")}<span className="text-xs font-semibold text-slate-500"> /sq.ft</span>
                        </p>
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
                  <p className="mt-2 text-xs text-slate-500">Rates are indicative per sq.ft of built-up area. The final quote depends on design, soil and site conditions.</p>
                </section>
              )}

              {/* Services */}
              {!infra && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Services</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.services.map((s) => (
                    <span key={s} className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{label(SERVICE_OPTIONS, s)}</span>
                  ))}
                </div>
                {p.buildingTypes.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Builds</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.buildingTypes.map((b) => label(BUILDING_TYPE_OPTIONS, b)).join(" · ")}</p>
                  </>
                )}
                {p.inHouse.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">In-house</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.inHouse.map((b) => label(IN_HOUSE_OPTIONS, b)).join(" · ")}</p>
                  </>
                )}
                {p.serviceCities.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Also works in</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.serviceCities.join(", ")}</p>
                  </>
                )}
              </section>
              )}

              {/* Projects */}
              {p.projects.length > 0 && (
                <section aria-labelledby="proj-title">
                  <h2 id="proj-title" className="text-lg font-bold text-slate-900 dark:text-white">{infra ? "Projects" : "Completed homes"}</h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {p.projects.map((pj) => (
                      <article key={pj.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <ProjectPhotos project={pj} />
                        <div className="p-3">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pj.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {(infra ? [pj.projectStatus === "ONGOING" ? "Ongoing" : pj.projectStatus === "COMPLETED" ? "Completed" : "", pj.sector ? label(SECTOR_OPTIONS, pj.sector) : "", pj.clientAuthority ?? "", formatCr(pj.contractValueCr), pj.durationMonths ? `${pj.durationMonths} months` : "", [pj.locality, pj.city].filter(Boolean).join(", ")] : [pj.floors ? label(FLOOR_OPTIONS, pj.floors) : "", pj.builtUpSqft ? `${pj.builtUpSqft.toLocaleString("en-IN")} sq.ft` : "", pj.durationMonths ? `${pj.durationMonths} months` : "", pj.costLakhs ? `~₹${pj.costLakhs} L` : "", [pj.locality, pj.city].filter(Boolean).join(", ")]).filter(Boolean).join(" · ")}
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
                  <h2 id="gal-title" className="text-lg font-bold text-slate-900 dark:text-white">Work photos</h2>
                  <PhotoGrid images={p.workGallery} title={p.businessName} />
                </section>
              )}

              {/* Materials & warranty */}
              {!infra && (materials.length > 0 || p.structuralWarrantyYears || p.waterproofingWarrantyYears) && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Materials & warranty</h2>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {materials.map((m) => (
                      <div key={m.label}>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{m.label}</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">{m.items.join(", ")}</dd>
                      </div>
                    ))}
                    {p.structuralWarrantyYears ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Structural warranty</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">{p.structuralWarrantyYears} years</dd>
                      </div>
                    ) : null}
                    {p.waterproofingWarrantyYears ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Waterproofing warranty</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">{p.waterproofingWarrantyYears} years</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              )}
            </div>

            {/* Quote panel */}
            <aside id="quote" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{infra ? "Send an enquiry" : "Get a free quote"}</h2>
                  <p className="text-sm text-slate-500">{infra ? `Projects, subcontracts, supply or JV: tell ${p.businessName} what you need.` : <>Tell {p.businessName} about your plot. They&apos;ll call you back.</>}</p>
                </div>
                <QuoteForm profileId={p.id} businessName={p.businessName} defaultCity={p.city} infra={infra} />
                <div className="relative py-1 text-center text-xs text-slate-400">
                  <span className="relative z-10 bg-white px-2 dark:bg-slate-900">or</span>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-800" />
                </div>
                <ContactButton profileId={p.id} />
              </div>
              <Link href={`/construction-companies/${citySlug(p.city)}`} className="mt-3 block text-center text-sm font-semibold text-rose-600 hover:underline">
                {infra ? `More contractors in ${p.city}` : `Compare more builders in ${p.city}`}
              </Link>
            </aside>
          </div>
        </div>

        {/* Mobile quote bar */}
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <a href="#quote" className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-sm font-bold text-white">
            {infra ? "Send enquiry" : "Get free quote"}
          </a>
        </div>
        </GalleryProvider>
      </main>
      <FooterLinks />
    </div>
  );
}
