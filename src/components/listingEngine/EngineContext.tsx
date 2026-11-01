"use client";

import React, { createContext, useContext } from "react";
import type { ComponentType } from "react";
import type {
  CustomStepProps,
  FormValues,
  PredicateRegistry,
  ReadinessReport,
  WizardMode,
} from "@/lib/listingEngine/types";

export type EngineContextValue = {
  /** live form values (useWatch) — conditions are evaluated against these. */
  values: FormValues;
  predicates: PredicateRegistry;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customComponents: Record<string, ComponentType<CustomStepProps<any>>>;
  mode: WizardMode;
  goToStep?: (stepId: string, fieldPath?: string) => void;
  readiness?: ReadinessReport;
};

const EngineCtx = createContext<EngineContextValue | null>(null);

/** Supplies predicates / custom components / mode to SectionRenderer + FieldRenderer.
 *  ListingWizardShell renders this itself; manage pages wrap their sections in it. */
export function ListingEngineProvider({ value, children }: { value: EngineContextValue; children: React.ReactNode }) {
  return <EngineCtx.Provider value={value}>{children}</EngineCtx.Provider>;
}

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineCtx);
  return ctx ?? { values: {}, predicates: {}, customComponents: {}, mode: "wizard" };
}
