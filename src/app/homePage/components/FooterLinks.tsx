import React from "react";
import Link from "next/link";
import { Mail, Linkedin, Youtube, Instagram, Facebook } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { SOCIAL_LINKS } from "@/constants/seo";
import { LISTING_SEO, LISTING_SEO_ORDER } from "@/constants/listingSeo";

const columns = [
  {
    title: "Support & Legal",
    links: [
      { label: "Help Centre", href: "/contact" },
      { label: "Community Forum", href: "/community" },
      { label: "Safety information", href: "/policies" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
  {
    title: "Tools & Portals",
    links: [
      { label: "Locality guide: metro, hospitals & schools", href: "/nearby" },
      { label: "EMI Calculator", href: "/emi-calculator" },
      { label: "Stamp Duty Calculator", href: "/stamp-duty-calculator" },
      { label: "Free rental agreement (PDF)", href: "/rental-agreement" },
      { label: "Rent receipt generator (HRA)", href: "/rent-receipt" },
      { label: "Home Loans", href: "/home-loans" },
      { label: "Price Trends", href: "/price-trends" },
      { label: "Pricing & Plans", href: "/pricing" },
      { label: "Blog & Guides", href: "/blog" },
    ],
  },
  {
    title: "Home Services",
    links: [
      { label: "Interior designers", href: "/interior-designers" },
      { label: "House construction companies", href: "/construction-companies" },
      { label: "Infrastructure contractors", href: "/construction-companies?segment=INFRA" },
      { label: "Pandit for griha pravesh & puja", href: "/pandit-vastu" },
      { label: "Vastu consultants", href: "/pandit-vastu?segment=VASTU" },
      { label: "Hotels & stays", href: "/stays" },
      { label: "Find verified agents", href: "/agents" },
    ],
  },
  {
    title: "List on Awasio",
    links: LISTING_SEO_ORDER.map((k) => ({ label: LISTING_SEO[k].navLabel, href: LISTING_SEO[k].path })),
  },
];

export function FooterLinks() {
  return (
    <footer className="mt-4 overflow-x-clip border-t border-slate-200 bg-white sm:mt-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto hidden max-w-6xl px-4 py-6 sm:block sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-8">
          {/* Brand Info */}
          <div className="space-y-2.5 md:col-span-4">
            <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />
            <p className="hidden sm:block max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Buy, rent, post and manage approved property listings across Indian cities with transparent pricing.
            </p>
            {/* Compact Horizontal Contact Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <a
                href="mailto:contact@awasio.com"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-rose-400"
                aria-label="Email contact@awasio.com"
              >
                <Mail className="h-3 w-3 text-rose-500 shrink-0" />
                <span>contact@awasio.com</span>
              </a>
            </div>

            {/* Official Social Media Channels: highlighted so visitors notice and follow */}
            <div className="mt-3 max-w-md rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-3.5 shadow-sm dark:border-rose-900/50 dark:from-rose-950/40 dark:via-slate-900 dark:to-amber-950/20">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Follow Awasio</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Property tips, new listings and market updates. Join us on social.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[
                  { href: SOCIAL_LINKS.instagram.url, label: "Instagram", title: "Instagram: @awas_io", bg: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]", icon: <Instagram className="h-4 w-4" /> },
                  { href: SOCIAL_LINKS.youtube.url, label: "YouTube", title: "YouTube: @awasio-official", bg: "bg-[#FF0000]", icon: <Youtube className="h-4 w-4" /> },
                  { href: SOCIAL_LINKS.linkedin.url, label: "LinkedIn", title: "LinkedIn: awasio-official", bg: "bg-[#0A66C2]", icon: <Linkedin className="h-4 w-4" /> },
                  {
                    href: SOCIAL_LINKS.x.url,
                    label: "X",
                    title: "X: @awasioofficial",
                    bg: "bg-black dark:bg-slate-700",
                    icon: (
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  { href: SOCIAL_LINKS.facebook.url, label: "Facebook", title: "Facebook: @theawasio", bg: "bg-[#1877F2]", icon: <Facebook className="h-4 w-4" /> },
                ]
                  .filter((s) => s.href)
                  .map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow Awasio on ${s.label}`}
                      title={s.title}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${s.bg}`}
                    >
                      {s.icon}
                    </a>
                  ))}
              </div>
            </div>
          </div>

          {/* Links: 3 side-by-side columns */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:col-span-8 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {col.title}
                </p>
                <div className="mt-2.5 flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      href={link.href}
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-3 px-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>© 2026 Awasio. Property search and listing management.</span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Connect:</span>
            <a
              href={SOCIAL_LINKS.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn: awasio-official"
              className="text-slate-500 hover:text-[#0A66C2] transition"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.x.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              title="X: @awasioofficial"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube: @awasio-official"
              className="text-slate-500 hover:text-[#FF0000] transition"
            >
              <Youtube className="h-3.5 w-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram: @awas_io"
              className="text-slate-500 hover:text-[#E1306C] transition"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            {SOCIAL_LINKS.facebook.url && (
              <a
                href={SOCIAL_LINKS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook: @theawasio"
                className="text-slate-500 hover:text-[#1877F2] transition"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
