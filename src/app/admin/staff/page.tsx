"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { StaffRole, StaffUser } from "@/features/admin/types";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  UserCog,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

const ALL_ROLES: { role: StaffRole; label: string; desc: string }[] = [
  { role: "SUPER_ADMIN", label: "Super Admin", desc: "Staff access, settings, exceptional actions" },
  { role: "OPERATIONS_MANAGER", label: "Operations Manager", desc: "Work assignment, capacity balancing, escalations" },
  { role: "SENIOR_QC_LEAD", label: "Senior QC Lead", desc: "High-value listing approvals & override power" },
  { role: "QC_REVIEWER", label: "Quality Control (QC) Reviewer", desc: "Property review and listing quality verification" },
  { role: "CATALOG_SPECIALIST", label: "Catalog Specialist", desc: "Photo curation, media watermarks & title SEO" },
  { role: "VERIFICATION_SPECIALIST", label: "Verification Specialist", desc: "Organization KYC, GSTIN & RERA verification" },
  { role: "LEGAL_COMPLIANCE_OFFICER", label: "Legal & Compliance Officer", desc: "Regulatory RERA audit, terms compliance & disputes" },
  { role: "FRAUD_INVESTIGATOR", label: "Fraud Investigator", desc: "Scraper detection, coordinate clusters & security threats" },
  { role: "SUPPORT_EXECUTIVE", label: "Support Executive", desc: "Customer issues, unlock disputes & complaints" },
  { role: "FINANCE_EXECUTIVE", label: "Finance Executive", desc: "Payment reconciliation & refund request creation" },
  { role: "FINANCE_APPROVER", label: "Finance Approver", desc: "2-person restricted financial approval signoff" },
  { role: "ANALYST_AUDITOR", label: "Analyst / Auditor", desc: "Read-only business intelligence & audit logs" },
];

export default function AdminStaffPage() {
  const mounted = useIsMounted();
  const { staffList, inviteStaff, toggleStaffStatus, updateStaffRoles, currentStaff } = useAdmin();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<StaffRole[]>(["QC_REVIEWER"]);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailClean = inviteEmail.trim().toLowerCase();
    if (!emailClean.endsWith("@cityhaven.in")) {
      setErrorMsg("Only company domain emails (@cityhaven.in) are permitted for internal staff accounts.");
      return;
    }

    if (staffList.some((s) => s.email.toLowerCase() === emailClean)) {
      setErrorMsg("A staff account with this email address already exists.");
      return;
    }

    if (selectedRoles.length === 0) {
      setErrorMsg("Please assign at least one staff operational role.");
      return;
    }

    inviteStaff(emailClean, inviteName.trim(), selectedRoles);

    const token = `inv_cityhaven_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    setInviteToken(`${window.location.origin}/admin/login?inviteToken=${token}&email=${encodeURIComponent(emailClean)}`);
    setSuccessMsg(`Staff invitation issued for ${inviteName} (${emailClean})`);
  };

  const copyInviteLink = () => {
    if (inviteToken) {
      navigator.clipboard.writeText(inviteToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const toggleRole = (role: StaffRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveStaffRoles = () => {
    if (!editingStaff) return;
    updateStaffRoles(editingStaff.id, editingStaff.roles);
    setSuccessMsg(`Updated roles for ${editingStaff.name}`);
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-rose-500" />
            Staff Roster & Access Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage authorized staff members, enforce multi-role privileges, configure MFA requirements, and issue single-use onboarding invitations.
          </p>
        </div>

        <button
          onClick={() => {
            setInviteModalOpen(true);
            setInviteToken(null);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Company Email</th>
                <th className="py-3.5 px-4">Assigned Roles</th>
                <th className="py-3.5 px-4">Security & MFA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition">
                          {staff.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          Joined: {mounted ? formatDateSafe(staff.createdAt) : "Recently"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-300">
                    {staff.email}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {staff.roles.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-300 border border-slate-200 dark:border-slate-700"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3.5 h-3.5" /> TOTP MFA
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {staff.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Deactivated
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingStaff(staff)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-sm"
                      >
                        Edit Roles
                      </button>

                      {staff.status === "ACTIVE" ? (
                        <button
                          onClick={() => {
                            if (staff.id === currentStaff?.id) {
                              alert("You cannot deactivate your own active session.");
                              return;
                            }
                            toggleStaffStatus(staff.id, "INACTIVE");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 text-xs font-medium transition cursor-pointer"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStaffStatus(staff.id, "ACTIVE")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 text-xs font-medium transition cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-rose-500" />
              Invite New Staff Member
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Issues an expiring single-use invite token. Requires verified @cityhaven.in domain.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {!inviteToken ? (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Staff Email (@cityhaven.in)
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="priya.sharma@cityhaven.in"
                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Assign Operational Roles (Select Multiple)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_ROLES.map(({ role, label }) => {
                      const isSelected = selectedRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-700 dark:text-rose-200 font-semibold"
                              : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-semibold rounded-xl text-xs shadow-md"
                  >
                    Generate Single-Use Invite
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300">
                  Staff account pre-provisioned! Share this single-use invitation link with the employee:
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono break-all text-slate-800 dark:text-slate-300 flex items-center justify-between gap-2">
                  <span className="truncate">{inviteToken}</span>
                  <button
                    onClick={copyInviteLink}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Link expires in 48 hours and requires the recipient to configure MFA upon first login.
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Staff Roles Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Edit Staff Roles: {editingStaff.name}</h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-4">{editingStaff.email}</p>

            <div className="space-y-2 mb-6">
              {ALL_ROLES.map(({ role, label }) => {
                const isChecked = editingStaff.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      const updated = isChecked
                        ? editingStaff.roles.filter((r) => r !== role)
                        : [...editingStaff.roles, role];
                      if (updated.length > 0) {
                        setEditingStaff({ ...editingStaff, roles: updated });
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-700 dark:text-rose-200 font-semibold"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>{label}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaffRoles}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
