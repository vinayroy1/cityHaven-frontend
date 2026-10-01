import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/services/api/client";
import type {
  AdminAuditLog,
  AdminBillingOrder,
  AdminGovernanceSettings,
  AdminRefundCase,
  OrgVerificationItem,
  OrgVerificationStatus,
  PropertyQcItem,
  PropertyQcStatus,
  StaffRole,
  StaffUser,
  UserAccountItem,
} from "./types";

function unwrap<T>(response: { data?: T } | T): T {
  return (response as any)?.data ?? (response as T);
}

export const adminApi = {
  async login(email: string, mfaCode?: string) {
    return unwrap(
      await apiClient.post<{ token?: string; accessToken?: string; staff?: StaffUser }>(
        API_ENDPOINTS.admin.auth.login,
        { email, mfaCode }
      )
    );
  },
  async me() {
    return unwrap(await apiClient.get<StaffUser>(API_ENDPOINTS.admin.auth.me));
  },
  async overview() {
    return unwrap(await apiClient.get(API_ENDPOINTS.admin.overview));
  },
  async listStaff() {
    return unwrap(await apiClient.get<StaffUser[]>(API_ENDPOINTS.admin.staff.list));
  },
  async inviteStaff(body: { email: string; name: string; roles: StaffRole[] }) {
    return unwrap(
      await apiClient.post<StaffUser>(API_ENDPOINTS.admin.staff.invite, {
        email: body.email,
        name: body.name,
        roleName: body.roles[0],
      }),
    );
  },
  async updateStaffRoles(staffId: number, roles: StaffRole[]) {
    return unwrap(await apiClient.patch<StaffUser>(API_ENDPOINTS.admin.staff.update(staffId), { roleName: roles[0] }));
  },
  async deactivateStaff(staffId: number) {
    return unwrap(await apiClient.post<StaffUser>(API_ENDPOINTS.admin.staff.deactivate(staffId)));
  },
  async listPropertyQueue() {
    return unwrap(await apiClient.get<PropertyQcItem[]>(API_ENDPOINTS.admin.properties.queue));
  },
  async reviewProperty(propertyId: number, status: PropertyQcStatus, notes?: string) {
    const backendStatus = status === "SUSPENDED" ? "REJECTED" : status === "SUBMITTED" ? "UNDER_REVIEW" : status;
    return unwrap(await apiClient.post(API_ENDPOINTS.admin.properties.review(propertyId), { status: backendStatus, notes }));
  },
  async suspendProperty(propertyId: number, reason: string) {
    return unwrap(await apiClient.post(API_ENDPOINTS.admin.properties.suspend(propertyId), { reason }));
  },
  async listOrganizations() {
    return unwrap(await apiClient.get<OrgVerificationItem[]>(API_ENDPOINTS.admin.organizations.queue));
  },
  async reviewOrganization(orgId: number, status: OrgVerificationStatus, notes?: string) {
    const backendStatus = status === "UNVERIFIED" ? "PENDING_REVIEW" : status;
    return unwrap(await apiClient.post(API_ENDPOINTS.admin.organizations.verify(orgId), { status: backendStatus, notes }));
  },
  async updateOrganizationAllowance(orgId: number, updates: { seatsLimit?: number; contactCredits?: number }) {
    return unwrap(await apiClient.patch(API_ENDPOINTS.admin.organizations.updateAllowance(orgId), updates));
  },
  async listUsers() {
    return unwrap(await apiClient.get<UserAccountItem[]>(API_ENDPOINTS.admin.users.list));
  },
  async updateUserStatus(userId: number, status: "ACTIVE" | "SUSPENDED" | "BLOCKED", reason?: string) {
    return unwrap(await apiClient.patch(API_ENDPOINTS.admin.users.status(userId), { status, reason }));
  },
  async listBillingOrders() {
    return unwrap(await apiClient.get<AdminBillingOrder[]>(API_ENDPOINTS.admin.billing.orders));
  },
  async listRefunds() {
    return unwrap(await apiClient.get<AdminRefundCase[]>(API_ENDPOINTS.admin.billing.refunds));
  },
  async requestRefund(body: { orderNumber: string; targetName: string; amount: number; reason: string }) {
    return unwrap(await apiClient.post<AdminRefundCase>(API_ENDPOINTS.admin.billing.refunds, body));
  },
  async decideRefund(caseId: string | number, decision: "APPROVED" | "REJECTED") {
    return unwrap(await apiClient.post<AdminRefundCase>(API_ENDPOINTS.admin.billing.decideRefund(caseId), { decision }));
  },
  async listAuditLogs() {
    return unwrap(await apiClient.get<AdminAuditLog[]>(API_ENDPOINTS.admin.audit.logs));
  },
  async getGovernance() {
    return unwrap(await apiClient.get<AdminGovernanceSettings>(API_ENDPOINTS.admin.governance));
  },
  async updateGovernance(settings: Partial<AdminGovernanceSettings>, reason: string) {
    return unwrap(await apiClient.patch<AdminGovernanceSettings>(API_ENDPOINTS.admin.governance, { ...settings, reason }));
  },
};
