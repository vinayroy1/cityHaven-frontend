"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/app-config";
import type { ProjectListing } from "@/types/project.types";
import { useRevealProjectContactMutation } from "./api";

export type ProjectContact = { salesPhone: string; salesEmail: string };

/** True when the project has a sales contact to show (hidden in public responses, so check the flags too). */
export function projectHasContact(p: Pick<ProjectListing, "salesPhone" | "salesEmail" | "hasSalesPhone" | "hasSalesEmail">) {
  return Boolean(p.hasSalesPhone || p.hasSalesEmail || p.salesPhone || p.salesEmail);
}

/**
 * Sales desk contact behind login, like interiors and property owner contacts: logged-out visitors go to
 * /login?redirect=<this page>; logged-in ones get the number from POST /projects/:id/contact.
 */
export function useProjectContact() {
  const router = useRouter();
  const pathname = usePathname();
  const [trigger, { isLoading }] = useRevealProjectContactMutation();

  const reveal = useCallback(
    async (project: Pick<ProjectListing, "id">): Promise<ProjectContact | null> => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
      if (!token) {
        toast.info("Log in to view the builder's contact number");
        router.push(`/login?redirect=${encodeURIComponent(pathname || "/new-projects")}`);
        return null;
      }
      try {
        const data = await trigger(project.id).unwrap();
        return { salesPhone: data.salesPhone || "", salesEmail: data.salesEmail || "" };
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status !== 401) {
          toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't load the contact. Please send an enquiry instead.");
        }
        return null;
      }
    },
    [router, pathname, trigger],
  );

  return { reveal, loading: isLoading };
}
