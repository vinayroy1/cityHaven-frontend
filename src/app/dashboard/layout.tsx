import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Dashboard | Awasio" },
  // Private pages: don't inherit the root layout's homepage canonical.
  alternates: { canonical: null },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
