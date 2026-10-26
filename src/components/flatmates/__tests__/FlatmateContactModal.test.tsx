import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlatmateContactModal } from "@/components/flatmates/FlatmateContactModal";
import type { FlatmateListing } from "@/types/flatmate.types";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const mockUnlockContact = jest.fn();
let mockUnlockedData: any = { data: { success: true, unlocked: false } };
let mockBillingData: any = { data: { credits: 25 } };

jest.mock("@/features/flatmates/api", () => ({
  useUnlockFlatmateContactMutation: () => [mockUnlockContact, { isLoading: false }],
  useGetUnlockedFlatmateContactQuery: () => ({ data: mockUnlockedData, isLoading: false }),
}));

jest.mock("@/features/contactVerify/api", () => ({
  useGetBillingSummaryQuery: () => ({ data: mockBillingData, isLoading: false, refetch: jest.fn() }),
}));

const mockListing: FlatmateListing = {
  id: 1,
  slug: "test-flatmate-slug",
  profileId: 10,
  mode: "HAVE_ROOM",
  status: "ACTIVE",
  title: "Spacious Room in Koramangala",
  cityName: "Bengaluru",
  locality: "Koramangala 4th Block",
  preferredLocalities: [],
  bhk: 2,
  roomType: "Private Room",
  furnishing: "Furnished",
  rent: 15000,
  deposit: 30000,
  minimumStayMonths: 6,
  currentOccupants: 1,
  spotsAvailable: 1,
  amenities: ["WiFi"],
  photos: [],
  countryCode: "IN",
  createdAt: "2026-10-16T12:00:00Z",
  updatedAt: "2026-10-16T12:00:00Z",
  profile: {
    displayName: "Vinay Kumar",
    occupation: "Tech Lead",
    isIdentityVerified: true,
  },
};

describe("FlatmateContactModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockUnlockedData = { data: { success: true, unlocked: false } };
    mockBillingData = { data: { credits: 25 } };
  });

  it("does not render when isOpen is false", () => {
    const { queryByText } = render(
      <FlatmateContactModal
        listing={mockListing}
        isOpen={false}
        onClose={jest.fn()}
      />
    );
    expect(queryByText("Unlock Direct Contact")).not.toBeInTheDocument();
  });

  it("renders sign in prompt when user is not logged in", () => {
    render(
      <FlatmateContactModal
        listing={mockListing}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText("Sign In Required to View Contact")).toBeInTheDocument();
    expect(screen.getByText("Sign In to View")).toBeInTheDocument();
  });

  it("renders credit unlock option when user is logged in with sufficient balance", () => {
    window.localStorage.setItem("awasio_access_token", "test-token");

    render(
      <FlatmateContactModal
        listing={mockListing}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText("Unlock Direct Contact")).toBeInTheDocument();
    expect(screen.getByText("Your Credit Balance:")).toBeInTheDocument();
    expect(screen.getByText("25 Credits")).toBeInTheDocument();
    expect(screen.getByText("Unlock (5 Credits)")).toBeInTheDocument();
  });

  it("renders verified contact details when contact is already unlocked", () => {
    window.localStorage.setItem("awasio_access_token", "test-token");
    mockUnlockedData = {
      data: {
        success: true,
        unlocked: true,
        name: "Vinay Kumar",
        mobileNumber: "9876543210",
        email: "vinay@example.com",
      },
    };

    render(
      <FlatmateContactModal
        listing={mockListing}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText("Verified Contact Details")).toBeInTheDocument();
    expect(screen.getByText(/9876543210/)).toBeInTheDocument();
    expect(screen.getByText("vinay@example.com")).toBeInTheDocument();
    expect(screen.getByText("Call Now")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  });
});
