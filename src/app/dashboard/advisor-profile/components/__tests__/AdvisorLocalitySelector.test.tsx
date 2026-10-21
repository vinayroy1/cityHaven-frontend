import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdvisorLocalitySelector } from "../AdvisorLocalitySelector";
import * as suggestionsClient from "@/lib/awasioSuggestions";

jest.mock("@/lib/awasioSuggestions");

describe("AdvisorLocalitySelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders selected localities as removable chips", () => {
    const handleRemove = jest.fn();
    render(
      <AdvisorLocalitySelector
        cityName="Delhi"
        selectedLocalities={["Saket", "Vasant Kunj"]}
        onAddLocality={jest.fn()}
        onRemoveLocality={handleRemove}
      />
    );

    expect(screen.getByText("Saket")).toBeTruthy();
    expect(screen.getByText("Vasant Kunj")).toBeTruthy();

    const removeBtn = screen.getByLabelText("Remove Saket");
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith("Saket");
  });

  it("displays popular localities when focused on a city", async () => {
    const handleAdd = jest.fn();
    render(
      <AdvisorLocalitySelector
        cityName="Delhi"
        selectedLocalities={[]}
        onAddLocality={handleAdd}
        onRemoveLocality={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Search & select localities in Delhi/i);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/Popular Localities in Delhi/i)).toBeTruthy();
      expect(screen.getByText("Hauz Khas")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Hauz Khas"));
    expect(handleAdd).toHaveBeenCalledWith("Hauz Khas");
  });

  it("allows adding custom locality when searched", async () => {
    const handleAdd = jest.fn();
    render(
      <AdvisorLocalitySelector
        cityName="Delhi"
        selectedLocalities={[]}
        onAddLocality={handleAdd}
        onRemoveLocality={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Search & select localities in Delhi/i);
    fireEvent.change(input, { target: { value: "Custom Sector 99" } });

    await waitFor(() => {
      expect(screen.getByText(/Add "Custom Sector 99" as custom locality/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Add "Custom Sector 99" as custom locality/i));
    expect(handleAdd).toHaveBeenCalledWith("Custom Sector 99");
  });
});
