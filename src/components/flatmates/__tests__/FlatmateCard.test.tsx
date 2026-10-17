import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FlatmateCard } from "@/components/flatmates/FlatmateCard";
import type { FlatmateListing } from "@/types/flatmate.types";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock api hook
jest.mock("@/features/flatmates/api", () => ({
  useExpressFlatmateInterestMutation: () => [jest.fn(), { isLoading: false }],
}));

describe("FlatmateCard", () => {
  beforeEach(() => pushMock.mockClear());

  const mockListing: FlatmateListing = {
    id: 1,
    slug: "have-room-koramangala-spacious-room",
    profileId: 10,
    mode: "HAVE_ROOM",
    status: "ACTIVE",
    title: "Spacious Master Bedroom with Balcony",
    cityName: "Bengaluru",
    locality: "Koramangala 5th Block",
    preferredLocalities: [],
    bhk: 3,
    roomType: "Private Room",
    furnishing: "Fully Furnished",
    rent: 18000,
    deposit: 36000,
    maintenance: 2500,
    minimumStayMonths: 6,
    currentOccupants: 2,
    spotsAvailable: 1,
    amenities: ["WiFi", "AC"],
    photos: ["https://example.com/room.jpg"],
    preferredGenders: ["Any Gender"],
    preferredOccupations: ["Working Professional"],
    preferredDiet: "Pure Vegetarian",
    smokingAllowed: false,
    drinkingAllowed: true,
    petsAllowed: true,
    countryCode: "IN",
    createdAt: "2026-10-16T12:00:00Z",
    updatedAt: "2026-10-16T12:00:00Z",
    profile: {
      displayName: "Ananya S.",
      occupation: "Software Engineer",
      isIdentityVerified: true,
    },
  };

  it("renders listing title and rent correctly", () => {
    render(<FlatmateCard listing={mockListing} />);

    expect(screen.getByText("Spacious Master Bedroom with Balcony")).toBeInTheDocument();
    expect(screen.getByText("₹18,000")).toBeInTheDocument();
    expect(screen.getByText("Koramangala 5th Block, Bengaluru")).toBeInTheDocument();
  });

  it("renders lifestyle badges such as diet and pet-friendly", () => {
    render(<FlatmateCard listing={mockListing} />);

    expect(screen.getByText("Pure Vegetarian")).toBeInTheDocument();
    expect(screen.getByText("Pet-friendly")).toBeInTheDocument();
    expect(screen.getByText("Non-smoker")).toBeInTheDocument();
  });

  it("renders poster display name and connect button", () => {
    render(<FlatmateCard listing={mockListing} />);

    expect(screen.getByText("Ananya S.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connect/i })).toBeInTheDocument();
  });

  it("opens details from the card while keeping Connect independent", () => {
    render(<FlatmateCard listing={mockListing} />);

    fireEvent.click(screen.getByRole("link", { name: /view details/i }));
    expect(pushMock).toHaveBeenCalledWith(`/flatmates/${mockListing.slug}`);

    pushMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /connect/i }));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows room cost and occupancy decision details", () => {
    render(<FlatmateCard listing={mockListing} />);

    expect(screen.getByText(/₹36,000/)).toBeInTheDocument();
    expect(screen.getByText(/₹2,500/)).toBeInTheDocument();
    expect(screen.getByText(/2 current occupants/)).toBeInTheDocument();
    expect(screen.getByText(/1 spot open/)).toBeInTheDocument();
    expect(screen.getByText(/6\+ month stay/)).toBeInTheDocument();
  });

  it("shows preferred areas for room seekers", () => {
    render(
      <FlatmateCard
        listing={{
          ...mockListing,
          id: 2,
          slug: "need-room-hsr",
          mode: "NEED_ROOM",
          preferredLocalities: ["HSR Layout", "Koramangala"],
          rent: null,
          budgetMin: 15000,
          budgetMax: 22000,
        }}
      />,
    );

    expect(screen.getByText(/Preferred areas:/).parentElement).toHaveTextContent("HSR Layout · Koramangala");
  });
});
