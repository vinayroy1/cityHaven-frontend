import { describe, it, expect } from "@jest/globals";
import { formatMoney, formatMoneyShort, formatNumber, isValidPhone, toInternationalPhone } from "./money";

describe("money — India output unchanged", () => {
  it("full amounts", () => {
    expect(formatMoney(1234567, "INR")).toBe("₹12,34,567");
    expect(formatMoney(25000)).toBe("₹25,000"); // default India
    expect(formatNumber(1234567, "IN")).toBe("12,34,567");
  });
  it("short amounts match the old detail-page formatter", () => {
    expect(formatMoneyShort(12500000, "INR")).toBe("₹1.25 Cr");
    expect(formatMoneyShort(12000000, "INR")).toBe("₹1.20 Cr");
    expect(formatMoneyShort(10000000, "INR")).toBe("₹1 Cr");
    expect(formatMoneyShort(4500000, "INR")).toBe("₹45 L");
    expect(formatMoneyShort(25000, "INR")).toBe("₹25,000");
    expect(formatMoneyShort(12000000, "INR", { decimals: "trim" })).toBe("₹1.2 Cr");
  });
  it("empty values", () => {
    expect(formatMoney(null, "INR")).toBe("");
    expect(formatMoneyShort(undefined, "INR")).toBe("");
  });
});

describe("money — new countries", () => {
  it("Nepal / Bangladesh use lakh, Sri Lanka uses million", () => {
    expect(formatMoney(2500000, "NPR")).toBe("Rs. 25,00,000");
    expect(formatMoneyShort(2500000, "NP")).toBe("Rs. 25 L");
    expect(formatMoneyShort(15000000, "BDT")).toBe("৳1.50 Cr");
    expect(formatMoney(2500000, "LKR")).toBe("Rs. 2,500,000");
    expect(formatMoneyShort(25000000, "LK")).toBe("Rs. 25 M");
  });
});

describe("phone", () => {
  it("India", () => {
    expect(isValidPhone("98765 43210", "IN")).toBe(true);
    expect(isValidPhone("+91 9876543210", "IN")).toBe(true);
    expect(isValidPhone("5876543210", "IN")).toBe(false);
    expect(isValidPhone("9876543210")).toBe(true);
  });
  it("Nepal / Bangladesh / Sri Lanka", () => {
    expect(isValidPhone("9801234567", "NP")).toBe(true);
    expect(isValidPhone("01712345678", "BD")).toBe(true);
    expect(isValidPhone("+8801712345678", "BD")).toBe(true);
    expect(isValidPhone("0712345678", "LK")).toBe(true);
    expect(isValidPhone("9876543210", "LK")).toBe(false);
    expect(toInternationalPhone("01712345678", "BD")).toBe("+8801712345678");
  });
});

describe("account mobile storage", () => {
  it("India stays 10 digits; others get their code", async () => {
    const { toStoredMobile, splitStoredMobile, displayMobile } = await import("./money");
    expect(toStoredMobile("98765 43210", "IN")).toBe("9876543210");
    expect(toStoredMobile("9801234567", "NP")).toBe("+9779801234567");
    expect(toStoredMobile("01712345678", "BD")).toBe("+8801712345678");
    expect(toStoredMobile("0712345678", "LK")).toBe("+94712345678");
    expect(toStoredMobile("12345", "LK")).toBe("");
    expect(splitStoredMobile("9876543210")).toEqual({ countryCode: "IN", local: "9876543210" });
    expect(splitStoredMobile("+94712345678")).toEqual({ countryCode: "LK", local: "712345678" });
    expect(displayMobile("9876543210")).toBe("+91 9876543210");
    expect(displayMobile("+9779801234567")).toBe("+977 9801234567");
  });
});
