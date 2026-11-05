import type { Metadata } from "next";
import StayDetail from "./StayDetail";

export const metadata: Metadata = {
  title: "Stay details — rooms, nightly prices & booking | Awasio",
};

export default function StayPage() {
  return <StayDetail />;
}
