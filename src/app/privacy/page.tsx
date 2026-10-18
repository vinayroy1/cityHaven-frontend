import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  EyeOff,
  Lock,
  Smartphone,
  Database,
  Bell,
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Protection",
  description:
    "Learn how Awasio Technologies Private Limited collects, stores, protects, and manages your personal data in full compliance with the Digital Personal Data Protection Act (DPDPA 2023) and Indian IT Rules.",
  alternates: { canonical: buildCanonical("/privacy") },
  openGraph: {
    title: "Privacy Policy & Data Protection | Awasio",
    description:
      "Learn how Awasio Technologies Private Limited collects, stores, protects, and manages your personal data in full compliance with the Digital Personal Data Protection Act (DPDPA 2023) and Indian IT Rules.",
    url: buildCanonical("/privacy"),
    type: "website",
  },
};

const principles = [
  {
    title: "Data Minimization",
    body: "We only collect data strictly necessary to authenticate your account, facilitate verified property discovery, and connect you with authorized owners.",
    icon: EyeOff,
  },
  {
    title: "End-to-End Encryption",
    body: "All communications, authentication OTPs, and sessions travel over HTTPS/TLS 1.3 encryption, with sensitive tokens and passwords hashed with bcrypt.",
    icon: Lock,
  },
  {
    title: "Zero Data Sale",
    body: "We never sell, rent, monetize, or trade your personal telephone number or email address to unauthorized marketing agencies or unsolicited telemarketers.",
    icon: Shield,
  },
];

const dataTypes = [
  {
    category: "Identity & Account Data",
    items: [
      "Full Name, Email Address, and Mobile Number collected during account registration.",
      "Encrypted password hashes and single-session refresh tokens.",
      "Optional Government ID details submitted voluntarily by property listers for KYC owner-verification.",
    ],
  },
  {
    category: "Usage & Discovery Data",
    items: [
      "Property search parameters (desired city, locality, budget range, BHK configuration).",
      "Shortlisted favorites, inquiry timestamps, and visit booking requests.",
      "IP address, device metadata, and browser user-agent collected to detect fraud, bots, and unauthorized scraping.",
    ],
  },
  {
    category: "Financial Transaction Metadata",
    items: [
      "Payment gateway transaction identifiers, plan tier, and credit allocation logs.",
      "Note: Awasio does not store full credit/debit card numbers, CVVs, or net banking passwords. All payments are processed directly by RBI-licensed payment aggregators (e.g., Razorpay) in PCI-DSS Level 1 compliant environments.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 bg-gradient-to-b from-rose-50/60 via-white to-amber-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Header */}
          <header className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 sm:p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
              <Shield className="h-4 w-4" /> Privacy &amp; Data Protection
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
              Privacy Policy &amp; Data Governance
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              This Privacy Policy explains how <strong>Awasio Technologies Private Limited</strong> collects, utilizes, stores, and protects your personal information when you access our platform, in full accordance with the Information Technology Act, 2000, the SPDI Rules 2011, and the Digital Personal Data Protection Act, 2023 (DPDPA).
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner dark:border-slate-800 dark:bg-slate-800">
                Data Fiduciary: Awasio Technologies Pvt Ltd
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner dark:border-slate-800 dark:bg-slate-800">
                DPDPA 2023 Compliant
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner dark:border-slate-800 dark:bg-slate-800">
                Updated: October 2026
              </span>
            </div>
          </header>

          {/* Corporate Entity Summary */}
          <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Data Fiduciary</h3>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Awasio Technologies Private Limited</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">CIN: U72900HR2024PTC118942</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registered Office</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-800 dark:text-slate-300 font-medium">
                  Unit 402, 4th Floor, Magnum Global Park, Sector 58, Golf Course Ext Road, Gurugram, Haryana - 122011, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Privacy Queries</h3>
                <p className="mt-1 text-xs text-slate-800 dark:text-slate-300">
                  <a href="mailto:privacy@awasio.com" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
                    privacy@awasio.com
                  </a>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Grievance: grievance@awasio.com</p>
              </div>
            </div>
          </section>

          {/* Privacy Principles */}
          <section className="grid gap-4 sm:grid-cols-3">
            {principles.map(({ title, body, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </section>

          {/* Data Collection Categories */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Information We Collect &amp; How It Is Used
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {dataTypes.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                    {group.category}
                  </h3>
                  <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {group.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* User Rights under DPDPA 2023 */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Your Legal Rights (DPDPA 2023)
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              As a Data Principal under the Digital Personal Data Protection Act, 2023, you are entitled to:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <strong className="text-slate-900 dark:text-white block mb-1">Right to Access &amp; Summary:</strong>
                Request a complete summary of your personal data processed by Awasio and details of any third parties with whom it was shared.
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <strong className="text-slate-900 dark:text-white block mb-1">Right to Correction &amp; Erasure:</strong>
                Update inaccurate information or request permanent erasure of your account data (subject to statutory audit retention mandates).
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <strong className="text-slate-900 dark:text-white block mb-1">Right to Withdraw Consent:</strong>
                Withdraw your consent for marketing alerts, notifications, or contact disclosures at any time via your Profile Settings.
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <strong className="text-slate-900 dark:text-white block mb-1">Right of Grievance Redressal:</strong>
                Seek immediate time-bound redressal of any privacy concerns through our designated Grievance Officer.
              </div>
            </div>
          </section>

          {/* Grievance Officer & Statutory Details */}
          <section className="rounded-3xl border border-rose-200 bg-gradient-to-br from-white via-rose-50/40 to-white p-6 sm:p-8 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Data Protection &amp; Grievance Officer
            </h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              If you have any questions, concerns, or grievances regarding the processing of your personal data, please contact our designated Grievance Officer:
            </p>

            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Designated Officer</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">Vinay Kumar</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Designation: Nodal &amp; Grievance Officer</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Entity: Awasio Technologies Private Limited</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Communication Channels</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:grievance@awasio.com" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
                    grievance@awasio.com
                  </a>{" "}
                  (cc: <code>privacy@awasio.com</code>)
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  <strong>Helpline:</strong> +91-8848510629 (10:00 AM - 6:00 PM IST)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Postal Address:</strong> Grievance Redressal Cell, Awasio Technologies Private Limited, Unit 402, 4th Floor, Magnum Global Park, Sector 58, Golf Course Ext Road, Gurugram, Haryana - 122011, India.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Acknowledgement: Within 24-48 Hours
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" /> Grievance Resolution: Within 15 Calendar Days
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
