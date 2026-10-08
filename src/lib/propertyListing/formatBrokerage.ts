export interface FormattedBrokerage {
  badge: string;
  label: string;
  amountFormatted: string | null;
  fullText: string;
  isZero: boolean;
  negotiableText?: string;
}

export function formatIndianCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(Number(num))) return "";
  return Number(num).toLocaleString("en-IN");
}

export function getBrokerageDisplay(
  brokerage?: number | null,
  brokerageType?: string | null,
  brokerageNegotiable?: boolean | null,
): FormattedBrokerage {
  const normType = (brokerageType || "").toUpperCase();
  const amt = brokerage !== null && brokerage !== undefined ? Number(brokerage) : null;
  const negotiableText =
    brokerageNegotiable !== undefined && brokerageNegotiable !== null
      ? brokerageNegotiable
        ? "Negotiable"
        : "Non-negotiable"
      : undefined;

  if (normType === "ZERO" || amt === 0) {
    return {
      badge: "0% Brokerage",
      label: "Zero Brokerage",
      amountFormatted: "₹0",
      fullText: "0% Brokerage (No fee from tenant / buyer)",
      isZero: true,
      negotiableText: undefined,
    };
  }

  if (normType === "HALF_MONTH_RENT") {
    const formatted = amt !== null && amt > 0 ? `₹${formatIndianCurrency(amt)}` : null;
    return {
      badge: "15 Days Rent",
      label: "15 Days Rent (Delhi/NCR Standard)",
      amountFormatted: formatted,
      fullText: formatted ? `15 Days Rent (${formatted})` : "15 Days Rent",
      isZero: false,
      negotiableText,
    };
  }

  if (normType === "ONE_MONTH_RENT") {
    const formatted = amt !== null && amt > 0 ? `₹${formatIndianCurrency(amt)}` : null;
    return {
      badge: "1 Month Rent",
      label: "1 Month Rent (30 Days)",
      amountFormatted: formatted,
      fullText: formatted ? `1 Month Rent (${formatted})` : "1 Month Rent",
      isZero: false,
      negotiableText,
    };
  }

  if (normType === "ONE_PERCENT") {
    const formatted = amt !== null && amt > 0 ? `₹${formatIndianCurrency(amt)}` : null;
    return {
      badge: "1% Brokerage",
      label: "1% of Sale Price",
      amountFormatted: formatted,
      fullText: formatted ? `1% (${formatted})` : "1% of Total Value",
      isZero: false,
      negotiableText,
    };
  }

  if (normType === "TWO_PERCENT") {
    const formatted = amt !== null && amt > 0 ? `₹${formatIndianCurrency(amt)}` : null;
    return {
      badge: "2% Brokerage",
      label: "2% of Sale Price",
      amountFormatted: formatted,
      fullText: formatted ? `2% (${formatted})` : "2% of Total Value",
      isZero: false,
      negotiableText,
    };
  }

  if (normType === "PERCENTAGE") {
    const pctVal = amt !== null ? `${amt}%` : "Percentage";
    return {
      badge: pctVal,
      label: `${pctVal} of Total Value`,
      amountFormatted: null,
      fullText: `${pctVal} Brokerage`,
      isZero: false,
      negotiableText,
    };
  }

  if (normType === "FIXED" || (amt !== null && amt > 0)) {
    const formatted = amt !== null ? `₹${formatIndianCurrency(amt)}` : "Fixed Fee";
    return {
      badge: formatted,
      label: `Fixed Brokerage: ${formatted}`,
      amountFormatted: formatted,
      fullText: `${formatted} (Fixed Fee)`,
      isZero: false,
      negotiableText,
    };
  }

  return {
    badge: "Brokerage Applicable",
    label: "Contact Agent for Brokerage",
    amountFormatted: null,
    fullText: "Contact Agent for Brokerage Terms",
    isZero: false,
    negotiableText,
  };
}
