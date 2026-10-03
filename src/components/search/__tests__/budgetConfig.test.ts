import { budgetConfig } from "../searchConfig";

describe("contextual property budgets", () => {
  it.each(["RENT", "PG"] as const)("uses monthly rupees for %s", (intent) => {
    const config = budgetConfig({ intent });
    expect(config.monthly).toBe(true);
    expect(config.format(15000)).toBe("₹15,000");
    expect(config.presets[0]).toBeLessThan(10000);
  });

  it("distinguishes commercial rent from commercial purchase", () => {
    const rent = budgetConfig({ intent: "COMMERCIAL", transaction: "RENT" });
    const buy = budgetConfig({ intent: "COMMERCIAL", transaction: "SELL" });
    expect(rent.presets).toContain(10000);
    expect(rent.format(100000)).toBe("₹1,00,000");
    expect(buy.monthly).toBe(false);
    expect(buy.format(10000000)).toBe("₹1 Cr");
    expect(buy.presets[0]).toBeGreaterThan(rent.presets[0]);
  });

  it.each(["BUY", "PLOT"] as const)("uses purchase units for %s", (intent) => {
    expect(budgetConfig({ intent }).format(2500000)).toBe("₹25 L");
  });
});
