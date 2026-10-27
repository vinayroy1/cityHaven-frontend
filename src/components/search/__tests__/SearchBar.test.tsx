import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { SearchBar } from "../SearchBar";
import { initialSearchState } from "../searchQuery";

jest.mock("../LocationSearchInput", () => ({ LocationSearchInput: () => null }));
jest.mock("../SearchDialog", () => ({ SearchDialog: () => null }));
jest.mock("@/features/locations/api", () => ({
  useGetCitiesQuery: () => ({ data: [] }),
}));
jest.mock("@/store/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => selector({ locations: { popularCities: [] } }),
}));

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

  it("opens the complete mobile search and filter flow from the home search", () => {
    window.scrollTo = jest.fn();
    render(<SearchBar variant="hero" value={initialSearchState()} onChange={jest.fn()} onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByText("Search by locality, project or landmark").closest("button")!);

    expect(screen.getByRole("dialog", { name: "Search and filter properties" })).toBeTruthy();
    expect(screen.getByText("Choose location and filters")).toBeTruthy();
    expect(screen.getByText("Property filters")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Search properties" })).toBeTruthy();
  });

  it("puts the selected mobile filters in a real navigation link", () => {
    window.scrollTo = jest.fn();
    render(<SearchBar variant="hero" value={initialSearchState()} onChange={jest.fn()} onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByText("Search by locality, project or landmark").closest("button")!);
    const dialog = screen.getByRole("dialog", { name: "Search and filter properties" });
    fireEvent.click(within(dialog).getByRole("button", { name: /^Rent$/ }));
    const submitLink = within(dialog).getByRole("link", { name: "Search properties" });

    expect(submitLink.getAttribute("href")).toBe("/rent/delhi");
  });
});
