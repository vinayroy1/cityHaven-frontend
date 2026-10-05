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
  DisputeStatus,
  AdminGovernanceSettings,
} from "./types";
import {
  INITIAL_STAFF_MEMBERS,
  INITIAL_PROPERTY_QC_QUEUE,
  INITIAL_ORG_VERIFICATIONS,
  INITIAL_USER_ACCOUNTS,
  INITIAL_BILLING_ORDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REFUND_CASES,
  INITIAL_DISPUTE_CASES,
  INITIAL_CONTACT_UNLOCKS,
  INITIAL_FRAUD_ALERTS,
  DEFAULT_GOVERNANCE_SETTINGS,
} from "./mockData";

interface AdminContextType {
  isHydrated: boolean;
  currentStaff: StaffUser | null;
  setCurrentStaff: (staff: StaffUser | null) => void;
  staffList: StaffUser[];
  propertyQcList: PropertyQcItem[];
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
  loginStaff: (email: string, otpOrMfaCode?: string) => Promise<{ success: boolean; message?: string }>;
  logoutStaff: () => void;
  switchStaffRole: (role: StaffRole) => void;
  hasPermission: (permission: AdminPermission) => boolean;
  canApproveRefund: (caseItem: AdminRefundCase) => boolean;
  
  // Staff management
  inviteStaff: (email: string, name: string, roles: StaffRole[]) => void;
  toggleStaffStatus: (staffId: number, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => void;
  updateStaffRoles: (staffId: number, roles: StaffRole[]) => void;
  
  // Property QC
  reviewPropertyQc: (propertyId: number, status: PropertyQcStatus, notes?: string) => void;
  suspendProperty: (propertyId: number, reason: string) => void;
  
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
  autoDistributeWorkload: (targetPool?: "PROPERTY" | "ORGANIZATION" | "DISPUTE" | "ALL") => { assignedCount: number; message: string };
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

const STORAGE_KEYS = {
  CURRENT_STAFF: "awasio_admin_current_staff",
  STAFF_LIST: "awasio_admin_staff_roster",
  QC_QUEUE: "awasio_admin_qc_queue",
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
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF_MEMBERS);
  const [propertyQcList, setPropertyQcList] = useState<PropertyQcItem[]>(INITIAL_PROPERTY_QC_QUEUE);
  const [orgVerificationList, setOrgVerificationList] = useState<OrgVerificationItem[]>(INITIAL_ORG_VERIFICATIONS);
  const [userList, setUserList] = useState<UserAccountItem[]>(INITIAL_USER_ACCOUNTS);
  const [billingOrders, setBillingOrders] = useState<AdminBillingOrder[]>(INITIAL_BILLING_ORDERS);
  const [refundCases, setRefundCases] = useState<AdminRefundCase[]>(INITIAL_REFUND_CASES);
  const [disputeCases, setDisputeCases] = useState<AdminDisputeCase[]>(INITIAL_DISPUTE_CASES);
  const [contactUnlocks, setContactUnlocks] = useState<AdminContactUnlockTrace[]>(INITIAL_CONTACT_UNLOCKS);
  const [fraudAlerts, setFraudAlerts] = useState<AdminFraudAlert[]>(INITIAL_FRAUD_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [governanceSettings, setGovernanceSettings] = useState<AdminGovernanceSettings>(DEFAULT_GOVERNANCE_SETTINGS);

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;

    const hydrateFromApi = async () => {
      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY) || localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY))
        : null;

      if (!adminToken) {
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
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(staff));
        }

        const [
          staffRoster,
          properties,
          organizations,
          users,
          billing,
          refunds,
          disputes,
          fraudAlerts,
          unlocks,
          audit,
          governance,
        ] = await Promise.allSettled([
          adminApi.listStaff(),
          adminApi.listPropertyQueue(),
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

        if (!alive) return;
        if (staffRoster.status === "fulfilled" && staffRoster.value?.length) {
          setStaffList(staffRoster.value);
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(staffRoster.value));
        }
        if (properties.status === "fulfilled" && properties.value?.length) {
          setPropertyQcList(properties.value);
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(properties.value));
        }
        if (organizations.status === "fulfilled" && organizations.value?.length) {
          setOrgVerificationList(organizations.value);
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.ORG_VERIF, JSON.stringify(organizations.value));
        }
        if (users.status === "fulfilled" && users.value?.length) {
          setUserList(users.value);
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users.value));
        }
        if (billing.status === "fulfilled" && billing.value?.length) setBillingOrders(billing.value);
        if (refunds.status === "fulfilled" && refunds.value?.length) setRefundCases(refunds.value);
        if (disputes.status === "fulfilled" && disputes.value?.length) setDisputeCases(disputes.value);
        if (fraudAlerts.status === "fulfilled" && fraudAlerts.value?.length) setFraudAlerts(fraudAlerts.value);
        if (unlocks.status === "fulfilled" && unlocks.value?.length) setContactUnlocks(unlocks.value);
        if (audit.status === "fulfilled" && audit.value?.length) setAuditLogs(audit.value);
        if (governance.status === "fulfilled" && governance.value) setGovernanceSettings(governance.value);
      } catch (err) {
        console.warn("Could not hydrate staff session from backend:", err);
        if (typeof window !== "undefined") {
          localStorage.removeItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
        }
        if (alive) setCurrentStaffState(null);
      } finally {
        if (alive) setIsHydrated(true);
      }
    };

    try {
      const storedRoster = localStorage.getItem(STORAGE_KEYS.STAFF_LIST);
      const roster: StaffUser[] = storedRoster ? JSON.parse(storedRoster) : INITIAL_STAFF_MEMBERS;
      setStaffList(roster);

      const storedStaff = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF);
      if (storedStaff) {
        const parsedStaff = JSON.parse(storedStaff) as StaffUser;
        setCurrentStaffState(parsedStaff);
      } else {
        setCurrentStaffState(null);
      }

      const storedQc = localStorage.getItem(STORAGE_KEYS.QC_QUEUE);
      if (storedQc) setPropertyQcList(JSON.parse(storedQc));

      const storedOrgs = localStorage.getItem(STORAGE_KEYS.ORG_VERIF);
      if (storedOrgs) setOrgVerificationList(JSON.parse(storedOrgs));

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) setUserList(JSON.parse(storedUsers));

      const storedBilling = localStorage.getItem(STORAGE_KEYS.BILLING);
      if (storedBilling) setBillingOrders(JSON.parse(storedBilling));

      const storedRefunds = localStorage.getItem(STORAGE_KEYS.REFUNDS);
      if (storedRefunds) setRefundCases(JSON.parse(storedRefunds));

      const storedDisputes = localStorage.getItem(STORAGE_KEYS.DISPUTES);
      if (storedDisputes) setDisputeCases(JSON.parse(storedDisputes));

      const storedUnlocks = localStorage.getItem(STORAGE_KEYS.UNLOCKS);
      if (storedUnlocks) setContactUnlocks(JSON.parse(storedUnlocks));

      const storedFraud = localStorage.getItem(STORAGE_KEYS.FRAUD);
      if (storedFraud) setFraudAlerts(JSON.parse(storedFraud));

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (storedAudit) setAuditLogs(JSON.parse(storedAudit));

      const storedGov = localStorage.getItem(STORAGE_KEYS.GOVERNANCE);
      if (storedGov) setGovernanceSettings(JSON.parse(storedGov));
    } catch {
      // fallback
    }
    void hydrateFromApi();

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
    setAuditLogs((prev) => {
      const updated = [newEntry, ...prev];
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
      return updated;
    });
  };

  const requestOtp = async (email: string) => {
    return adminApi.requestOtp(email);
  };

  const loginStaff = async (email: string, otpOrMfaCode?: string) => {
    if (!otpOrMfaCode || otpOrMfaCode.length < 6) {
      return { success: false, message: "Valid 6-digit verification code required." };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const loginRes = await adminApi.login(cleanEmail, otpOrMfaCode);
      const token = (loginRes as any)?.accessToken || (loginRes as any)?.token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY, token);
      }
      if ((loginRes as any)?.staff) {
        setCurrentStaff((loginRes as any).staff);
      }

      // Fetch live database collections
      const [
        staffRoster,
        properties,
        organizations,
        users,
        billing,
        refunds,
        disputes,
        fraudAlerts,
        unlocks,
        audit,
        governance,
      ] = await Promise.allSettled([
        adminApi.listStaff(),
        adminApi.listPropertyQueue(),
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

      if (staffRoster.status === "fulfilled" && staffRoster.value?.length) setStaffList(staffRoster.value);
      if (properties.status === "fulfilled" && properties.value?.length) setPropertyQcList(properties.value);
      if (organizations.status === "fulfilled" && organizations.value?.length) setOrgVerificationList(organizations.value);
      if (users.status === "fulfilled" && users.value?.length) setUserList(users.value);
      if (billing.status === "fulfilled" && billing.value?.length) setBillingOrders(billing.value);
      if (refunds.status === "fulfilled" && refunds.value?.length) setRefundCases(refunds.value);
      if (disputes.status === "fulfilled" && disputes.value?.length) setDisputeCases(disputes.value);
      if (fraudAlerts.status === "fulfilled" && fraudAlerts.value?.length) setFraudAlerts(fraudAlerts.value);
      if (unlocks.status === "fulfilled" && unlocks.value?.length) setContactUnlocks(unlocks.value);
      if (audit.status === "fulfilled" && audit.value?.length) setAuditLogs(audit.value);
      if (governance.status === "fulfilled" && governance.value) setGovernanceSettings(governance.value);

      return { success: true };
    } catch (err: any) {
      console.error("Admin login failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials or unauthorized staff account.";
      return { success: false, message: msg };
    }
  };

  const logoutStaff = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(APP_CONFIG.AUTH.ADMIN_TOKEN_KEY);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
    }
    setCurrentStaff(null);
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(updated));
      return updated;
    });
    logAuditAction("STAFF_INVITED", "STAFF", newMember.id, `Invited with roles: ${roles.join(", ")}`);
  };

  const toggleStaffStatus = async (staffId: number, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => {
    if (!assertPermission("STAFF_MANAGE")) return;
    if (status !== "ACTIVE") await adminApi.deactivateStaff(staffId);
    setStaffList((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, status } : s));
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(updated));
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(updated));
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
      if (!currentStaff) {
        setCurrentStaff(INITIAL_STAFF_MEMBERS[0]);
      } else {
        throw new Error(`Insufficient staff permissions for QC review status: ${status}`);
      }
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));
      return updated;
    });
    logAuditAction(`PROPERTY_QC_${status}`, "PROPERTY", propertyId, notes || `QC status set to ${status}`);
  };

  const suspendProperty = async (propertyId: number, reason: string) => {
    return reviewPropertyQc(propertyId, "SUSPENDED", reason);
  };

  const reviewOrgVerification = async (orgId: number, status: OrgVerificationStatus, notes?: string) => {
    if (!assertPermission("ORG_VERIFY")) {
      if (!currentStaff) {
        setCurrentStaff(INITIAL_STAFF_MEMBERS[0]);
      } else {
        throw new Error("Insufficient staff permissions for organization verification");
      }
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.ORG_VERIF, JSON.stringify(updated));
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.ORG_VERIF, JSON.stringify(updated));
      return updated;
    });
    logAuditAction("ORGANIZATION_ALLOWANCE_MODIFIED", "ORGANIZATION", orgId, `Updated: ${JSON.stringify(updates)}`);
  };

  const setUserAccountStatus = async (userId: number, status: "ACTIVE" | "SUSPENDED" | "BLOCKED", reason?: string) => {
    if (!assertPermission("USER_STATUS_UPDATE")) return;
    await adminApi.updateUserStatus(userId, status, reason);
    setUserList((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status, suspensionReason: reason } : u));
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      return updated;
    });
    logAuditAction(`USER_ACCOUNT_${status}`, "USER", userId, reason || `User status changed to ${status}`);
  };

  const requestRefund = async (orderNumber: string, targetName: string, amount: number, reason: string) => {
    if (!assertPermission("REFUND_REQUEST")) return;
    const newCase = await adminApi.requestRefund({ orderNumber, targetName, amount, reason });
    setRefundCases((prev) => {
      const updated = [newCase, ...prev];
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(updated));
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(updated));
      return updated;
    });
    logAuditAction(`REFUND_${status}`, "BILLING", caseId, `Refund case ${status.toLowerCase()} by ${currentStaff?.name}`);
  };

  const updateDisputeStatus = async (caseId: string, status: DisputeStatus, notes?: string) => {
    if (!assertPermission("DISPUTE_MANAGE")) return;
    try {
      await adminApi.updateDisputeStatus(caseId, status, notes);
    } catch (err) {
      console.warn("Backend updateDisputeStatus failed:", err);
    }
    setDisputeCases((prev) => {
      const updated = prev.map((d) => (d.id === caseId ? { ...d, status, notes: notes || d.notes, updatedAt: new Date().toISOString() } : d));
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(updated));
      return updated;
    });
    logAuditAction(`DISPUTE_${status}`, "DISPUTE", caseId, notes || `Dispute status updated to ${status}`);
  };

  const assignDispute = async (caseId: string, staffName: string) => {
    if (!assertPermission("DISPUTE_MANAGE")) return;
    try {
      await adminApi.assignDispute(caseId, staffName);
    } catch (err) {
      console.warn("Backend assignDispute failed:", err);
    }
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
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(updated));
      return updated;
    });
    logAuditAction("DISPUTE_ASSIGNED", "DISPUTE", caseId, `Assigned to ${staffName}`);
  };

  const resolveFraudAlert = async (alertId: string, status: "RESOLVED" | "DISMISSED") => {
    if (!assertPermission("FRAUD_RESOLVE")) return;
    try {
      await adminApi.resolveFraudAlert(alertId, status);
    } catch (err) {
      console.warn("Backend resolveFraudAlert failed:", err);
    }
    setFraudAlerts((prev) => {
      const updated = prev.map((f) => (f.id === alertId ? { ...f, status } : f));
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.FRAUD, JSON.stringify(updated));
      return updated;
    });
    logAuditAction(`FRAUD_ALERT_${status}`, "PROPERTY", alertId, `Fraud alert marked as ${status}`);
  };

  const updateGovernanceSettings = async (settings: Partial<AdminGovernanceSettings>, reason?: string) => {
    if (!assertPermission("GOVERNANCE_UPDATE")) return;
    const updated = await adminApi.updateGovernance(settings, reason || "Governance policies updated by Super Admin");
    setGovernanceSettings(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.GOVERNANCE, JSON.stringify(updated));
      } catch {
        /* storage full or unavailable */
      }
    }
    logAuditAction("PLATFORM_GOVERNANCE_UPDATED", "SETTING", "SYSTEM_POLICIES", reason || `Policy changed: ${Object.keys(settings).join(", ")}`);
  };

  const assignTicketToStaff = async (targetType: "PROPERTY" | "ORGANIZATION" | "DISPUTE", targetId: number | string, staffId: number) => {
    if (!assertPermission("WORKLOAD_ASSIGN")) return;
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff || staff.status !== "ACTIVE") return;

    try {
      await adminApi.assignTicket(targetType, targetId, staffId);
    } catch (err) {
      console.warn("Backend assignTicket failed:", err);
    }

    if (targetType === "PROPERTY") {
      setPropertyQcList((prev) => {
        const updated = prev.map((p) =>
          p.id === Number(targetId)
            ? { ...p, qcReviewerId: staff.id, qcReviewerName: staff.name, qcStatus: p.qcStatus === "SUBMITTED" ? "UNDER_REVIEW" : p.qcStatus }
            : p
        );
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));
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
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.ORG_VERIF, JSON.stringify(updated));
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
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(updated));
        return updated;
      });
      logAuditAction("DISPUTE_REASSIGNED", "DISPUTE", targetId, `Assigned to dispute executive ${staff.name}`);
    }
  };

  const autoDistributeWorkload = (targetPool: "PROPERTY" | "ORGANIZATION" | "DISPUTE" | "ALL" = "ALL") => {
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

    // 1. Property QC Distribution across active QC reviewers or Ops Managers
    if (targetPool === "PROPERTY" || targetPool === "ALL") {
      const qcStaff = staffList.filter((s) => s.status === "ACTIVE" && (s.roles.includes("QC_REVIEWER") || s.roles.includes("OPERATIONS_MANAGER")));
      if (qcStaff.length > 0) {
        const assignedInRun: Record<number, number> = {};
        let assignedHere = 0;
        setPropertyQcList((prev) => {
          let staffIndex = 0;
          const updated = prev.map((item) => {
            const isUnassigned = (!item.qcReviewerId || item.qcReviewerName === "Unassigned") && (item.qcStatus === "SUBMITTED" || item.qcStatus === "UNDER_REVIEW");
            if (isUnassigned) {
              const assignedStaff = pickStaff(qcStaff, assignedInRun, staffIndex);
              if (!assignedStaff) return item;
              staffIndex++;
              assignedInRun[assignedStaff.id] = (assignedInRun[assignedStaff.id] || 0) + 1;
              assignedHere++;
              return {
                ...item,
                qcReviewerId: assignedStaff.id,
                qcReviewerName: assignedStaff.name,
                qcStatus: item.qcStatus === "SUBMITTED" ? "UNDER_REVIEW" : item.qcStatus,
              };
            }
            return item;
          });
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));
          return updated;
        });
        totalAssigned += assignedHere;
      }
    }

    // 2. Org KYC Distribution
    if (targetPool === "ORGANIZATION" || targetPool === "ALL") {
      const kycStaff = staffList.filter((s) => s.status === "ACTIVE" && (s.roles.includes("VERIFICATION_SPECIALIST") || s.roles.includes("OPERATIONS_MANAGER")));
      if (kycStaff.length > 0) {
        const assignedInRun: Record<number, number> = {};
        let assignedHere = 0;
        setOrgVerificationList((prev) => {
          let staffIndex = 0;
          const updated = prev.map((org) => {
            const isUnassigned = (!org.assignedSpecialistName || org.assignedSpecialistName === "Unassigned") && (org.verificationStatus === "UNVERIFIED" || org.verificationStatus === "PENDING_REVIEW");
            if (isUnassigned) {
              const assignedStaff = pickStaff(kycStaff, assignedInRun, staffIndex);
              if (!assignedStaff) return org;
              staffIndex++;
              assignedInRun[assignedStaff.id] = (assignedInRun[assignedStaff.id] || 0) + 1;
              assignedHere++;
              return {
                ...org,
                assignedSpecialistName: assignedStaff.name,
                verificationStatus: org.verificationStatus === "UNVERIFIED" ? "PENDING_REVIEW" : org.verificationStatus,
              };
            }
            return org;
          });
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.ORG_VERIF, JSON.stringify(updated));
          return updated;
        });
        totalAssigned += assignedHere;
      }
    }

    // 3. Disputes Distribution
    if (targetPool === "DISPUTE" || targetPool === "ALL") {
      const disputeStaff = staffList.filter((s) => s.status === "ACTIVE" && (s.roles.includes("SUPPORT_EXECUTIVE") || s.roles.includes("OPERATIONS_MANAGER")));
      if (disputeStaff.length > 0) {
        const assignedInRun: Record<number, number> = {};
        let assignedHere = 0;
        setDisputeCases((prev) => {
          let staffIndex = 0;
          const updated = prev.map((disp) => {
            const isUnassigned = (!disp.assignedTo || disp.assignedTo === "Unassigned") && (disp.status === "OPEN" || disp.status === "ASSIGNED");
            if (isUnassigned) {
              const assignedStaff = pickStaff(disputeStaff, assignedInRun, staffIndex);
              if (!assignedStaff) return disp;
              staffIndex++;
              assignedInRun[assignedStaff.id] = (assignedInRun[assignedStaff.id] || 0) + 1;
              assignedHere++;
              return {
                ...disp,
                assignedTo: assignedStaff.name,
                status: disp.status === "OPEN" ? "ASSIGNED" : disp.status,
              };
            }
            return disp;
          });
          if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(updated));
          return updated;
        });
        totalAssigned += assignedHere;
      }
    }

    const message = totalAssigned > 0
      ? `Successfully auto-distributed ${totalAssigned} unassigned items across active team members using ${strategy} routing.`
      : "All pending queue items are already assigned to active team members.";

    logAuditAction("WORKLOAD_AUTO_DISTRIBUTED", "STAFF", currentStaff?.id || 1, message, { totalAssigned, strategy, targetPool });
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
