import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, CheckCircle2, Compass, Flame, GraduationCap, IndianRupee, Languages, MapPin, PlayCircle, Star, Video } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { GalleryProvider, HeroGallery, PhotoGrid } from "@/components/construction/public/ConstructionGallery";
import { CompanyAvatar } from "@/components/construction/public/CompanyAvatar";
import { ContactButton, EnquiryForm } from "@/components/pandit/public/EnquiryForm";
import { ReviewItem, Stars, WriteReview } from "@/components/pandit/public/ReviewSection";
import {
  CONSULT_MODE_OPTIONS,
  LANGUAGE_OPTIONS,
  PANDIT_BASE,
  SEGMENT_LABEL,
  TRADITION_OPTIONS,
  formatInr,
  label,
  panditName,
  panditProfilePath,
  serviceLabel,
} from "@/features/pandit/options";
import { fetchPanditProfile } from "../lib/server-data";
import type { PanditProfile } from "@/features/pandit/types";
import { listingPath } from "@/lib/seo/countryPath";
import { formatNumber } from "@/lib/money";

/** Profile for a slug; null when it is not a profile (the route then tries a locality page). */
export async function loadProfile(slug: string) {
  const res = await fetchPanditProfile(slug);
  if (!res.ok) throw new Error("pandit API unavailable");
  return res.data;
}

export function profileMetadata(p: PanditProfile): Metadata {
  const name = panditName(p);
  const vastu = p.segment === "VASTU";
  const top = p.services.slice(0, 3).map(serviceLabel).join(", ");
  const rating = p.ratingCount ? ` ★ ${p.ratingAvg.toFixed(1)} (${p.ratingCount} reviews).` : "";
  const title = `${name} – ${vastu ? "Vastu Consultant" : "Pandit for Puja"} in ${p.city}${p.startingPrice ? ` from ${formatInr(p.startingPrice, p.countryCode)}` : ""} | Awasio`;
  const description = `${name}, ${[p.locality, p.city].filter(Boolean).join(", ")}. ${top}.${rating} Languages: ${p.languages.slice(0, 3).map((l) => label(LANGUAGE_OPTIONS, l)).join(", ")}. Check availability for your date.`;
  const url = buildCanonical(panditProfilePath(p));
  const image = p.coverImage || p.gallery[0] || p.photo || OG_IMAGE_URL;
  return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "profile", images: [{ url: image, alt: name }] } };
}

export function PanditProfileView({ p }: { p: PanditProfile }) {

  const name = panditName(p);
  const vastu = p.segment === "VASTU";
  const where = [p.locality, p.city].filter(Boolean).join(", ");
  const gallery = Array.from(new Set([p.coverImage, ...p.gallery].filter(Boolean) as string[]));
  const rated = new Set(p.rateCard.map((r) => r.service));
  const unrated = p.services.filter((s) => !rated.has(s));
  const online = p.consultModes.includes("ONLINE") || p.services.includes("ONLINE_PUJA") || p.services.includes("VASTU_ONLINE");
  const reviews = p.reviews ?? [];
  const breakdown = p.ratingBreakdown ?? {};
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name,
    url: buildCanonical(panditProfilePath(p)),
    image: gallery[0] || p.photo || undefined,
    description: p.about || undefined,
    address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: p.state || undefined, addressCountry: p.countryCode || "IN", streetAddress: p.locality || undefined },
    areaServed: [p.city, ...p.serviceCities].map((c) => ({ "@type": "City", name: c })),
    priceRange: p.startingPrice ? `${formatInr(p.startingPrice, p.countryCode)} onwards` : undefined,
    knowsLanguage: p.languages.map((l) => label(LANGUAGE_OPTIONS, l)),
    makesOffer: p.services.slice(0, 20).map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: serviceLabel(s) } })),
    aggregateRating: p.ratingCount ? { "@type": "AggregateRating", ratingValue: p.ratingAvg, reviewCount: p.ratingCount, bestRating: 5 } : undefined,
    review: reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.author }, reviewRating: { "@type": "Rating", ratingValue: r.rating }, reviewBody: r.comment || undefined, datePublished: r.createdAt })),
  };

  const facts = [
    { icon: IndianRupee, k: vastu ? "Consultation from" : "Dakshina from", v: p.startingPrice ? formatInr(p.startingPrice, p.countryCode) : "On request" },
    { icon: CalendarClock, k: "Experience", v: p.experienceYears ? `${p.experienceYears} years` : "—" },
    { icon: Languages, k: "Languages", v: p.languages.slice(0, 2).map((l) => label(LANGUAGE_OPTIONS, l)).join(", ") || "—" },
    { icon: Star, k: "Rating", v: p.ratingCount ? `${p.ratingAvg.toFixed(1)} / 5 (${p.ratingCount})` : "New" },
  ];
  const details: [string, string][] = [
    ["Traditions", p.traditions.map((t) => label(TRADITION_OPTIONS, t)).join(" · ")],
    ["Consults by", p.consultModes.map((m) => label(CONSULT_MODE_OPTIONS, m)).join(" · ")],
    ["Qualification", [p.qualification, p.gurukul].filter(Boolean).join(" — ")],
    ["Specialises in", p.specializations.join(" · ")],
    ["Also serves", p.serviceCities.join(", ")],
    ["Notice needed", p.noticeDays ? `${p.noticeDays} day${p.noticeDays > 1 ? "s" : ""}` : ""],
    ["Team", p.providerType === "TEAM" && p.teamSize ? `${p.teamSize} pandits / assistants` : ""],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeaderNav />
      <main className="flex-1 pb-24 sm:pb-0">
        <GalleryProvider>
          <section className="relative bg-gradient-to-br from-amber-700 via-orange-800 to-rose-900">
            <HeroGallery images={gallery} title={name} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <div className="mx-auto flex max-w-6xl items-end gap-4 px-4 pb-5 sm:px-6">
                <CompanyAvatar name={p.displayName} logo={p.photo} className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white text-lg font-black shadow-lg sm:h-20 sm:w-20" imageClassName="h-full w-full rounded-2xl object-cover" alt={name} />
                <div className="min-w-0 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">
                      {vastu ? <Compass className="h-3 w-3" /> : <Flame className="h-3 w-3" />} {SEGMENT_LABEL[p.segment]}
                    </span>
                    {p.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold">
                        <BadgeCheck className="h-3 w-3" /> Verified by Awasio
                      </span>
                    )}
                    {p.ratingCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-slate-950">
                        <Star className="h-3 w-3 fill-current" /> {p.ratingAvg.toFixed(1)} · {p.ratingCount} reviews
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1.5 text-2xl font-black leading-tight sm:text-4xl">{name}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-200"><MapPin className="h-4 w-4" /> {where}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
            <div className="mb-4 hidden sm:block">
              <PageBreadcrumbs items={[{ label: "Pandit & Vastu", href: PANDIT_BASE }, { label: p.city, href: listingPath(PANDIT_BASE, p.city, null, p.countryCode) }, { label: name }]} renderJsonLd={true} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="min-w-0 space-y-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {facts.map(({ icon: Icon, k, v }) => (
                    <div key={k} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                      <Icon className="h-4 w-4 text-orange-500" />
                      <p className="mt-1 text-[11px] text-slate-500">{k}</p>
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {online && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950/40 dark:text-sky-200"><Video className="h-3.5 w-3.5" /> {vastu ? "Online consultation" : "Online puja available"}</span>}
                  {!vastu && p.samagriArranged && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><CheckCircle2 className="h-3.5 w-3.5" /> Can arrange samagri</span>}
                  {p.travelsOutstation && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><MapPin className="h-3.5 w-3.5" /> Travels outstation</span>}
                </div>

                {p.about && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">About {name}</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">{p.about}</p>
                  </section>
                )}

                <section aria-labelledby="svc-title" className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 id="svc-title" className="text-lg font-bold text-slate-900 dark:text-white">{vastu ? "Consultations & fees" : "Pujas & dakshina"}</h2>
                  {p.rateCard.length > 0 && (
                    <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                      {p.rateCard.map((r) => (
                        <li key={r.service} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                          <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900 dark:text-white">{serviceLabel(r.service)}</span>
                          <span className="text-xs text-slate-500">
                            {[r.durationHours ? `${r.durationHours} h` : "", r.samagriIncluded ? "samagri included" : ""].filter(Boolean).join(" · ")}
                          </span>
                          <span className="text-sm font-black text-slate-950 dark:text-white">
                            {formatInr(r.priceFrom, p.countryCode)}
                            {r.priceTo && r.priceTo > r.priceFrom ? `–${formatNumber(r.priceTo, p.countryCode)}` : "+"}
                          </span>
                          <a href={`?service=${r.service}#enquire`} className="text-xs font-bold text-rose-600 hover:underline">Enquire</a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {unrated.length > 0 && (
                    <>
                      {p.rateCard.length > 0 && <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Also performs</h3>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {unrated.map((s) => (
                          <span key={s} className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{serviceLabel(s)}</span>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="mt-3 text-xs text-slate-500">Fees are indicative. Confirm the final dakshina, samagri and timing directly before the day.</p>
                </section>

                {details.length > 0 && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><GraduationCap className="h-5 w-5 text-orange-500" /> Details</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Languages</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">{p.languages.map((l) => label(LANGUAGE_OPTIONS, l)).join(", ")}</dd>
                      </div>
                      {details.map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                          <dd className="text-sm text-slate-800 dark:text-slate-200">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                {p.gallery.length > 0 && (
                  <section aria-labelledby="gal-title">
                    <h2 id="gal-title" className="text-lg font-bold text-slate-900 dark:text-white">Photos</h2>
                    <PhotoGrid images={p.gallery} title={name} />
                  </section>
                )}

                {p.videos.length > 0 && (
                  <section aria-labelledby="vid-title">
                    <h2 id="vid-title" className="text-lg font-bold text-slate-900 dark:text-white">Videos</h2>
                    <ul className="mt-2 space-y-1.5">
                      {p.videos.map((v, i) => (
                        <li key={v}>
                          <a href={v} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:underline">
                            <PlayCircle className="h-4 w-4" /> Watch video {i + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section aria-labelledby="rev-title" className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 id="rev-title" className="text-lg font-bold text-slate-900 dark:text-white">Reviews</h2>
                    <WriteReview profileId={p.id} services={p.services} name={name} />
                  </div>
                  {p.ratingCount > 0 ? (
                    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-[160px_1fr] dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-center sm:text-left">
                        <p className="text-4xl font-black text-slate-950 dark:text-white">{p.ratingAvg.toFixed(1)}</p>
                        <Stars value={p.ratingAvg} />
                        <p className="mt-1 text-xs text-slate-500">{p.ratingCount} review{p.ratingCount > 1 ? "s" : ""}</p>
                      </div>
                      <ul className="space-y-1">
                        {[5, 4, 3, 2, 1].map((n) => {
                          const c = breakdown[n] ?? 0;
                          return (
                            <li key={n} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <span className="w-6">{n}★</span>
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${p.ratingCount ? (c / p.ratingCount) * 100 : 0}%` }} />
                              </span>
                              <span className="w-6 text-right">{c}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No reviews yet. Booked {name} through Awasio? Be the first to review.</p>
                  )}
                  {reviews.length > 0 && <ul className="space-y-3">{reviews.map((r) => <ReviewItem key={r.id} r={r} />)}</ul>}
                </section>
              </div>

              <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
                <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{vastu ? "Book a consultation" : "Check availability"}</h2>
                    <p className="text-sm text-slate-500">Tell {name} what you need and when. They&apos;ll confirm the date and fee.</p>
                  </div>
                  <EnquiryForm profileId={p.id} name={name} defaultCity={p.city} services={p.services} languages={p.languages} online={online} vastu={vastu} noticeDays={p.noticeDays} />
                  <div className="relative py-1 text-center text-xs text-slate-400">
                    <span className="relative z-10 bg-white px-2 dark:bg-slate-900">or</span>
                    <span className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <ContactButton profileId={p.id} />
                </div>
                <Link href={`${listingPath(PANDIT_BASE, p.city, null, p.countryCode)}${vastu ? "?segment=VASTU" : ""}`} className="mt-3 block text-center text-sm font-semibold text-rose-600 hover:underline">
                  {vastu ? `More vastu consultants in ${p.city}` : `More pandits in ${p.city}`}
                </Link>
              </aside>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+var(--signup-bar,0px))] z-30 transition-[bottom] duration-300 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
            <a href="#enquire" className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-sm font-bold text-white">
              {vastu ? "Book consultation" : "Check availability"}
            </a>
          </div>
        </GalleryProvider>
      </main>
      <FooterLinks />
    </div>
  );
}
