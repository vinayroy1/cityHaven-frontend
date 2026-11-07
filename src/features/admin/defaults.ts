import type { AdminGovernanceSettings } from "./types";

/** Used only until the live governance settings load from the API. */
export const DEFAULT_GOVERNANCE_SETTINGS: AdminGovernanceSettings = {
  propertyReviewPolicy: "INSTANT_PUBLISH_BYPASS",
  orgReviewPolicy: "MANDATORY_KYC",
  autoAssignEnabled: true,
  routingStrategy: "LEAST_LOADED",
  maxActiveTicketsPerAgent: 12,
  duplicateGeofenceRadiusMeters: 100,
  rateAnomalyThresholdPercent: 35,
  autoDisputeLeadRefundLimitHours: 24,
  requireTwoPersonRefundApproval: true,
  updatedAt: "",
  updatedByStaffName: "",
};
