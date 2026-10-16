import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { FlatmateCard } from "@/components/flatmates/FlatmateCard";
import type { FlatmateListing } from "@/types/flatmate.types";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock api hook
jest.mock("@/features/flatmates/api", () => ({
  useExpressFlatmateInterestMutation: () => [jest.fn(), { isLoading: false }],
}));

describe("FlatmateCard", () => {
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
});
