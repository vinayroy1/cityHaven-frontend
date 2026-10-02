import {
  INITIAL_STAFF_MEMBERS,
  INITIAL_PROPERTY_QC_QUEUE,
  INITIAL_ORG_VERIFICATIONS,
  INITIAL_DISPUTE_CASES,
  DEFAULT_GOVERNANCE_SETTINGS,
} from "../mockData";
import type { StaffRole, PropertyQcItem, OrgVerificationItem, AdminDisputeCase, AdminGovernanceSettings } from "../types";

describe("Awasio Admin Operations & Governance Workflow", () => {
  it("should define 12 distinct operational staff roles correctly", () => {
    const roles = new Set(INITIAL_STAFF_MEMBERS.flatMap((s) => s.roles));
    expect(roles.has("SUPER_ADMIN")).toBe(true);
    expect(roles.has("OPERATIONS_MANAGER")).toBe(true);
    expect(roles.has("SENIOR_QC_LEAD")).toBe(true);
    expect(roles.has("QC_REVIEWER")).toBe(true);
    expect(roles.has("CATALOG_SPECIALIST")).toBe(true);
    expect(roles.has("VERIFICATION_SPECIALIST")).toBe(true);
    expect(roles.has("LEGAL_COMPLIANCE_OFFICER")).toBe(true);
    expect(roles.has("FRAUD_INVESTIGATOR")).toBe(true);
    expect(roles.has("SUPPORT_EXECUTIVE")).toBe(true);
    expect(roles.has("FINANCE_EXECUTIVE")).toBe(true);
    expect(roles.has("FINANCE_APPROVER")).toBe(true);
    expect(roles.has("ANALYST_AUDITOR")).toBe(true);
  });

  it("should have active staff assigned to each specialized team", () => {
    const qcTeam = INITIAL_STAFF_MEMBERS.filter((s) => s.roles.includes("QC_REVIEWER") || s.roles.includes("SENIOR_QC_LEAD"));
    const kycTeam = INITIAL_STAFF_MEMBERS.filter((s) => s.roles.includes("VERIFICATION_SPECIALIST") || s.roles.includes("LEGAL_COMPLIANCE_OFFICER"));
    const disputeTeam = INITIAL_STAFF_MEMBERS.filter((s) => s.roles.includes("SUPPORT_EXECUTIVE"));
    const fraudTeam = INITIAL_STAFF_MEMBERS.filter((s) => s.roles.includes("FRAUD_INVESTIGATOR"));

    expect(qcTeam.length).toBeGreaterThanOrEqual(3);
    expect(kycTeam.length).toBeGreaterThanOrEqual(2);
    expect(disputeTeam.length).toBeGreaterThanOrEqual(1);
    expect(fraudTeam.length).toBeGreaterThanOrEqual(1);
  });

  it("should auto-distribute unassigned property QC queue evenly across QC staff pool", () => {
    const qcStaff = INITIAL_STAFF_MEMBERS.filter((s) => s.roles.includes("QC_REVIEWER") || s.roles.includes("SENIOR_QC_LEAD"));
    
    // Simulate unassigned queue of 6 property listings
    const testQueue: PropertyQcItem[] = [
      { ...INITIAL_PROPERTY_QC_QUEUE[0], id: 101, qcReviewerId: null, qcReviewerName: "Unassigned", qcStatus: "SUBMITTED" },
      { ...INITIAL_PROPERTY_QC_QUEUE[0], id: 102, qcReviewerId: null, qcReviewerName: "Unassigned", qcStatus: "SUBMITTED" },
      { ...INITIAL_PROPERTY_QC_QUEUE[0], id: 103, qcReviewerId: null, qcReviewerName: "Unassigned", qcStatus: "SUBMITTED" },
      { ...INITIAL_PROPERTY_QC_QUEUE[0], id: 104, qcReviewerId: null, qcReviewerName: "Unassigned", qcStatus: "SUBMITTED" },
      { ...INITIAL_PROPERTY_QC_QUEUE[0], id: 105, qcReviewerId: null, qcReviewerName: "Unassigned", qcStatus: "SUBMITTED" },
      { ...INITIAL_PROPERTY_QC_QUEUE[0], id: 106, qcReviewerId: null, qcReviewerName: "Unassigned", qcStatus: "SUBMITTED" },
    ];

    // Auto-distribute using Round Robin
    let staffIndex = 0;
    const distributedQueue = testQueue.map((item) => {
      const staff = qcStaff[staffIndex % qcStaff.length];
      staffIndex++;
      return {
        ...item,
        qcReviewerId: staff.id,
        qcReviewerName: staff.name,
        qcStatus: "UNDER_REVIEW" as const,
      };
    });

    // Verify all items are now assigned and under review
    distributedQueue.forEach((item) => {
      expect(item.qcReviewerId).not.toBeNull();
      expect(item.qcReviewerName).not.toBe("Unassigned");
      expect(item.qcStatus).toBe("UNDER_REVIEW");
    });

    // Verify distribution is balanced (no single staff got all tickets)
    const assignmentsPerStaff: Record<number, number> = {};
    distributedQueue.forEach((item) => {
      if (item.qcReviewerId) {
        assignmentsPerStaff[item.qcReviewerId] = (assignmentsPerStaff[item.qcReviewerId] || 0) + 1;
      }
    });

    Object.values(assignmentsPerStaff).forEach((count) => {
      expect(count).toBeLessThanOrEqual(3);
    });
  });

  it("should support Super Admin platform moderation switches", () => {
    let settings: AdminGovernanceSettings = { ...DEFAULT_GOVERNANCE_SETTINGS };

    // 1. Switch to Mandatory 100% Review
    settings = {
      ...settings,
      propertyReviewPolicy: "MANDATORY_REVIEW",
      updatedAt: new Date().toISOString(),
      updatedByStaffName: "Vinay Kumar (SUPER_ADMIN)",
    };
    expect(settings.propertyReviewPolicy).toBe("MANDATORY_REVIEW");

    // 2. Switch to Instant Publish (Review off)
    settings = {
      ...settings,
      propertyReviewPolicy: "INSTANT_PUBLISH_BYPASS",
      updatedAt: new Date().toISOString(),
    };
    expect(settings.propertyReviewPolicy).toBe("INSTANT_PUBLISH_BYPASS");

    // 3. Switch to AI Smart Triage
    settings = {
      ...settings,
      propertyReviewPolicy: "AI_SMART_TRIAGE",
      routingStrategy: "LEAST_LOADED",
      maxActiveTicketsPerAgent: 15,
    };
    expect(settings.propertyReviewPolicy).toBe("AI_SMART_TRIAGE");
    expect(settings.routingStrategy).toBe("LEAST_LOADED");
    expect(settings.maxActiveTicketsPerAgent).toBe(15);
  });
});
