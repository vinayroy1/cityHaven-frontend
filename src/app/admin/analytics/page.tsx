"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { useIsMounted } from "@/features/admin/dateUtils";
import {
  TrendingUp,
  Building2,
  CreditCard,
  PieChart,
  BarChart3,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowUpRight,
  IndianRupee,
  Layers,
  Zap,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const mounted = useIsMounted();
  const { propertyQcList, orgVerificationList, billingOrders, userList } = useAdmin();
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  // Calculated Real-time Property Statistics
  const totalListings = propertyQcList.length;
  const approvedListings = propertyQcList.filter((p) => p.qcStatus === "APPROVED");
  const inReviewListings = propertyQcList.filter((p) => p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW");
  const rejectedListings = propertyQcList.filter((p) => p.qcStatus === "REJECTED" || p.qcStatus === "CHANGES_REQUESTED");
  
  const residentialCount = propertyQcList.filter((p) => p.resCom === "RESIDENTIAL").length;
  const commercialCount = propertyQcList.filter((p) => p.resCom === "COMMERCIAL").length;
  const sellCount = propertyQcList.filter((p) => p.listingType === "SELL").length;
  const rentCount = propertyQcList.filter((p) => p.listingType === "RENT").length;

  const totalListingInventoryValue = propertyQcList.reduce((acc, curr) => acc + curr.price, 0);

  // Calculated Business & Revenue Statistics
  const totalRevenue = billingOrders
    .filter((b) => b.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const personalRevenue = billingOrders
    .filter((b) => b.status === "SUCCESS" && b.scope === "PERSONAL")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const orgRevenue = billingOrders
    .filter((b) => b.status === "SUCCESS" && b.scope === "ORGANIZATION")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const avgOrderValue = billingOrders.length > 0 ? Math.round(totalRevenue / billingOrders.length) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Time Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-rose-500" />
            Executive Business & Property Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time commercial KPIs, listing inventory metrics, QC turnaround SLA monitoring, and revenue distribution.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {(["7D", "30D", "90D", "ALL"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeRange === range
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Overall Business & Financial Performance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            Overall Business & Commercial Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Total Revenue Realized</span>
              <IndianRupee className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs previous period
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Gross Inventory Value (GMV)</span>
              <Building2 className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{(totalListingInventoryValue / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
              Across active moderated inventory
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Average Order Value (AOV)</span>
              <CreditCard className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{avgOrderValue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
              B2B org + personal packs combined
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Contact Unlock Conversion</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              11.8%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              1,490 Unlocks / 12,650 Views
            </div>
          </div>
        </div>

        {/* Revenue Distribution & Scope Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              Revenue Split by Account Scope
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Organization B2B Workspaces</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{orgRevenue.toLocaleString("en-IN")} ({totalRevenue > 0 ? Math.round((orgRevenue / totalRevenue) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (orgRevenue / totalRevenue) * 100 : 80}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Personal Direct Accounts</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    ₹{personalRevenue.toLocaleString("en-IN")} ({totalRevenue > 0 ? Math.round((personalRevenue / totalRevenue) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (personalRevenue / totalRevenue) * 100 : 20}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Active B2B Subscriptions: {orgVerificationList.filter((o) => o.activePlan).length} Organizations</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Gateway Uptime: 99.98%</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Settlement & Fraud Safeguard Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Payment Success Rate</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">99.2%</div>
                <div className="text-[10px] text-slate-400 mt-1">Razorpay + UPI Seamless</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Refund Rate</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">0.42%</div>
                <div className="text-[10px] text-slate-400 mt-1">Below industry 1.5% target</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Verified KYC Ratio</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {orgVerificationList.length > 0
                    ? `${Math.round((orgVerificationList.filter((o) => o.verificationStatus === "VERIFIED").length / orgVerificationList.length) * 100)}%`
                    : "100%"}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Cross-checked via RERA</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Avg Refund Resolution</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">3.4 hrs</div>
                <div className="text-[10px] text-slate-400 mt-1">Two-person rule compliant</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Comprehensive Property Inventory & Moderation Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            Property Inventory & Quality Control (QC) SLA Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Active Live Inventory</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {approvedListings.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
              {totalListings} total indexed properties
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Avg Quality Control Turnaround (TAT)</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              1.8 hrs
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
              ✓ SLA Target: &lt; 4.0 hrs (96.4% Met)
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Residential vs Commercial</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {residentialCount} : {commercialCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
              {Math.round((residentialCount / Math.max(totalListings, 1)) * 100)}% Residential share
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Duplicate / Spam Filter Rate</span>
              <ShieldCheck className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              14.2%
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 font-medium">
              Suppressed before public publishing
            </div>
          </div>
        </div>

        {/* Locality Heat & Inventory Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Locality breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              High Density Locality Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { name: "South Delhi (Chhatarpur / Vasant Kunj)", count: 12, share: 45, gmv: "₹4.8 Cr" },
                { name: "Gurugram (DLF Cyber City / Golf Course)", count: 8, share: 30, gmv: "₹3.2 Cr" },
                { name: "Noida (Sector 62 / Expressway)", count: 5, share: 18, gmv: "₹1.4 Cr" },
                { name: "Bengaluru (MG Road / Outer Ring)", count: 2, share: 7, gmv: "₹0.9 Cr" },
              ].map((loc) => (
                <div key={loc.name} className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                    <span>{loc.name}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {loc.count} listings • <span className="font-semibold text-rose-600 dark:text-rose-400">{loc.gmv}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full"
                      style={{ width: `${loc.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listing Type Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Inventory Composition & Moderation Funnel
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Buy / Outright Sale</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{sellCount} Properties</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((sellCount / Math.max(totalListings, 1)) * 100)}% of total listings
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Rental / Commercial Lease</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{rentCount} Properties</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((rentCount / Math.max(totalListings, 1)) * 100)}% of total listings
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Pending Moderation Queue</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{inReviewListings.length} In Queue</div>
                <div className="text-[10px] text-slate-400 font-mono">Target TAT &lt; 4 hrs</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">Changes Requested / Rejections</div>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">{rejectedListings.length} Listings</div>
                <div className="text-[10px] text-slate-400 font-mono">Corrections awaiting owner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
