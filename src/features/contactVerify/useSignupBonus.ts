"use client";

import { useGetCreditPlatformConfigQuery } from "./api";

/** Welcome credits a new account gets (admin-configured SIGNUP_BONUS); 1000 until the config loads. */
export function useSignupBonus(): number {
  const { data } = useGetCreditPlatformConfigQuery();
  const action = data?.data?.actions?.find((a) => a.key === "SIGNUP_BONUS");
  return action?.isEnabled === false ? 0 : (action?.creditAmount ?? 1000);
}

export const formatCredits = (n: number) => n.toLocaleString("en-IN");
