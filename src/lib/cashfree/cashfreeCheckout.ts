"use client";

let cashfreePromise: Promise<any> | null = null;

export function getCashfreeMode(): "production" | "sandbox" {
  const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE?.toLowerCase();
  return mode === "sandbox" ? "sandbox" : "production";
}

/**
 * Initializes and caches the Cashfree SDK instance.
 * Safe to call on client-side only. Loaded dynamically to avoid blocking initial page load.
 */
export async function getCashfreeInstance() {
  if (typeof window === "undefined") return null;

  if (!cashfreePromise) {
    const mode = getCashfreeMode();
    cashfreePromise = (async () => {
      const { load } = await import("@cashfreepayments/cashfree-js");
      return load({ mode });
    })();
  }

  return cashfreePromise;
}

export interface CheckoutResult {
  status: "COMPLETED" | "CLOSED" | "FAILED" | "REDIRECTED";
  error?: string;
  paymentDetails?: any;
}

/**
 * Opens the Cashfree checkout modal for a given paymentSessionId.
 */
export async function launchCashfreeCheckout(
  paymentSessionId: string,
  options?: {
    redirectTarget?: "_modal" | "_self" | "_blank";
  }
): Promise<CheckoutResult> {
  const cashfree = await getCashfreeInstance();
  if (!cashfree) {
    throw new Error("Cashfree SDK failed to initialize in the browser.");
  }

  return new Promise((resolve) => {
    try {
      cashfree
        .checkout({
          paymentSessionId,
          redirectTarget: options?.redirectTarget || "_modal",
        })
        .then((result: any) => {
          if (result?.error) {
            // User closed the modal or error occurred
            const isUserClose =
              result.error.code === "user_dropped" ||
              result.error.message?.toLowerCase().includes("closed") ||
              result.error.message?.toLowerCase().includes("cancelled");

            resolve({
              status: isUserClose ? "CLOSED" : "FAILED",
              error: result.error.message || "Payment interrupted",
            });
            return;
          }

          if (result?.redirect) {
            resolve({
              status: "REDIRECTED",
            });
            return;
          }

          if (result?.paymentDetails) {
            resolve({
              status: "COMPLETED",
              paymentDetails: result.paymentDetails,
            });
            return;
          }

          // Fallback if completed without details
          resolve({ status: "COMPLETED" });
        })
        .catch((err: any) => {
          resolve({
            status: "FAILED",
            error: err?.message || "Cashfree checkout encounter an unexpected error.",
          });
        });
    } catch (err: any) {
      resolve({
        status: "FAILED",
        error: err?.message || "Failed to launch Cashfree checkout.",
      });
    }
  });
}
