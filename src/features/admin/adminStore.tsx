"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { APP_CONFIG } from "@/constants/app-config";
import { adminApi } from "./api";
import type {
  StaffUser,
  StaffRole,
  PropertyQcItem,
  PropertyQcStatus,
  OrgVerificationItem,
  OrgVerificationStatus,
  UserAccountItem,
  AdminBillingOrder,
  AdminAuditLog,
  AdminRefundCase,
  AdminDisputeCase,
  AdminContactUnlockTrace,
  AdminFraudAlert,
  AdminDocumentQcItem,
  DisputeStatus,
  AdminGovernanceSettings,
} from "./types";
import { DEFAULT_GOVERNANCE_SETTINGS } from "./defaults";

interface AdminContextType {
  isHydrated: boolean;
  currentStaff: StaffUser | null;
  setCurrentStaff: (staff: StaffUser | null) => void;
  staffList: StaffUser[];
  propertyQcList: PropertyQcItem[];
  documentQcList: AdminDocumentQcItem[];
  orgVerificationList: OrgVerificationItem[];
  userList: UserAccountItem[];
  billingOrders: AdminBillingOrder[];
  refundCases: AdminRefundCase[];
  disputeCases: AdminDisputeCase[];
  contactUnlocks: AdminContactUnlockTrace[];
  fraudAlerts: AdminFraudAlert[];
  auditLogs: AdminAuditLog[];
  
  // Actions
  requestOtp: (email: string) => Promise<{ success: boolean; message: string; email?: string; devOtp?: string }>;
  loginStaff: (loginId: string, secret?: string, isPassword?: boolean) => Promise<{ success: boolean; message?: string }>;
  logoutStaff: () => void;
  switchStaffRole: (role: StaffRole) => void;
  hasPermission: (permission: AdminPermission) => boolean;
  canApproveRefund: (caseItem: AdminRefundCase) => boolean;
  
  // Staff management
  inviteStaff: (email: string, name: string, roles: StaffRole[]) => Promise<void>;
  toggleStaffStatus: (staffId: number, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => void;
  updateStaffRoles: (staffId: number, roles: StaffRole[]) => void;
  
  // Property QC
  reviewPropertyQc: (propertyId: number, status: PropertyQcStatus, notes?: string) => void;
  suspendProperty: (propertyId: number, reason: string) => void;
  
  // Document QC
  reviewDocumentQc: (documentId: number, action: "APPROVE" | "REJECT", reason?: string, grantPropertyBadge?: boolean) => Promise<any>;
  fetchDocumentQueue: () => Promise<void>;
  
  // Org Verification
  reviewOrgVerification: (orgId: number, status: OrgVerificationStatus, notes?: string) => void;
  updateOrgAllowance: (orgId: number, updates: { seatsLimit?: number; contactCredits?: number }) => void;
  
  // User Management
  setUserAccountStatus: (userId: number, status: "ACTIVE" | "SUSPENDED" | "BLOCKED", reason?: string) => void;
  
  // Refunds & Finance
  requestRefund: (orderNumber: string, targetName: string, amount: number, reason: string) => void;
  decideRefund: (caseId: string | number, status: "APPROVED" | "REJECTED") => void;

  // Disputes & Leads
  updateDisputeStatus: (caseId: string, status: DisputeStatus, notes?: string) => void;
  assignDispute: (caseId: string, staffName: string) => void;

  // Fraud & Security
  resolveFraudAlert: (alertId: string, status: "RESOLVED" | "DISMISSED") => void;
  
  // Governance & Workload Distribution
  governanceSettings: AdminGovernanceSettings;
  updateGovernanceSettings: (settings: Partial<AdminGovernanceSettings>, reason?: string) => void;
  autoDistributeWorkload: (targetPool?: "PROPERTY" | "ORGANIZATION" | "DISPUTE" | "ALL") => Promise<{ assignedCount: number; message: string }>;
  assignTicketToStaff: (targetType: "PROPERTY" | "ORGANIZATION" | "DISPUTE", targetId: number | string, staffId: number) => void;

  // Audit
  logAuditAction: (action: string, targetType: AdminAuditLog["targetType"], targetId: string | number, reason?: string, details?: Record<string, any>) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

type AdminPermission =
  | "STAFF_MANAGE"
  | "PROPERTY_QC_REVIEW"
  | "PROPERTY_QC_SUSPEND"
  | "ORG_VERIFY"
  | "ORG_ALLOWANCE_UPDATE"
  | "USER_STATUS_UPDATE"
  | "REFUND_REQUEST"
  | "REFUND_DECIDE"
  | "DISPUTE_MANAGE"
  | "FRAUD_RESOLVE"
  | "GOVERNANCE_UPDATE"
  | "WORKLOAD_ASSIGN";

const PERMISSION_ROLES: Record<AdminPermission, StaffRole[]> = {
  STAFF_MANAGE: ["SUPER_ADMIN"],
  PROPERTY_QC_REVIEW: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SENIOR_QC_LEAD", "QC_REVIEWER", "CATALOG_SPECIALIST"],
  PROPERTY_QC_SUSPEND: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SENIOR_QC_LEAD"],
  ORG_VERIFY: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "VERIFICATION_SPECIALIST", "LEGAL_COMPLIANCE_OFFICER"],
  ORG_ALLOWANCE_UPDATE: ["SUPER_ADMIN", "OPERATIONS_MANAGER"],
  USER_STATUS_UPDATE: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SUPPORT_EXECUTIVE", "FRAUD_INVESTIGATOR"],
  REFUND_REQUEST: ["SUPER_ADMIN", "FINANCE_EXECUTIVE"],
  REFUND_DECIDE: ["SUPER_ADMIN", "FINANCE_APPROVER"],
  DISPUTE_MANAGE: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SUPPORT_EXECUTIVE", "LEGAL_COMPLIANCE_OFFICER", "FINANCE_EXECUTIVE"],
  FRAUD_RESOLVE: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "FRAUD_INVESTIGATOR"],
  GOVERNANCE_UPDATE: ["SUPER_ADMIN"],
  WORKLOAD_ASSIGN: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SENIOR_QC_LEAD"],
};

function staffHasPermission(staff: StaffUser | null, permission: AdminPermission) {
  if (!staff || staff.status !== "ACTIVE") return false;
  return staff.roles.some((role) => PERMISSION_ROLES[permission].includes(role));
}

/** Only the session (token + own staff profile) is stored. Other keys are legacy caches we now purge. */
const STORAGE_KEYS = {
  CURRENT_STAFF: "awasio_admin_current_staff",
  STAFF_LIST: "awasio_admin_staff_roster",
  QC_QUEUE: "awasio_admin_qc_queue",
  DOCUMENT_QC: "awasio_admin_document_qc",
  ORG_VERIF: "awasio_admin_org_verifications",
  USERS: "awasio_admin_users",
  BILLING: "awasio_admin_billing_orders",
  REFUNDS: "awasio_admin_refunds",
  DISPUTES: "awasio_admin_disputes",
  UNLOCKS: "awasio_admin_contact_unlocks",
  FRAUD: "awasio_admin_fraud_alerts",
  AUDIT: "awasio_admin_audit_logs",
  GOVERNANCE: "awasio_admin_governance_settings",
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStaff, setCurrentStaffState] = useState<StaffUser | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [propertyQcList, setPropertyQcList] = useState<PropertyQcItem[]>([]);
  const [documentQcList, setDocumentQcList] = useState<AdminDocumentQcItem[]>([]);
  const [orgVerificationList, setOrgVerificationList] = useState<OrgVerificationItem[]>([]);
  const [userList, setUserList] = useState<UserAccountItem[]>([]);
  const [billingOrders, setBillingOrders] = useState<AdminBillingOrder[]>([]);
  const [refundCases, setRefundCases] = useState<AdminRefundCase[]>([]);
  const [disputeCases, setDisputeCases] = useState<AdminDisputeCase[]>([]);
  const [contactUnlocks, setContactUnlocks] = useState<AdminContactUnlockTrace[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<AdminFraudAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [governanceSettings, setGovernanceSettings] = useState<AdminGovernanceSettings>(DEFAULT_GOVERNANCE_SETTINGS);

  /** Loads every admin collection from the API. A failed call leaves that list empty (never mock data). */
  const loadAdminData = async () => {
    const [staffRoster, properties, documents, organizations, users, billing, refunds, disputes, fraud, unlocks, audit, governance] =
      await Promise.allSettled([
        adminApi.listStaff(),
        adminApi.listPropertyQueue(),
        adminApi.listDocumentQueue(),
        adminApi.listOrganizations(),
        adminApi.listUsers(),
        adminApi.listBillingOrders(),
        adminApi.listRefunds(),
        adminApi.listDisputes(),
        adminApi.listFraudAlerts(),
        adminApi.listContactUnlocks(),
        adminApi.listAuditLogs(),
        adminApi.getGovernance(),
      ]);
    const list = <T,>(r: PromiseSettledResult<T[] | undefined>): T[] => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
    setStaffList(list(staffRoster));
    setPropertyQcList(list(properties));
    if (documents.status === "fulfilled" && documents.value) {
      const docs = documents.value as unknown;
      setDocumentQcList(Array.isArray(docs) ? docs : ((docs as { data?: AdminDocumentQcItem[] }).data ?? []));
    } else {
      setDocumentQcList([]);
    }
    setOrgVerificationList(list(organizations));
    setUserList(list(users));
    setBillingOrders(list(billing));
    setRefundCases(list(refunds));
    setDisputeCases(list(disputes));
    setFraudAlerts(list(fraud));
    setContactUnlocks(list(unlocks));
    setAuditLogs(list(audit));
    if (governance.status === "fulfilled" && governance.value) setGovernanceSettings(governance.value);
  };

  /** Removes the admin session and any data older builds cached in the browser. */
  const clearAdminStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  // Restore the session from the stored token, then load live data.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;
    // Purge list caches written by older builds (they held user/staff data).
    Object.entries(STORAGE_KEYS).forEach(([k, v]) => {
      if (k !== "CURRENT_STAFF") localStorage.removeItem(v);
    });

    const hydrate = async () => {
      const token = localStorage.getItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY);
      if (!token || token === "dev_admin_token") {
        clearAdminStorage();
        if (alive) {
          setCurrentStaffState(null);
          setIsHydrated(true);
        }
        return;
      }
      try {
        const staff = await adminApi.me();
        if (!alive) return;
        setCurrentStaffState(staff);
        localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(staff));
        await loadAdminData();
      } catch (err) {
        console.warn("Admin session is no longer valid:", err);
        clearAdminStorage();
        if (alive) setCurrentStaffState(null);
      } finally {
        if (alive) setIsHydrated(true);
      }
    };
    void hydrate();

    return () => {
      alive = false;
    };
  }, []);

  const setCurrentStaff = (staff: StaffUser | null) => {
    setCurrentStaffState(staff);
    if (typeof window !== "undefined") {
      if (staff) localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(staff));
      else localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
    }
  };

  const logAuditAction = (
    action: string,
    targetType: AdminAuditLog["targetType"],
    targetId: string | number,
    reason?: string,
    details?: Record<string, any>
  ) => {
    if (!currentStaff) return;
    const newEntry: AdminAuditLog = {
      id: `AUD-${Date.now()}`,
      actorId: currentStaff.id,
      actorName: currentStaff.name,
      actorEmail: currentStaff.email,
      actorRole: currentStaff.roles[0],
      action,
      targetType,
      targetId,
      reason,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const requestOtp = async (email: string) => {
    return adminApi.requestOtp(email);
  };

  const loginStaff = async (loginId: string, secret?: string, isPassword?: boolean) => {
    if (!secret || secret.trim().length === 0) {
      return { success: false, message: isPassword ? "Password is required." : "Valid verification code required." };
    }

    const cleanLoginId = loginId.trim();

    try {
      const loginRes = await adminApi.login(cleanLoginId, secret.trim(), isPassword);
      const token = (loginRes as any)?.accessToken || (loginRes as any)?.token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY, token);
      }
      if ((loginRes as any)?.staff) {
        setCurrentStaff((loginRes as any).staff);
      }

      await loadAdminData();

      return { success: true };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials or unauthorized staff account.";
      return { success: false, message: msg };
    }
  };

  const logoutStaff = () => {
    clearAdminStorage();
    setCurrentStaff(null);
    setStaffList([]);
    setPropertyQcList([]);
    setDocumentQcList([]);
    setOrgVerificationList([]);
    setUserList([]);
    setBillingOrders([]);
    setRefundCases([]);
    setDisputeCases([]);
    setFraudAlerts([]);
    setContactUnlocks([]);
    setAuditLogs([]);
  };

  const switchStaffRole = (role: StaffRole) => {
    if (!currentStaff) return;
    if (!currentStaff.roles.includes(role)) return;
    const updated = { ...currentStaff, roles: [role, ...currentStaff.roles.filter((r) => r !== role)] };
    setCurrentStaff(updated);
  };

  const hasPermission = (permission: AdminPermission) => staffHasPermission(currentStaff, permission);

  const assertPermission = (permission: AdminPermission) => {
    if (staffHasPermission(currentStaff, permission)) return true;
    logAuditAction("ADMIN_PERMISSION_DENIED", "STAFF", currentStaff?.id || "ANONYMOUS", `Missing permission: ${permission}`);
    return false;
  };

  const canApproveRefund = (caseItem: AdminRefundCase) => {
    return staffHasPermission(currentStaff, "REFUND_DECIDE") && currentStaff?.id !== caseItem.requestedById;
  };

  const inviteStaff = async (email: string, name: string, roles: StaffRole[]) => {
    if (!assertPermission("STAFF_MANAGE")) return;
    const newMember = await adminApi.inviteStaff({ email, name, roles });
    setStaffList((prev) => {
      const updated = [...prev, newMember];
      return updated;
    });
    logAuditAction("STAFF_INVITED", "STAFF", newMember.id, `Invited with roles: ${roles.join(", ")}`);
  };

  const toggleStaffStatus = async (staffId: number, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => {
    if (!assertPermission("STAFF_MANAGE")) return;
    if (status !== "ACTIVE") await adminApi.deactivateStaff(staffId);
    setStaffList((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, status } : s));
      return updated;
    });
    if (currentStaff?.id === staffId && status !== "ACTIVE") setCurrentStaff(null);
    logAuditAction("STAFF_STATUS_UPDATED", "STAFF", staffId, `Status changed to ${status}`);
  };

  const updateStaffRoles = async (staffId: number, roles: StaffRole[]) => {
    if (!assertPermission("STAFF_MANAGE")) return;
    await adminApi.updateStaffRoles(staffId, roles);
    setStaffList((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, roles } : s));
      return updated;
    });
    if (currentStaff?.id === staffId) {
      const activeRole = currentStaff.roles[0];
      const nextRoles = roles.length ? roles : currentStaff.roles;
      setCurrentStaff({ ...currentStaff, roles: nextRoles.includes(activeRole) ? [activeRole, ...nextRoles.filter((r) => r !== activeRole)] : nextRoles });
    }
    logAuditAction("STAFF_ROLES_MODIFIED", "STAFF", staffId, `Roles updated to: ${roles.join(", ")}`);
  };

  const reviewPropertyQc = async (propertyId: number, status: PropertyQcStatus, notes?: string) => {
    if (!assertPermission(status === "SUSPENDED" ? "PROPERTY_QC_SUSPEND" : "PROPERTY_QC_REVIEW")) {
      throw new Error(`Insufficient staff permissions for QC review status: ${status}`);
    }
    if (status === "SUSPENDED") await adminApi.suspendProperty(propertyId, notes || "Suspended by admin review");
    else await adminApi.reviewProperty(propertyId, status, notes);
    setPropertyQcList((prev) => {
      const updated = prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              qcStatus: status,
              qcNotes: notes || null,
              qcReviewerId: currentStaff?.id || 10,
              qcReviewerName: currentStaff?.name || "Vinay Admin",
              reviewedAt: new Date().toISOString(),
            }
          : p
      );
      return updated;
    });
    logAuditAction(`PROPERTY_QC_${status}`, "PROPERTY", propertyId, notes || `QC status set to ${status}`);
  };

  const suspendProperty = async (propertyId: number, reason: string) => {
    return reviewPropertyQc(propertyId, "SUSPENDED", reason);
  };

  const fetchDocumentQueue = async () => {
    try {
      const docs = await adminApi.listDocumentQueue();
      const docsList = Array.isArray(docs) ? docs : (docs as any)?.data || [];
      setDocumentQcList(docsList);
    } catch (e) {
      console.warn("Failed fetching document queue:", e);
    }
  };

  const reviewDocumentQc = async (
    documentId: number,
    action: "APPROVE" | "REJECT",
    reason?: string,
    grantPropertyBadge?: boolean
  ) => {
    const res = await adminApi.reviewDocument(documentId, { action, reason, grantPropertyBadge });
    setDocumentQcList((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              status: action === "APPROVE" ? "VERIFIED" : "REJECTED",
              reviewedAt: new Date().toISOString(),
              reviewerName: currentStaff?.name || "QC Admin",
              rejectionReason: action === "REJECT" ? reason || "Rejected by QC" : null,
              notes: reason || d.notes,
            }
          : d
      )
    );
    if (action === "APPROVE" && res?.propertyBadgeGranted && res?.propertyId) {
      setPropertyQcList((prev) =>
        prev.map((p) =>
          p.id === res.propertyId
            ? { ...p, qcStatus: "APPROVED", verifiedById: currentStaff?.id || 10 }
            : p
        )
      );
    }
    logAuditAction(
      `DOCUMENT_QC_${action === "APPROVE" ? "APPROVED" : "REJECTED"}`,
      "PROPERTY",
      documentId,
      reason || `Document marked as ${action === "APPROVE" ? "VERIFIED" : "REJECTED"}`
    );
    return res;
  };

  const reviewOrgVerification = async (orgId: number, status: OrgVerificationStatus, notes?: string) => {
    if (!assertPermission("ORG_VERIFY")) {
      throw new Error("Insufficient staff permissions for organization verification");
    }
    await adminApi.reviewOrganization(orgId, status, notes);
    setOrgVerificationList((prev) => {
      const updated = prev.map((o) =>
        o.id === orgId
          ? {
              ...o,
              verificationStatus: status,
              verificationNotes: notes || null,
              assignedSpecialistName: currentStaff?.name || "Vinay Admin",
              verifiedAt: status === "VERIFIED" ? new Date().toISOString() : o.verifiedAt,
            }
          : o
      );
      return updated;
    });
    logAuditAction(`ORGANIZATION_VERIFICATION_${status}`, "ORGANIZATION", orgId, notes || `Status changed to ${status}`);
  };

  const updateOrgAllowance = async (orgId: number, updates: { seatsLimit?: number; contactCredits?: number }) => {
    if (!assertPermission("ORG_ALLOWANCE_UPDATE")) return;
    await adminApi.updateOrganizationAllowance(orgId, updates);
    setOrgVerificationList((prev) => {
      const updated = prev.map((o) =>
        o.id === orgId
          ? {
              ...o,
              seatsLimit: updates.seatsLimit !== undefined ? updates.seatsLimit : o.seatsLimit,
              contactCredits: updates.contactCredits !== undefined ? updates.contactCredits : o.contactCredits,
            }
          : o
      );
      return updated;
    });
    logAuditAction("ORGANIZATION_ALLOWANCE_MODIFIED", "ORGANIZATION", orgId, `Updated: ${JSON.stringify(updates)}`);
  };

  const setUserAccountStatus = async (userId: number, status: "ACTIVE" | "SUSPENDED" | "BLOCKED", reason?: string) => {
    if (!assertPermission("USER_STATUS_UPDATE")) return;
    await adminApi.updateUserStatus(userId, status, reason);
    setUserList((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status, suspensionReason: reason } : u));
      return updated;
    });
    logAuditAction(`USER_ACCOUNT_${status}`, "USER", userId, reason || `User status changed to ${status}`);
  };

  const requestRefund = async (orderNumber: string, targetName: string, amount: number, reason: string) => {
    if (!assertPermission("REFUND_REQUEST")) return;
    const newCase = await adminApi.requestRefund({ orderNumber, targetName, amount, reason });
    setRefundCases((prev) => {
      const updated = [newCase, ...prev];
      return updated;
    });
    logAuditAction("REFUND_REQUESTED", "BILLING", orderNumber, reason, { amount });
  };

  const decideRefund = async (caseId: string | number, status: "APPROVED" | "REJECTED") => {
    const caseItem = refundCases.find((c) => c.id === caseId);
    if (!caseItem || !canApproveRefund(caseItem)) {
      logAuditAction("REFUND_DECISION_DENIED", "BILLING", caseId, "Two-person refund approval rule failed");
      return;
    }
    const updatedCase = await adminApi.decideRefund(caseId, status);
    setRefundCases((prev) => {
      const updated = prev.map((c) =>
        c.id === caseId ? { ...c, ...updatedCase } : c
      );
      return updated;
    });
    logAuditAction(`REFUND_${status}`, "BILLING", caseId, `Refund case ${status.toLowerCase()} by ${currentStaff?.name}`);
  };

  const updateDisputeStatus = async (caseId: string, status: DisputeStatus, notes?: string) => {
    if (!assertPermission("DISPUTE_MANAGE")) return;
    await adminApi.updateDisputeStatus(caseId, status, notes);
    setDisputeCases((prev) => {
      const updated = prev.map((d) => (d.id === caseId ? { ...d, status, notes: notes || d.notes, updatedAt: new Date().toISOString() } : d));
      return updated;
    });
    logAuditAction(`DISPUTE_${status}`, "DISPUTE", caseId, notes || `Dispute status updated to ${status}`);
  };

  const assignDispute = async (caseId: string, staffName: string) => {
    if (!assertPermission("DISPUTE_MANAGE")) return;
    await adminApi.assignDispute(caseId, staffName);
    setDisputeCases((prev) => {
      const updated = prev.map((d) =>
        d.id === caseId
          ? {
              ...d,
              assignedTo: staffName,
              status: "ASSIGNED" as DisputeStatus,
              updatedAt: new Date().toISOString(),
            }
          : d
      );
      return updated;
    });
    logAuditAction("DISPUTE_ASSIGNED", "DISPUTE", caseId, `Assigned to ${staffName}`);
  };

  const resolveFraudAlert = async (alertId: string, status: "RESOLVED" | "DISMISSED") => {
    if (!assertPermission("FRAUD_RESOLVE")) return;
    await adminApi.resolveFraudAlert(alertId, status);
    setFraudAlerts((prev) => {
      const updated = prev.map((f) => (f.id === alertId ? { ...f, status } : f));
      return updated;
    });
    logAuditAction(`FRAUD_ALERT_${status}`, "PROPERTY", alertId, `Fraud alert marked as ${status}`);
  };

  const updateGovernanceSettings = async (settings: Partial<AdminGovernanceSettings>, reason?: string) => {
    if (!assertPermission("GOVERNANCE_UPDATE")) return;
    const updated = await adminApi.updateGovernance(settings, reason || "Governance policies updated by Super Admin");
    setGovernanceSettings(updated);
    logAuditAction("PLATFORM_GOVERNANCE_UPDATED", "SETTING", "SYSTEM_POLICIES", reason || `Policy changed: ${Object.keys(settings).join(", ")}`);
  };

  const assignTicketToStaff = async (targetType: "PROPERTY" | "ORGANIZATION" | "DISPUTE", targetId: number | string, staffId: number) => {
    if (!assertPermission("WORKLOAD_ASSIGN")) return;
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff || staff.status !== "ACTIVE") return;

    await adminApi.assignTicket(targetType, targetId, staffId);

    if (targetType === "PROPERTY") {
      setPropertyQcList((prev) => {
        const updated = prev.map((p) =>
          p.id === Number(targetId)
            ? { ...p, qcReviewerId: staff.id, qcReviewerName: staff.name, qcStatus: p.qcStatus === "SUBMITTED" ? "UNDER_REVIEW" : p.qcStatus }
            : p
        );
        return updated;
      });
      logAuditAction("PROPERTY_QC_REASSIGNED", "PROPERTY", targetId, `Assigned to reviewer ${staff.name}`);
    } else if (targetType === "ORGANIZATION") {
      setOrgVerificationList((prev) => {
        const updated = prev.map((o) =>
          o.id === Number(targetId)
            ? { ...o, assignedSpecialistName: staff.name, verificationStatus: o.verificationStatus === "UNVERIFIED" ? "PENDING_REVIEW" : o.verificationStatus }
            : o
        );
        return updated;
      });
      logAuditAction("ORGANIZATION_KYC_REASSIGNED", "ORGANIZATION", targetId, `Assigned to KYC specialist ${staff.name}`);
    } else if (targetType === "DISPUTE") {
      setDisputeCases((prev) => {
        const updated = prev.map((d) =>
          d.id === String(targetId)
            ? { ...d, assignedTo: staff.name, status: d.status === "OPEN" ? "ASSIGNED" : d.status }
            : d
        );
        return updated;
      });
      logAuditAction("DISPUTE_REASSIGNED", "DISPUTE", targetId, `Assigned to dispute executive ${staff.name}`);
    }
  };

  const autoDistributeWorkload = async (targetPool: "PROPERTY" | "ORGANIZATION" | "DISPUTE" | "ALL" = "ALL") => {
    if (!assertPermission("WORKLOAD_ASSIGN")) {
      return { assignedCount: 0, message: "You do not have permission to auto-distribute workload." };
    }
    if (!governanceSettings.autoAssignEnabled || governanceSettings.routingStrategy === "MANUAL_CLAIM") {
      return { assignedCount: 0, message: "Auto-assignment is disabled. Reviewers can claim work manually." };
    }
    let totalAssigned = 0;
    const strategy = governanceSettings.routingStrategy;
    const maxActive = governanceSettings.maxActiveTicketsPerAgent;

    const getActiveLoad = (staffName: string) =>
      propertyQcList.filter((p) => p.qcReviewerName === staffName && (p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW")).length +
      orgVerificationList.filter((o) => o.assignedSpecialistName === staffName && (o.verificationStatus === "UNVERIFIED" || o.verificationStatus === "PENDING_REVIEW")).length +
      disputeCases.filter((d) => d.assignedTo === staffName && d.status !== "RESOLVED" && d.status !== "CLOSED").length;

    const pickStaff = (pool: StaffUser[], assignedInRun: Record<number, number>, roundRobinIndex: number) => {
      const available = pool.filter((s) => getActiveLoad(s.name) + (assignedInRun[s.id] || 0) < maxActive);
      if (!available.length) return null;
      if (strategy === "LEAST_LOADED") {
        return available.reduce((least, staff) => {
          const leastLoad = getActiveLoad(least.name) + (assignedInRun[least.id] || 0);
          const staffLoad = getActiveLoad(staff.name) + (assignedInRun[staff.id] || 0);
          return staffLoad < leastLoad ? staff : least;
        }, available[0]);
      }
      return available[roundRobinIndex % available.length];
    };

    // Build the plan first, then persist each assignment through the API.
    type Planned = { type: "PROPERTY" | "ORGANIZATION" | "DISPUTE"; id: number | string; staff: StaffUser };
    const plan: Planned[] = [];
    const planPool = <T,>(
      type: Planned["type"],
      items: T[],
      isOpen: (item: T) => boolean,
      idOf: (item: T) => number | string,
      pool: StaffUser[],
    ) => {
      if (!pool.length) return;
      const assignedInRun: Record<number, number> = {};
      let index = 0;
      for (const item of items) {
        if (!isOpen(item)) continue;
        const staff = pickStaff(pool, assignedInRun, index);
        if (!staff) break;
        index++;
        assignedInRun[staff.id] = (assignedInRun[staff.id] || 0) + 1;
        plan.push({ type, id: idOf(item), staff });
      }
    };
    const active = (roles: StaffRole[]) => staffList.filter((s) => s.status === "ACTIVE" && roles.some((r) => s.roles.includes(r)));

    if (targetPool === "PROPERTY" || targetPool === "ALL") {
      planPool(
        "PROPERTY",
        propertyQcList,
        (p) => (!p.qcReviewerId || p.qcReviewerName === "Unassigned") && (p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW"),
        (p) => p.id,
        active(["QC_REVIEWER", "OPERATIONS_MANAGER"]),
      );
    }
    if (targetPool === "ORGANIZATION" || targetPool === "ALL") {
      planPool(
        "ORGANIZATION",
        orgVerificationList,
        (o) => (!o.assignedSpecialistName || o.assignedSpecialistName === "Unassigned") && (o.verificationStatus === "UNVERIFIED" || o.verificationStatus === "PENDING_REVIEW"),
        (o) => o.id,
        active(["VERIFICATION_SPECIALIST", "OPERATIONS_MANAGER"]),
      );
    }
    if (targetPool === "DISPUTE" || targetPool === "ALL") {
      planPool(
        "DISPUTE",
        disputeCases,
        (d) => (!d.assignedTo || d.assignedTo === "Unassigned") && (d.status === "OPEN" || d.status === "ASSIGNED"),
        (d) => d.id,
        active(["SUPPORT_EXECUTIVE", "OPERATIONS_MANAGER"]),
      );
    }

    if (!plan.length) {
      return { assignedCount: 0, message: "All pending queue items are already assigned to active team members." };
    }

    let failed = 0;
    for (const step of plan) {
      try {
        await assignTicketToStaff(step.type, step.id, step.staff.id);
        totalAssigned++;
      } catch (err) {
        failed++;
        console.warn(`Auto-assign failed for ${step.type} ${step.id}:`, err);
      }
    }

    const message =
      `Assigned ${totalAssigned} of ${plan.length} unassigned item(s) using ${strategy} routing.` +
      (failed ? ` ${failed} could not be saved; try again.` : "");
    logAuditAction("WORKLOAD_AUTO_DISTRIBUTED", "STAFF", currentStaff?.id ?? "UNKNOWN", message, { totalAssigned, failed, strategy, targetPool });
    return { assignedCount: totalAssigned, message };
  };

  return (
    <AdminContext.Provider
      value={{
        isHydrated,
        currentStaff,
        setCurrentStaff,
        staffList,
        propertyQcList,
        documentQcList,
        orgVerificationList,
        userList,
        billingOrders,
        refundCases,
        disputeCases,
        contactUnlocks,
        fraudAlerts,
        auditLogs,
        governanceSettings,
        updateGovernanceSettings,
        autoDistributeWorkload,
        assignTicketToStaff,
        requestOtp,
        loginStaff,
        logoutStaff,
        switchStaffRole,
        hasPermission,
        canApproveRefund,
        inviteStaff,
        toggleStaffStatus,
        updateStaffRoles,
        reviewPropertyQc,
        suspendProperty,
        reviewDocumentQc,
        fetchDocumentQueue,
        reviewOrgVerification,
        updateOrgAllowance,
        setUserAccountStatus,
        requestRefund,
        decideRefund,
        updateDisputeStatus,
        assignDispute,
        resolveFraudAlert,
        logAuditAction,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}
