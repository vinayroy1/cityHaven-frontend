import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { BasicContextStep } from "../BasicContextStep";
import { initialPropertyListingFormValues } from "@/features/propertyListing";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const renderWithForm = (defaults?: Partial<PropertyListingFormValues>) => {
  const form = useForm<PropertyListingFormValues>({
    defaultValues: { ...initialPropertyListingFormValues, ...defaults },
  });

  const view = render(
    <FormProvider {...form}>
      <BasicContextStep form={form} />
    </FormProvider>,
  );

  return { form, user: userEvent.setup(), ...view };
};

describe("BasicContextStep visibility rules", () => {
  it("keeps sub-type disabled until a property type is selected for rent/sell", async () => {
    const { user } = renderWithForm();

    const trigger = screen.getByTestId("property-sub-type-trigger");
    expect(trigger).toBeDisabled();

    await user.click(screen.getByText("Residential"));
    expect(trigger).not.toBeDisabled();
  });

  it("shows residential/commercial options and residential sub-types after selecting residential for rent/sell", async () => {
    const { user } = renderWithForm();

    expect(screen.getByText("Residential")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();

    await user.click(screen.getByText("Residential"));
    await user.click(screen.getByTestId("property-sub-type-trigger"));
    expect(screen.getByText("Apartment")).toBeInTheDocument();
    expect(screen.getByText("Independent House / Villa")).toBeInTheDocument();
    expect(screen.queryByText("Office")).not.toBeInTheDocument();
  });

  it("forces residential + PG sub-types and hides commercial-only fields when listing type is PG", async () => {
    const { user } = renderWithForm();

    await user.click(screen.getByText("PG"));
    expect(screen.queryByText("Commercial")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("property-sub-type-trigger"));
    expect(screen.getByText("Private Room")).toBeInTheDocument();
    expect(screen.getByText("Shared Room")).toBeInTheDocument();
    expect(screen.queryByText("Office")).not.toBeInTheDocument();

    expect(screen.queryByText("Property sub-category")).not.toBeInTheDocument();
    expect(screen.queryByText("Located inside")).not.toBeInTheDocument();
  });

  it("shows commercial sub-types, sub-category, and located-inside for office/retail", async () => {
    const { user } = renderWithForm();

    await user.click(screen.getByText("Commercial"));
    await user.click(screen.getByTestId("property-sub-type-trigger"));
    await user.click(screen.getByText("Office"));

    expect(screen.getByText("Property sub-category")).toBeInTheDocument();
    expect(screen.getByText("Located inside")).toBeInTheDocument();

    await user.click(screen.getByTestId("property-sub-category-trigger"));
    expect(screen.getByText("Ready to move office space")).toBeInTheDocument();
    await user.click(screen.getByText("Ready to move office space"));

    await user.click(screen.getByTestId("located-inside-trigger"));
    expect(screen.getByText("Mall")).toBeInTheDocument();
  });
});
