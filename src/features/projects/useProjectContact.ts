"use client";

import { useCallback } from "react";
import { signupRedirectPath } from "@/lib/signupRedirect";
import { projectDetailPath } from "@/app/new-projects/lib/projectUrls";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/app-config";
import type { ProjectListing } from "@/types/project.types";
import { useRevealProjectContactMutation } from "./api";

/** salesPhone = primary; salesPhones = extra numbers (site office, NRI desk, ...). One email. */
export type ProjectContact = { salesPhone: string; salesPhones: string[]; salesEmail: string };

/** Primary first, then the extras. */
export function allSalesPhones(c: { salesPhone?: string | null; salesPhones?: string[] | null } | null | undefined): string[] {
  if (!c) return [];
  return [c.salesPhone || "", ...(c.salesPhones || [])].filter(Boolean);
}

/** True when the project has a sales contact to show (hidden in public responses, so check the flags too). */
export function projectHasContact(p: Pick<ProjectListing, "salesPhone" | "salesEmail" | "hasSalesPhone" | "hasSalesEmail">) {
  return Boolean(p.hasSalesPhone || p.hasSalesEmail || p.salesPhone || p.salesEmail);
}

/**
 * Sales desk contact behind login, like interiors and property owner contacts: logged-out visitors go to
 * signup (signupRedirectPath, which links to login); logged-in ones get the number from POST /projects/:id/contact.
 */
export function useProjectContact() {
  const router = useRouter();
  const pathname = usePathname();
  const [trigger, { isLoading }] = useRevealProjectContactMutation();

  const reveal = useCallback(
    async (project: Pick<ProjectListing, "id" | "slug" | "countryCode">): Promise<ProjectContact | null> => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
      if (!token) {
        toast.info("Sign up free to view the builder's contact number");
        // Back to this project, not the list it was opened from.
        router.push(
          project.slug
            ? signupRedirectPath(projectDetailPath(project), { autoReveal: true })
            : signupRedirectPath(pathname || "/new-projects"),
        );
        return null;
      }
      try {
        const data = await trigger(project.id).unwrap();
        return { salesPhone: data.salesPhone || "", salesPhones: data.salesPhones || [], salesEmail: data.salesEmail || "" };
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status !== 401) {
          toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't load the contact. Please try again.");
        }
        return null;
      }
    },
    [router, pathname, trigger],
  );

  return { reveal, loading: isLoading };
}
