import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Clock,
  FileCheck,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  FileText,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Terms of Service & Regulatory Compliance",
  description:
    "Review the corporate terms of service, RERA intermediary disclosures, refund policies, and Grievance Redressal details for Awasio Technologies Private Limited.",
  alternates: { canonical: buildCanonical("/terms") },
  openGraph: {
    title: "Terms of Service & Regulatory Compliance | Awasio",
    description:
      "Review the corporate terms of service, RERA intermediary disclosures, refund policies, and Grievance Redressal details for Awasio Technologies Private Limited.",
    url: buildCanonical("/terms"),
    type: "website",
  },
};

const termsSections = [
  {
    id: "entity",
    title: "1. Corporate Entity & Intermediary Status",
    content: (
      <div className="space-y-3">
        <p>
          The website <strong>https://awasio.com</strong> and associated mobile applications (collectively, the &ldquo;Platform&rdquo;) are owned, operated, and maintained by <strong>Awasio Technologies Private Limited</strong> (&ldquo;Company&rdquo;, &ldquo;Awasio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), a company incorporated under the Indian Companies Act, 2013 (CIN: U72900HR2024PTC118942).
        </p>
        <p>
          Awasio operates strictly as an online marketplace intermediary under Section 79 of the Information Technology Act, 2000, and as a real estate digital advertising platform facilitating introductions between buyers, tenants, verified owners, and authorized real estate promoters/advisors. Awasio does not own, lease, develop, or guarantee properties listed on the platform.
        </p>
      </div>
    ),
  },
  {
    id: "rera",
    title: "2. Real Estate (Regulation and Development) Act (RERA) Compliance",
    content: (
      <div className="space-y-3">
        <p>
          In accordance with the Real Estate (Regulation and Development) Act, 2016 (&ldquo;RERA&rdquo;) and relevant state rules:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Haryana RERA (HRERA) Gurugram:</strong> Registered Real Estate Agent Certificate No. <code>HRERA-PKL-GGM-1422-2024</code>.
          </li>
          <li>
            <strong>Karnataka RERA (K-RERA) Bengaluru:</strong> Registered Real Estate Agent Certificate No. <code>PRM/KA/RERA/1251/310/AG/240915/004812</code>.
          </li>
          <li>
            <strong>Maharashtra RERA (MahaRERA) Mumbai:</strong> Registered Real Estate Agent Certificate No. <code>A51800041289</code>.
          </li>
        </ul>
        <p>
          <strong>Project RERA Mandatory Display:</strong> Developers, builders, and advertisers listing new residential projects or plotted developments on Awasio are legally mandated to display their valid State RERA Project Registration Number and sanctioning authority details.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <strong>Buyer Advisory:</strong> Prospective buyers are strongly advised to independently verify project approvals, title deeds, layout sanctions, and escrow bank accounts directly on official State RERA portals (e.g., rera.karnataka.gov.in, haryanarera.gov.in, maharera.mahaonline.gov.in) prior to paying any booking advance or signing an Agreement for Sale.
        </div>
      </div>
    ),
  },
  {
    id: "account",
    title: "3. User Accounts, Verification & Security",
    content: (
      <div className="space-y-3">
        <p>
          To access contact unlocks, schedule visits, or list properties, you must register using a valid email address and mobile number. You agree to provide true, accurate, and current information.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Accounts and login credentials (including passwords and email verification codes) are strictly personal and non-transferable.</li>
          <li>You are solely responsible for maintaining the confidentiality of your authentication credentials and all activities occurring under your account.</li>
          <li>Any unauthorized access, credential sharing, automated scraping, or data extraction without express written consent from Awasio is strictly prohibited and constitutes a civil and criminal violation.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "listings",
    title: "4. Listing Policy & Content Moderation",
    content: (
      <div className="space-y-3">
        <p>
          Users posting property listings (whether as Individual Owners, Real Estate Advisors, or Corporate Builders) warrant and represent that:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>They possess genuine legal authority, ownership, or written developer authorization to market the property.</li>
          <li>All information, photographs, videos, floor plans, pricing, and possession timelines are authentic and not misleading.</li>
          <li>Watermarked media belonging to third-party portals or non-consenting parties is strictly forbidden.</li>
        </ul>
        <p>
          Awasio reserves the unilateral right to suspend, flag, or permanently delete any listing that fails quality verification, receives verified fraud complaints, or violates local zoning laws.
        </p>
      </div>
    ),
  },
  {
    id: "billing",
    title: "5. Billing, Contact Credits & Refund Policy",
    content: (
      <div className="space-y-3">
        <p>
          Awasio offers paid subscription plans and credit packs allowing users and organizations to unlock verified owner contacts and feature property listings.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Pricing & Taxes:</strong> All plan prices are denominated in Indian Rupees (INR) and are subject to applicable Goods and Services Tax (GST).</li>
          <li><strong>Digital Goods & Instant Activation:</strong> Contact unlock credits and featured listing packages are activated immediately upon receipt of electronic payment confirmation.</li>
          <li><strong>Invalid Contact Refund SLA:</strong> If an unlocked owner contact number is proven disconnected, permanently invalid, or belongs to an unlisted third party within 7 days of unlock, our support team will credit 1 replacement unlock credit to your account upon review.</li>
          <li><strong>Cancellation:</strong> Subscription plans may be cancelled before auto-renewal. Expired credits or consumed unlocks are non-refundable.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "liability",
    title: "6. Limitation of Liability & Disclaimers",
    content: (
      <div className="space-y-3">
        <p>
          To the maximum extent permitted by applicable Indian law, Awasio, its directors, employees, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Physical site visits, landlord-tenant disputes, lease agreement breaches, or property condition discrepancies.</li>
          <li>Delays or construction failures by real estate developers or construction promoters.</li>
          <li>Any financial payments or token advances made directly between users outside Awasio&apos;s escrow mechanisms.</li>
        </ul>
      </div>
    ),
  },
];

export default function TermsPage() {
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
              <ShieldCheck className="h-4 w-4" /> Legal & Compliance
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
              Terms of Service & Regulatory Disclosures
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Please review these terms governing your access to and use of Awasio. By creating an account or browsing properties on our platform, you agree to comply with all applicable terms, RERA intermediary standards, and local real estate laws.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner dark:border-slate-800 dark:bg-slate-800">
                Entity: Awasio Technologies Pvt Ltd
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner dark:border-slate-800 dark:bg-slate-800">
                RERA Reg: HRERA &amp; K-RERA Compliant
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner dark:border-slate-800 dark:bg-slate-800">
                Updated: October 2026
              </span>
            </div>
          </header>

          {/* Corporate Summary Box */}
          <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registered Entity</h3>
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Legal Contact</h3>
                <p className="mt-1 text-xs text-slate-800 dark:text-slate-300">
                  <a href="mailto:legal@awasio.com" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
                    legal@awasio.com
                  </a>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Phone: +91-8848510629</p>
              </div>
            </div>
          </section>

          {/* Detailed Clauses */}
          <div className="space-y-4">
            {termsSections.map((section) => (
              <div
                key={section.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {section.title}
                </h2>
                <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Grievance Redressal Mechanism & Officer Section */}
          <section className="rounded-3xl border border-rose-200 bg-gradient-to-br from-white via-rose-50/40 to-white p-6 sm:p-8 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <Scale className="h-4 w-4" /> Statutory Compliance &amp; Consumer Protection
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              Grievance Redressal Mechanism &amp; Officer
            </h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Consumer Protection (E-Commerce) Rules, 2020, the contact details of the designated Nodal and Grievance Officer are set forth below:
            </p>

            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Grievance Officer Name</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">Vinay Kumar</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Designation: Nodal &amp; Grievance Officer</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Company: Awasio Technologies Private Limited</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Communication Details</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:grievance@awasio.com" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
                    grievance@awasio.com
                  </a>{" "}
                  (cc: <code>legal@awasio.com</code>)
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  <strong>Helpline:</strong> +91-8848510629 (Mon - Fri, 10:00 AM - 6:00 PM IST)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Postal Address:</strong> Grievance Redressal Cell, Awasio Technologies Private Limited, Unit 402, 4th Floor, Magnum Global Park, Sector 58, Golf Course Ext Road, Gurugram, Haryana - 122011, India.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <Clock className="h-4 w-4" /> Acknowledgement SLA: Within 24 Hours
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" /> Resolution SLA: Within 15 Days
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
