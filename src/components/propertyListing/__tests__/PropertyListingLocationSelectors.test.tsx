import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PropertyListingCitySelector } from "../PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "../PropertyListingLocalitySelector";
import * as suggestionsClient from "@/lib/awasioSuggestions";

jest.mock("@/lib/awasioSuggestions");

describe("PropertyListingLocationSelectors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PropertyListingCitySelector", () => {
    it("renders with placeholder and triggers prefetch when state is provided", async () => {
      (suggestionsClient.fetchAwasioSuggestions as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "ct-1",
            type: "CITY",
            title: "Gurugram",
            location: { city: "Gurugram", state: "Haryana" },
          },
          {
            id: "ct-2",
            type: "CITY",
            title: "Faridabad",
            location: { city: "Faridabad", state: "Haryana" },
          },
        ],
        pagination: { hasNextPage: false, page: 1, pageSize: 30 },
      });

      const handleChange = jest.fn();
      render(
        <PropertyListingCitySelector
          value=""
          selectedState="Haryana"
          onChange={handleChange}
        />
      );

      expect(screen.getByText(/Select City in Haryana/i)).toBeTruthy();

      // Click to open
      fireEvent.click(screen.getByText(/Select City in Haryana/i));

      await waitFor(() => {
        expect(screen.getByText("Gurugram")).toBeTruthy();
        expect(screen.getByText("Faridabad")).toBeTruthy();
      });

      // Select Gurugram
      fireEvent.click(screen.getByText("Gurugram"));
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Gurugram", state: "Haryana" })
      );
    });

    it("displays selected city name and allows clearing", () => {
      const handleChange = jest.fn();
      render(
        <PropertyListingCitySelector
          value="Bengaluru"
          onChange={handleChange}
        />
      );

      expect(screen.getByText("Bengaluru")).toBeTruthy();

      const clearBtn = screen.getByLabelText("Clear city selection");
      fireEvent.click(clearBtn);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: "" })
      );
    });
  });

  describe("PropertyListingLocalitySelector", () => {
    it("is disabled when no city is selected", () => {
      const handleChange = jest.fn();
      render(
        <PropertyListingLocalitySelector
          value=""
          cityName=""
          onChange={handleChange}
        />
      );

      const input = screen.getByPlaceholderText("Select City first") as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it("prefetches localities when city is provided and allows selection", async () => {
      (suggestionsClient.fetchAwasioSuggestions as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "loc-1",
            type: "LOCALITY",
            title: "DLF Phase 5",
            badge: "Locality",
            location: {
              city: "Gurugram",
              locality: "DLF Phase 5",
              pincode: 122002,
              lat: 28.4442,
              lng: 77.0945,
            },
          },
        ],
        pagination: { hasNextPage: true, page: 1, pageSize: 30 },
      });

      const handleChange = jest.fn();
      render(
        <PropertyListingLocalitySelector
          value=""
          cityName="Gurugram"
          onChange={handleChange}
        />
      );

      const input = screen.getByPlaceholderText("Select Locality in Gurugram") as HTMLInputElement;
      expect(input.disabled).toBe(false);

      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText("DLF Phase 5")).toBeTruthy();
      });

      fireEvent.click(screen.getByText("DLF Phase 5"));

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "DLF Phase 5",
          pincode: "122002",
          lat: 28.4442,
          lng: 77.0945,
          isCustom: false,
        })
      );
    });

    it("allows entering custom locality when typed", async () => {
      (suggestionsClient.fetchAwasioSuggestions as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
        pagination: { hasNextPage: false, page: 1, pageSize: 30 },
      });

      const handleChange = jest.fn();
      render(
        <PropertyListingLocalitySelector
          value=""
          cityName="Noida"
          onChange={handleChange}
        />
      );

      const input = screen.getByPlaceholderText("Select Locality in Noida");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "My New Colony" } });

      await waitFor(() => {
        expect(
          screen.getByText(/Use "My New Colony" as custom locality/i)
        ).toBeTruthy();
      });

      fireEvent.click(
        screen.getByText(/Use "My New Colony" as custom locality/i)
      );

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "My New Colony",
          isCustom: true,
        })
      );
    });

    it("paginates on first render when scrolled without searching", async () => {
      (suggestionsClient.fetchAwasioSuggestions as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "loc-1",
            type: "LOCALITY",
            title: "Sector 1",
            location: { city: "Gurugram", locality: "Sector 1" },
          },
        ],
        pagination: { hasNextPage: true, page: 1, pageSize: 30 },
      });

      (suggestionsClient.fetchAwasioSuggestions as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "loc-2",
            type: "LOCALITY",
            title: "Sector 2",
            location: { city: "Gurugram", locality: "Sector 2" },
          },
        ],
        pagination: { hasNextPage: false, page: 2, pageSize: 30 },
      });

      render(
        <PropertyListingLocalitySelector
          value=""
          cityName="Gurugram"
          onChange={jest.fn()}
        />
      );

      const input = screen.getByPlaceholderText("Select Locality in Gurugram");
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText("Sector 1")).toBeTruthy();
      });

      const listContainer = screen.getByText("Sector 1").closest(".overflow-y-auto");
      expect(listContainer).toBeTruthy();

      Object.defineProperty(listContainer, "scrollHeight", { value: 500, configurable: true });
      Object.defineProperty(listContainer, "scrollTop", { value: 460, configurable: true });
      Object.defineProperty(listContainer, "clientHeight", { value: 40, configurable: true });

      fireEvent.scroll(listContainer!);

      await waitFor(() => {
        expect(screen.getByText("Sector 2")).toBeTruthy();
      });
    });
  });
});
