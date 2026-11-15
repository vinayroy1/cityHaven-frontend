import { buildReceipts, financialYear, hraExemption, isValidPan, receiptHints, type ReceiptInput } from "../receipts";

const base: ReceiptInput = {
  tenantName: "Rahul", landlordName: "Sunita", landlordPan: "", propertyAddress: "Noida",
  monthlyRent: 25000, fromMonth: "2026-04", toMonth: "2027-03", frequency: "MONTHLY", payMode: "UPI", payRef: "", payDay: 5,
};

describe("rent receipts", () => {
  it("makes 12 monthly receipts for a financial year", () => {
    const r = buildReceipts(base);
    expect(r).toHaveLength(12);
    expect(r[0].periodLabel).toBe("April 2026");
    expect(r[11].periodLabel).toBe("March 2027");
    expect(r[0].amount).toBe(25000);
    expect(r[0].amountWords).toBe("Rupees Twenty Five Thousand Only");
    expect(r[0].date).toBe("05 Apr 2026");
    expect(new Set(r.map((x) => x.no)).size).toBe(12);
  });
  it("groups quarters and keeps a short last receipt", () => {
    const r = buildReceipts({ ...base, frequency: "QUARTERLY", toMonth: "2026-11" });
    expect(r.map((x) => x.months)).toEqual([3, 3, 2]);
    expect(r[2].amount).toBe(50000);
    expect(r[0].periodLabel).toBe("Apr 2026 – Jun 2026");
  });
  it("returns nothing for bad input", () => {
    expect(buildReceipts({ ...base, monthlyRent: 0 })).toEqual([]);
    expect(buildReceipts({ ...base, fromMonth: "2027-05", toMonth: "2027-01" })).toEqual([]);
  });
  it("clamps the pay day to the month length", () => {
    expect(buildReceipts({ ...base, fromMonth: "2027-02", toMonth: "2027-02", payDay: 28 })[0].date).toBe("28 Feb 2027");
  });
  it("asks for PAN above ₹1 lakh a year and validates it", () => {
    expect(receiptHints(base).some((h) => h.tone === "warn" && /PAN/.test(h.text))).toBe(true);
    expect(receiptHints({ ...base, landlordPan: "ABCDE1234F" }).some((h) => h.tone === "ok")).toBe(true);
    expect(receiptHints({ ...base, monthlyRent: 8000 })).toHaveLength(0);
    expect(isValidPan("abcde1234f")).toBe(true);
    expect(isValidPan("ABCD1234F")).toBe(false);
  });
  it("flags revenue stamp for cash above ₹5,000", () => {
    expect(receiptHints({ ...base, payMode: "CASH", landlordPan: "ABCDE1234F" }).some((h) => /revenue stamp/.test(h.text))).toBe(true);
  });
  it("computes HRA exemption as the least of three limits", () => {
    const r = hraExemption({ basic: 600000, hra: 240000, rentPaid: 300000, metro: true });
    expect(r.exempt).toBe(240000);
    expect(hraExemption({ basic: 600000, hra: 300000, rentPaid: 200000, metro: false }).exempt).toBe(140000);
  });
  it("financial year runs April to March", () => {
    expect(financialYear(new Date(2026, 10, 15))).toMatchObject({ from: "2026-04", to: "2027-03", label: "FY 2026-27" });
    expect(financialYear(new Date(2027, 1, 1))).toMatchObject({ from: "2026-04", to: "2027-03" });
  });
});
