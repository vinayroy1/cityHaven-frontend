import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { BrokerageField } from "../BrokerageField";
import { getBrokerageDisplay } from "@/lib/propertyListing/formatBrokerage";

const TestWrapper = ({
  defaultValues,
  children,
}: {
  defaultValues?: any;
  children: React.ReactNode;
}) => {
  const methods = useForm({
    defaultValues: {
      context: { listingType: "RENT", postedAs: "AGENT" },
      pricing: { price: 20000, brokerageType: "HALF_MONTH_RENT", brokerage: 10000, brokerageNegotiable: true },
      ...defaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("getBrokerageDisplay helper", () => {
  test("formats 15 Days Rent correctly", () => {
    const res = getBrokerageDisplay(12500, "HALF_MONTH_RENT", true);
    expect(res.badge).toBe("15 Days Rent");
    expect(res.fullText).toBe("15 Days Rent (₹12,500)");
    expect(res.negotiableText).toBe("Negotiable");
    expect(res.isZero).toBe(false);
  });

  test("formats 1 Month Rent correctly", () => {
    const res = getBrokerageDisplay(25000, "ONE_MONTH_RENT", false);
    expect(res.badge).toBe("1 Month Rent");
    expect(res.fullText).toBe("1 Month Rent (₹25,000)");
    expect(res.negotiableText).toBe("Non-negotiable");
    expect(res.isZero).toBe(false);
  });

  test("formats 1% Sale brokerage correctly", () => {
    const res = getBrokerageDisplay(85000, "ONE_PERCENT", true);
    expect(res.badge).toBe("1% Brokerage");
    expect(res.fullText).toBe("1% (₹85,000)");
    expect(res.isZero).toBe(false);
  });

  test("formats Zero Brokerage correctly", () => {
    const res = getBrokerageDisplay(0, "ZERO", false);
    expect(res.badge).toBe("0% Brokerage");
    expect(res.isZero).toBe(true);
    expect(res.fullText).toContain("0% Brokerage");
  });
});

describe("BrokerageField Component", () => {
  test("renders rental chips and calculates 15 days rent correctly", () => {
    render(
      <TestWrapper defaultValues={{ context: { listingType: "RENT" }, pricing: { price: 30000 } }}>
        <BrokerageField field={{ id: "pricing.brokerageBlock", label: "Brokerage", type: "brokerage" }} />
      </TestWrapper>
    );

    expect(screen.getByText("15 Days Rent")).toBeTruthy();
    expect(screen.getByText("1 Month Rent")).toBeTruthy();
    expect(screen.getByText("Zero Brokerage")).toBeTruthy();
    expect(screen.getByText(/Awasio Platform Guarantee: 0% Platform Brokerage/i)).toBeTruthy();
    expect(screen.getByText(/Based on monthly rent of/i)).toBeTruthy();
    expect(screen.getByText(/₹15,000/i)).toBeTruthy();
  });

  test("renders sale options for SELL listing type", () => {
    render(
      <TestWrapper defaultValues={{ context: { listingType: "SELL" }, pricing: { price: 5000000, brokerageType: "ONE_PERCENT" } }}>
        <BrokerageField field={{ id: "pricing.brokerageBlock", label: "Brokerage", type: "brokerage" }} />
      </TestWrapper>
    );

    expect(screen.getByText("1% of Total Value")).toBeTruthy();
    expect(screen.getByText("2% of Total Value")).toBeTruthy();
    expect(screen.getByText(/Based on property price of/i)).toBeTruthy();
    expect(screen.getByText(/₹50,000/i)).toBeTruthy();
  });
});
