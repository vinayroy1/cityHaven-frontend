import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/services/api/client";
import type {
  AdminAuditLog,
  AdminBillingOrder,
  AdminContactUnlockTrace,
  AdminDisputeCase,
  AdminFraudAlert,
  AdminGovernanceSettings,
  AdminRefundCase,
  AdminDocumentQcItem,
  DisputeStatus,
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

export type AssistedSessionResponse = {
  token: string;
  expiresIn: string;
  owner: { id: number; name: string | null; email: string | null; mobileNumber: string; isNew: boolean };
};

export const adminApi = {
  /** Find or create the owner and get a listing-only token that acts as them. */
  async startAssistedSession(body: { name: string; mobile: string; email: string }) {
    return unwrap(await apiClient.post<AssistedSessionResponse>(`${API_ENDPOINTS.admin.base}/assisted/session`, body));
  },
  /** Email the owner that a listing was created for them. */
  async notifyAssistedOwner(body: { ownerId: number; listingType: "PROPERTY" | "STAY" | "FLATMATE" | "INTERIOR" | "ADVISOR"; title: string; url: string }) {
    return unwrap(await apiClient.post<{ sent: boolean; message?: string }>(`${API_ENDPOINTS.admin.base}/assisted/notify`, body));
  },

  async requestOtp(email: string) {
    return unwrap(
      await apiClient.post<{ success: boolean; message: string; email: string; devOtp?: string }>(
        API_ENDPOINTS.admin.auth.requestOtp,
        { email }
      )
    );
  },
  async login(loginId: string, secret?: string, isPassword?: boolean) {
    return unwrap(
      await apiClient.post<{ token?: string; accessToken?: string; staff?: StaffUser }>(
        API_ENDPOINTS.admin.auth.login,
        {
          loginId,
          email: loginId,
          password: isPassword ? secret : undefined,
          otp: !isPassword ? secret : undefined,
          mfaCode: !isPassword ? secret : undefined,
        }
      )
    );
  },
  async me() {
    return unwrap(await apiClient.get<StaffUser>(API_ENDPOINTS.admin.auth.me));
  },
  async overview() {
    return unwrap(await apiClient.get(API_ENDPOINTS.admin.overview));
  },
  async getAnalyticsKpis() {
    return unwrap(await apiClient.get(API_ENDPOINTS.admin.analytics.kpis));
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
  async listDocumentQueue(filters?: { status?: string; type?: string; propertyId?: number }) {
    return unwrap(await apiClient.get<AdminDocumentQcItem[]>(API_ENDPOINTS.admin.documents.queue, { params: filters }));
  },
  async reviewDocument(id: number, body: { action: "APPROVE" | "REJECT"; reason?: string; grantPropertyBadge?: boolean }) {
    return unwrap(
      await apiClient.post<{ success: boolean; data?: any; propertyBadgeGranted?: boolean; propertyId?: number }>(
        API_ENDPOINTS.admin.documents.review(id),
        body
      )
    ) as { success: boolean; propertyBadgeGranted?: boolean; propertyId?: number };
  },
  async getDocumentDownloadUrl(id: number) {
    return unwrap(await apiClient.get<{ downloadUrl: string; title: string; mimeType: string }>(API_ENDPOINTS.admin.documents.download(id)));
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
  async listDisputes() {
    return unwrap(await apiClient.get<AdminDisputeCase[]>(API_ENDPOINTS.admin.disputes.list));
  },
  async updateDisputeStatus(id: string, status: DisputeStatus, notes?: string) {
    return unwrap(await apiClient.patch<AdminDisputeCase>(API_ENDPOINTS.admin.disputes.updateStatus(id), { status, notes }));
  },
  async assignDispute(id: string, staffName: string) {
    return unwrap(await apiClient.post<AdminDisputeCase>(API_ENDPOINTS.admin.disputes.assign(id), { staffName }));
  },
  async listFraudAlerts() {
    return unwrap(await apiClient.get<AdminFraudAlert[]>(API_ENDPOINTS.admin.fraud.alerts));
  },
  async resolveFraudAlert(id: string, status: "RESOLVED" | "DISMISSED", notes?: string) {
    return unwrap(await apiClient.post<AdminFraudAlert>(API_ENDPOINTS.admin.fraud.resolve(id), { status, notes }));
  },
  async listContactUnlocks() {
    return unwrap(await apiClient.get<AdminContactUnlockTrace[]>(API_ENDPOINTS.admin.unlocks.list));
  },
  async autoDistributeWorkload(scope: "PROPERTY" | "ORGANIZATION") {
    return unwrap(await apiClient.post<{ success: boolean; message: string; count?: number }>(API_ENDPOINTS.admin.workload.autoDistribute, { scope }));
  },
  async assignTicket(targetType: "PROPERTY" | "ORGANIZATION" | "DISPUTE", targetId: string | number, staffId: number) {
    return unwrap(await apiClient.post<{ success: boolean; assignedTo?: string }>(API_ENDPOINTS.admin.workload.assign, { targetType, targetId, staffId }));
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

// ---------------------------------------------------------------------------
// Lead Finder (sales sourcing)
// ---------------------------------------------------------------------------
export const LEAD_TYPES = ["PG", "STAY", "RENTAL", "PROJECT", "BUILDER", "AGENT", "INTERIOR"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];
export const LEAD_STATUSES = ["NEW", "NO_ANSWER", "CALL_BACK", "INTERESTED", "DOCS_PENDING", "LISTED", "NOT_INTERESTED", "DO_NOT_CONTACT"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadSearchResult {
  placeId: string;
  name: string;
  address: string;
  businessStatus: string | null;
  mapsUrl: string | null;
  lat: number | null;
  lng: number | null;
  lead: { id: number; placeId: string; status: LeadStatus } | null;
}
export interface LeadSearchResponse {
  query: string;
  cached: boolean;
  nextPageToken: string | null;
  /** Businesses skipped because they're already saved as leads (when hideSaved is on). */
  hiddenSaved: number;
  results: LeadSearchResult[];
}
export interface LeadActivity {
  id: number;
  staffName: string;
  action: string;
  status: LeadStatus | null;
  note: string | null;
  createdAt: string;
}
export interface SourcingLead {
  id: number;
  placeId: string;
  type: LeadType;
  status: LeadStatus;
  cityName: string;
  locality: string | null;
  countryCode: string;
  assignedToId: number | null;
  assignedToName: string | null;
  createdByName: string;
  nextFollowUpAt: string | null;
  ownerName: string | null;
  ownerMobile: string | null;
  ownerEmail: string | null;
  notes: string | null;
  intake: Record<string, string | boolean> | null;
  listedType: string | null;
  listedUrl: string | null;
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
  place?: { name: string; address: string } | null;
  activities?: LeadActivity[];
}
export interface LeadPlaceDetails {
  placeId: string;
  name: string;
  address: string;
  businessStatus: string | null;
  mapsUrl: string | null;
  phone: string | null;
  phoneInternational: string | null;
  website: string | null;
  rating: number | null;
  ratingCount: number | null;
  hours: string[];
}
export interface LeadStats {
  byStatus: Partial<Record<LeadStatus, number>>;
  callsToday: number;
  listedThisWeek: number;
  dueToday: number;
  usage: { searches: { used: number; cap: number }; lookups: { used: number; cap: number } };
  listedByStaff: Array<{ name: string; count: number }>;
}

const LF = `${API_ENDPOINTS.admin.base}/lead-finder`;
export const leadFinderApi = {
  async search(params: { type: LeadType; city: string; locality?: string; keyword?: string; country?: string; pageToken?: string; hideSaved?: "0" | "1" }) {
    return unwrap(await apiClient.get<LeadSearchResponse>(`${LF}/search`, { params }));
  },
  async saveLeads(leads: Array<{ placeId: string; type: LeadType; cityName: string; locality?: string | null; countryCode?: string }>) {
    return unwrap(await apiClient.post<{ created: number; skipped: number }>(`${LF}/leads`, { leads }));
  },
  async list(params: { status?: LeadStatus; type?: LeadType; city?: string; locality?: string; assigned?: string; due?: "today"; page?: number }) {
    return unwrap(
      await apiClient.get<{ total: number; page: number; pageSize: number; counts: Partial<Record<LeadStatus, number>>; items: SourcingLead[] }>(`${LF}/leads`, { params }),
    );
  },
  async get(id: number, refresh = false) {
    return unwrap(
      await apiClient.get<{ lead: SourcingLead; place: LeadPlaceDetails | null; placeError?: string }>(`${LF}/leads/${id}`, { params: refresh ? { refresh: 1 } : undefined }),
    );
  },
  async update(
    id: number,
    body: Partial<{ status: LeadStatus; assignedToId: number | null; nextFollowUpAt: string | null; ownerName: string | null; ownerMobile: string | null; ownerEmail: string | null; notes: string | null; intake: Record<string, string | boolean> | null; note: string }>,
  ) {
    return unwrap(await apiClient.patch<SourcingLead>(`${LF}/leads/${id}`, body));
  },
  async logActivity(id: number, body: { action: "CALL" | "WHATSAPP" | "NOTE"; status?: LeadStatus; note?: string; nextFollowUpAt?: string | null }) {
    return unwrap(await apiClient.post<SourcingLead>(`${LF}/leads/${id}/activity`, body));
  },
  async markListed(id: number, body: { listedType: "PROPERTY" | "STAY" | "FLATMATE" | "INTERIOR" | "ADVISOR"; listedUrl: string; listedOwnerId?: number }) {
    return unwrap(await apiClient.post<SourcingLead>(`${LF}/leads/${id}/listed`, body));
  },
  async stats() {
    return unwrap(await apiClient.get<LeadStats>(`${LF}/stats`));
  },
};
