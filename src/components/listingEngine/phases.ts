import type { StepConfig } from "@/lib/listingEngine/types";

export type PhaseGroup = { label: string; steps: { step: StepConfig; index: number }[] };

/** Group visible steps by `phase`, in `phases` order (unknown / missing phases keep step order). */
export function groupByPhase(steps: StepConfig[], phases?: readonly string[]): PhaseGroup[] {
  const groups: PhaseGroup[] = [];
  steps.forEach((step, index) => {
    const label = step.phase ?? "";
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, steps: [] };
      groups.push(g);
    }
    g.steps.push({ step, index });
  });
  if (phases?.length) {
    const rank = (l: string) => {
      const i = phases.indexOf(l);
      return i < 0 ? phases.length : i;
    };
    groups.sort((a, b) => rank(a.label) - rank(b.label) || a.steps[0].index - b.steps[0].index);
  }
  return groups;
}
