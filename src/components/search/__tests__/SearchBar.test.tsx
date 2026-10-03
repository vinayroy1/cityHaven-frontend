import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../SearchBar";
import { initialSearchState } from "../searchQuery";

jest.mock("../LocationSearchInput", () => ({ LocationSearchInput: () => null }));
jest.mock("../SearchDialog", () => ({ SearchDialog: () => null }));

describe("listing search context", () => {
  it("commits Rent immediately and clears purchase budgets", () => {
    const onChange = jest.fn();
    render(<SearchBar variant="results" value={{ ...initialSearchState(), priceMin: 1000000 }} onChange={onChange} onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /^Rent$/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: "RENT", priceMin: undefined, priceMax: undefined }));
  });

  it("commits commercial rental context immediately", () => {
    const onChange = jest.fn();
    render(<SearchBar variant="results" value={{ ...initialSearchState(), intent: "COMMERCIAL", priceMax: 5000000 }} onChange={onChange} onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Rent / Lease" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ transaction: "RENT", priceMin: undefined, priceMax: undefined }));
  });
});
