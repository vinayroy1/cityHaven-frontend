"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { UserAccountItem } from "@/features/admin/types";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  Users2,
  Search,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function AdminUsersPage() {
  const mounted = useIsMounted();
  const { userList, setUserAccountStatus, currentStaff } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAccountItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [actionModal, setActionModal] = useState<"SUSPEND" | "ACTIVATE" | "BLOCKED" | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredUsers = userList.filter((user) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.mobileNumber.includes(q) ||
        (user.email && user.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = () => {
    if (!selectedUser || !actionModal) return;

    if ((actionModal === "SUSPEND" || actionModal === "BLOCKED") && !suspensionReason.trim()) {
      alert("Please provide an audited reason for suspension/block action.");
      return;
    }

    const newStatus = actionModal === "SUSPEND" ? "SUSPENDED" : actionModal === "BLOCKED" ? "BLOCKED" : "ACTIVE";
    setUserAccountStatus(selectedUser.id, newStatus, suspensionReason);

    setSuccessMsg(`User ${selectedUser.name} (#${selectedUser.id}) status set to ${newStatus}`);
    setTimeout(() => setSuccessMsg(null), 4000);

    setActionModal(null);
    setSelectedUser(null);
    setSuspensionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-6 h-6 text-rose-500" />
            Customer Account & Workspace Lookup
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search customer records, investigate listing abuse, manage account suspensions, and view credit balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm">
            Indexed Accounts: <span className="text-rose-600 dark:text-rose-400 font-bold">{userList.length}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer account by full name, registered mobile (+91), or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Customer Name & ID</th>
                <th className="py-3.5 px-4">Contact Coordinates</th>
                <th className="py-3.5 px-4">Listings & Orgs</th>
                <th className="py-3.5 px-4">Credits & Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No customer accounts found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.isKycVerified && (
                          <span title="KYC Verified Customer">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        Account ID: #{user.id} • Registered {mounted ? formatDateSafe(user.createdAt) : "Recently"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-800 dark:text-slate-200">{user.mobileNumber}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{user.email || "No email linked"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200">{user.listingsCount} Listings Posted</div>
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                        {user.organizationsCount > 0 ? `${user.organizationsCount} Org Workspaces` : "Personal Only"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{user.credits} Credits</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        ₹{user.totalSpent.toLocaleString("en-IN")} Lifetime Spent
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {user.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {user.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {user.status === "ACTIVE" ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal("SUSPEND");
                            setSuspensionReason("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 text-xs font-semibold transition cursor-pointer"
                        >
                          Suspend Account
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal("ACTIVATE");
                            setSuspensionReason("Restoration approved by support");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 text-xs font-semibold transition cursor-pointer"
                        >
                          Restore Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Confirmation Dialog */}
      {actionModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {actionModal === "SUSPEND" ? "Suspend Customer Account" : "Restore Customer Account"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Target: <span className="text-slate-900 dark:text-white font-semibold">{selectedUser.name}</span> ({selectedUser.mobileNumber})
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audited Reason / Support Ticket Reference
              </label>
              <textarea
                rows={3}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Terms violation - fake listing reported in Ticket #4928"
                className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className={`px-4 py-2 font-semibold rounded-xl text-xs text-white ${
                  actionModal === "SUSPEND" ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                Confirm {actionModal === "SUSPEND" ? "Suspension" : "Restoration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
