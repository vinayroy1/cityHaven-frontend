export type StaffRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "SENIOR_QC_LEAD"
  | "QC_REVIEWER"
  | "CATALOG_SPECIALIST"
  | "VERIFICATION_SPECIALIST"
  | "LEGAL_COMPLIANCE_OFFICER"
  | "FRAUD_INVESTIGATOR"
  | "SUPPORT_EXECUTIVE"
  | "FINANCE_EXECUTIVE"
  | "FINANCE_APPROVER"
  | "ANALYST_AUDITOR";

export type PropertyQcStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "SUSPENDED";

export type OrgVerificationStatus =
  | "UNVERIFIED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "SUSPENDED";

export type DisputeStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING"
  | "RESOLVED"
  | "CLOSED";

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  roles: StaffRole[];
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  mfaEnabled: boolean;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  regionalRestrictions?: string[];
}

export interface AdminAuditLog {
  id: string | number;
  actorId: number;
  actorName: string;
  actorEmail: string;
  actorRole: StaffRole;
  action: string;
  targetType: "PROPERTY" | "ORGANIZATION" | "USER" | "BILLING" | "STAFF" | "DISPUTE" | "SETTING";
  targetId: string | number;
  targetName?: string;
  details?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PropertyQcItem {
  id: number;
  title: string;
  description?: string;
  listingType: "SELL" | "RENT" | "PG";
  resCom: "RESIDENTIAL" | "COMMERCIAL";
  postedAs: "OWNER" | "AGENT" | "BUILDER";
  price: number;
  cityName: string;
  locality: string;
  address?: string;
  carpetArea?: number;
  carpetAreaUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  ownershipType?: string;
  availabilityStatus?: string;
  qcStatus: PropertyQcStatus;
  qcNotes?: string | null;
  qcReviewerId?: number | null;
  qcReviewerName?: string | null;
  reviewedAt?: string | null;
  ownerType: "PERSONAL" | "ORGANIZATION";
  organizationId?: number | null;
  organizationName?: string | null;
  createdById: number;
  creatorName?: string;
  creatorPhone?: string;
  createdAt: string;
  updatedAt: string;
  media: Array<{ id: number; url: string; type: string }>;
  duplicateSuspected?: boolean;
}

export interface OrgVerificationItem {
  id: number;
  name: string;
  type: string;
  address?: string;
  countryCode: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  verificationStatus: OrgVerificationStatus;
  verificationNotes?: string | null;
  assignedSpecialistId?: number | null;
  assignedSpecialistName?: string | null;
  documents: Array<{
    id: string | number;
    type: "GST_CERTIFICATE" | "RERA_REGISTRATION" | "COMPANY_PAN" | "OFFICE_PROOF" | "INCORPORATION";
    documentNumber?: string;
    fileUrl: string;
    verified: boolean;
    expiresAt?: string;
  }>;
  activePlan?: string;
  seatsUsed: number;
  seatsLimit: number;
  contactCredits: number;
  listingsCount: number;
  createdAt: string;
  verifiedAt?: string | null;
}

export interface UserAccountItem {
  id: number;
  name: string;
  mobileNumber: string;
  email?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
  isKycVerified: boolean;
  credits: number;
  listingsCount: number;
  organizationsCount: number;
  totalSpent: number;
  createdAt: string;
  lastLoginAt?: string;
  suspensionReason?: string;
}

export interface AdminBillingOrder {
  id: string | number;
  orderNumber: string;
  scope: "PERSONAL" | "ORGANIZATION";
  targetId: number;
  targetName: string;
  planName: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED";
  paymentMethod: "RAZORPAY" | "BANK_TRANSFER" | "UPI" | "MANUAL_ADJUSTMENT";
  gatewayPaymentId?: string;
  invoiceUrl?: string;
  createdAt: string;
  creditsAdded: number;
}

export interface AdminRefundCase {
  id: string | number;
  orderNumber: string;
  targetName: string;
  amount: number;
  requestedById: number;
  requestedBy: string;
  reason: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  approverRequiredRole: "FINANCE_APPROVER" | "SUPER_ADMIN";
  decidedById?: number | null;
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface AdminDisputeCase {
  id: string;
  caseNumber: string;
  type: "INVALID_CONTACT" | "FAKE_LISTING" | "PAYMENT_ISSUE" | "SEAT_DISPUTE" | "UNAUTHORIZED_LISTING";
  propertyId?: number;
  propertyTitle?: string;
  complainantName: string;
  complainantPhone: string;
  respondentName?: string;
  chargedAccount: "PERSONAL" | "ORGANIZATION";
  assignedTo?: string | null;
  status: DisputeStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  refundRequested: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContactUnlockTrace {
  id: string;
  propertyId: number;
  propertyTitle: string;
  buyerName: string;
  buyerPhone: string;
  chargedScope: "PERSONAL" | "ORGANIZATION";
  chargedEntityName: string;
  responsibleStaffOrMember?: string;
  creditsDeducted: number;
  isDuplicateSuppressed: boolean;
  unlockedAt: string;
}

export interface AdminFraudAlert {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "DUPLICATE_CLUSTER" | "ABNORMAL_SCRAPING" | "SEAT_SHARING_ABUSE" | "PAYMENT_VELOCITY";
  title: string;
  description: string;
  targetId: string | number;
  targetType: "PROPERTY" | "USER" | "ORGANIZATION";
  detectedAt: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
}

export interface AdminOverviewStats {
  pendingPropertyQc: number;
  pendingOrgVerifications: number;
  activeListingsTotal: number;
  totalVerifiedOrgs: number;
  activeStaffCount: number;
  todayRevenue: number;
  openDisputesCount: number;
  systemHealth: "HEALTHY" | "DEGRADED" | "MAINTENANCE";
}

export type PropertyReviewPolicy =
  | "MANDATORY_REVIEW"      // Every submitted listing must be human-reviewed before going live
  | "AI_SMART_TRIAGE"       // Auto-publish low-risk <20 score, hold high-risk >70 for human review
  | "INSTANT_PUBLISH_BYPASS"; // Review disabled: All listings go live immediately; audited post-publish

export type OrgReviewPolicy =
  | "MANDATORY_KYC"         // Require GSTIN/RERA approval before org can post listings
  | "INSTANT_PROVISIONAL";  // Allow provisional posting up to 3 listings while KYC is pending

export type WorkloadRoutingStrategy =
  | "ROUND_ROBIN"           // Distribute evenly in rotational order across active staff
  | "LEAST_LOADED"          // Assign to staff member with lowest currently active tickets
  | "MANUAL_CLAIM";         // Reviewers claim unassigned tickets from the shared pool

export interface AdminGovernanceSettings {
  propertyReviewPolicy: PropertyReviewPolicy;
  orgReviewPolicy: OrgReviewPolicy;
  autoAssignEnabled: boolean;
  routingStrategy: WorkloadRoutingStrategy;
  maxActiveTicketsPerAgent: number;
  duplicateGeofenceRadiusMeters: number;
  rateAnomalyThresholdPercent: number;
  autoDisputeLeadRefundLimitHours: number;
  requireTwoPersonRefundApproval: boolean;
  updatedAt: string;
  updatedByStaffName: string;
}
