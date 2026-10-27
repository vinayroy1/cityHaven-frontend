declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeInitOptions {
    mode: "production" | "sandbox";
  }

  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_modal" | "_self" | "_blank";
  }

  export interface CashfreeCheckoutResult {
    error?: {
      code: string;
      message: string;
      type?: string;
    };
    redirect?: boolean;
    paymentDetails?: {
      paymentId?: string | number;
      orderId?: string;
      paymentMode?: string;
      paymentStatus?: string;
      [key: string]: any;
    };
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<CashfreeCheckoutResult>;
  }

  export function load(options: CashfreeInitOptions): Promise<CashfreeInstance>;
}
