import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, useWatch } from "react-hook-form";
import type { FieldConfig, SectionConfig, StepConfig } from "@/lib/listingEngine/types";
import { FieldRenderer } from "../FieldRenderer";
import { SectionRenderer } from "../SectionRenderer";
import { Stepper } from "../Stepper";
import { groupByPhase } from "../phases";
import { ListingEngineProvider } from "../EngineContext";
import { FormProvider } from "react-hook-form";

jest.mock("@/components/propertyListing/PropertyListingCitySelector", () => ({ PropertyListingCitySelector: () => null }));
jest.mock("@/components/propertyListing/PropertyListingLocalitySelector", () => ({ PropertyListingLocalitySelector: () => null }));
jest.mock("@/components/propertyListing/SearchableSelect", () => ({ SearchableSelect: () => null }));
jest.mock("@/lib/auth/storedUser", () => ({ getStoredUserContact: () => null }));

let latest: Record<string, unknown> = {};
function Harness({ field, defaults }: { field: FieldConfig; defaults: Record<string, unknown> }) {
  const form = useForm({ defaultValues: defaults });
  const values = useWatch({ control: form.control }) as Record<string, unknown>;
  latest = values;
  return (
    <FormProvider {...form}>
      <ListingEngineProvider value={{ values, predicates: {}, customComponents: {}, mode: "wizard" }}>
        <FieldRenderer field={field} />
      </ListingEngineProvider>
    </FormProvider>
  );
}

const opts = [
  { value: "solo", label: "Solo designer", icon: "user", description: "Just me" },
  { value: "firm", label: "Design firm", icon: "building-2" },
];

describe("listing engine fields", () => {
  it("radio cards select a single value", () => {
    render(<Harness field={{ id: "kind", label: "What are you?", type: "radio", options: opts, meta: { variant: "cards" } }} defaults={{ kind: "" }} />);
    fireEvent.click(screen.getByRole("radio", { name: /Design firm/ }));
    expect(latest.kind).toBe("firm");
    expect(screen.getByRole("radio", { name: /Design firm/ })).toHaveAttribute("aria-checked", "true");
  });

  it("chip-multi cards toggle and respect maxItems", () => {
    const three = [...opts, { value: "x", label: "Other" }];
    render(<Harness field={{ id: "tags", label: "Pick", type: "chip-multi", options: three, maxItems: 2, meta: { variant: "cards" } }} defaults={{ tags: [] }} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Design firm/ }));
    expect(latest.tags).toEqual(["solo", "firm"]);
    expect(screen.getByRole("checkbox", { name: /Other/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: /Solo/ }));
    expect(latest.tags).toEqual(["firm"]);
  });

  it("counter stepper clamps to min/max", () => {
    render(<Harness field={{ id: "n", label: "Team size", type: "counter", min: 1, max: 2 }} defaults={{ n: 1 }} />);
    expect(screen.getByRole("button", { name: "Decrease Team size" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Increase Team size" }));
    expect(latest.n).toBe(2);
    expect(screen.getByRole("button", { name: "Increase Team size" })).toBeDisabled();
  });

  it("number field stores numbers and null when cleared", () => {
    render(<Harness field={{ id: "yrs", label: "Years", type: "number", meta: { suffix: "yrs" } }} defaults={{ yrs: null }} />);
    const input = screen.getByLabelText(/Years/);
    fireEvent.change(input, { target: { value: "7" } });
    expect(latest.yrs).toBe(7);
    fireEvent.change(input, { target: { value: "" } });
    expect(latest.yrs).toBeNull();
  });
});

describe("SectionRenderer standalone props", () => {
  function Manage() {
    const form = useForm({ defaultValues: { name: "Studio", hidden: "" } });
    const values = useWatch({ control: form.control });
    const section: SectionConfig = {
      id: "s",
      title: "Basics",
      fields: [
        { id: "name", label: "Studio name", type: "text" },
        { id: "hidden", label: "Secret", type: "text", visibleWhen: { preset: "never" } },
      ],
    };
    return <SectionRenderer section={section} form={form} values={values} mode="manage" predicates={{ never: () => false }} customComponents={{}} />;
  }
  it("renders without a shell and applies predicates", () => {
    render(<Manage />);
    expect(screen.getByLabelText(/Studio name/)).toHaveValue("Studio");
    expect(screen.queryByLabelText(/Secret/)).toBeNull();
  });
});

describe("phase rail", () => {
  const steps: StepConfig[] = [
    { id: "a", label: "Identity", phase: "About your studio" },
    { id: "b", label: "Location", phase: "About your studio" },
    { id: "c", label: "Pricing", phase: "Show your work" },
  ];
  it("groups steps by phase in phase order", () => {
    const g = groupByPhase(steps, ["About your studio", "Show your work"]);
    expect(g.map((x) => x.label)).toEqual(["About your studio", "Show your work"]);
    expect(g[0].steps.map((s) => s.index)).toEqual([0, 1]);
  });
  it("expands only the active phase and marks error step", () => {
    const onNav = jest.fn();
    render(<Stepper steps={steps} current={1} maxVisited={2} onNavigate={onNav} errorStepId="b" />);
    expect(screen.getByRole("button", { name: /Location/ })).toHaveAttribute("aria-current", "step");
    expect(screen.queryByRole("button", { name: /^Pricing/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Show your work/ }));
    expect(onNav).toHaveBeenCalledWith(2);
  });
});
