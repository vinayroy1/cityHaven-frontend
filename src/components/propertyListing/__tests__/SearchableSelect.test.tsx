import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchableSelect } from "../SearchableSelect";

describe("SearchableSelect Component", () => {
  const mockOptions = [
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Gurgaon",
    "Noida",
    "Hyderabad",
    "Pune",
  ];

  test("renders trigger with placeholder when no value is selected", () => {
    render(
      <SearchableSelect
        value=""
        onChange={jest.fn()}
        options={mockOptions}
        placeholder="Select City"
      />,
    );

    expect(screen.getByText("Select City")).toBeTruthy();
  });

  test("renders selected value label", () => {
    render(
      <SearchableSelect
        value="Bengaluru"
        onChange={jest.fn()}
        options={mockOptions}
        placeholder="Select City"
      />,
    );

    expect(screen.getByText("Bengaluru")).toBeTruthy();
  });

  test("opens dropdown and filters options when typing", () => {
    render(
      <SearchableSelect
        value=""
        onChange={jest.fn()}
        options={mockOptions}
        placeholder="Select City"
        searchPlaceholder="Type to search city..."
      />,
    );

    // Open dropdown
    const trigger = screen.getByRole("button", { name: /select city/i });
    fireEvent.click(trigger);

    // Search input should appear
    const searchInput = screen.getByPlaceholderText("Type to search city...");
    expect(searchInput).toBeTruthy();

    // Type "mum"
    fireEvent.change(searchInput, { target: { value: "mum" } });

    // "Mumbai" should be visible, others should be filtered out
    expect(screen.getByRole("option", { name: /mumbai/i })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /bengaluru/i })).toBeNull();
  });

  test("calls onChange when an option is selected", () => {
    const handleChange = jest.fn();
    render(
      <SearchableSelect
        value=""
        onChange={handleChange}
        options={mockOptions}
        placeholder="Select City"
      />,
    );

    const trigger = screen.getByRole("button", { name: /select city/i });
    fireEvent.click(trigger);

    const option = screen.getByRole("option", { name: /delhi/i });
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith("Delhi");
  });

  test("supports custom option when allowCustom is true", () => {
    const handleCustom = jest.fn();
    const handleChange = jest.fn();

    render(
      <SearchableSelect
        value=""
        onChange={handleChange}
        options={mockOptions}
        placeholder="Select Locality"
        allowCustom={true}
        onCustomSelect={handleCustom}
      />,
    );

    const trigger = screen.getByRole("button", { name: /select locality/i });
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText("Type to search...");
    fireEvent.change(searchInput, { target: { value: "My Unique Colony" } });

    // Custom option button should appear
    const customBtn = screen.getByText(/use/i);
    expect(customBtn).toBeTruthy();

    fireEvent.click(customBtn);
    expect(handleCustom).toHaveBeenCalledWith("My Unique Colony");
    expect(handleChange).toHaveBeenCalledWith("__CUSTOM__");
  });
});
