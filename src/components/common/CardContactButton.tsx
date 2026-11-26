"use client";

import React from "react";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { loginUrlForCurrentPage } from "@/lib/auth/loginRedirect";
import { useRevealConstructionContactMutation } from "@/features/construction/api";
import { useRevealArchitectContactMutation } from "@/features/architect/api";
import { useRevealPanditContactMutation } from "@/features/pandit/api";

type Kind = "construction" | "architect" | "pandit";

const HOOKS = {
  construction: useRevealConstructionContactMutation,
  architect: useRevealArchitectContactMutation,
  pandit: useRevealPanditContactMutation,
} as const;

const telHref = (phone: string) => `tel:+91${phone.replace(/\D/g, "").slice(-10)}`;

/**
 * "View contact" for directory cards. Same gated flow as the profile page: logged-out visitors go to
 * login and come back; signed-in visitors get the number (the reveal call logs the lead), then tap to call.
 */
export function CardContactButton({ kind, profileId, className }: { kind: Kind; profileId: number; className: string }) {
  const [reveal, { isLoading }] = HOOKS[kind]();
  const [phone, setPhone] = React.useState<string | null>(null);

  const onClick = async () => {
    if (!getStoredUserContact()) {
      window.location.href = loginUrlForCurrentPage();
      return;
    }
    try {
      const c = await reveal(profileId).unwrap();
      if (c?.phone) setPhone(c.phone);
      else toast.error("This listing hasn't added a number yet. Send an enquiry instead.");
    } catch (e) {
      toast.error((e as { data?: { message?: string } })?.data?.message || "Couldn't load the number. Send an enquiry instead.");
    }
  };

  return phone ? (
    <a href={telHref(phone)} className={`${className} gap-1.5`} aria-label={`Call ${phone}`}>
      <Phone className="h-4 w-4" aria-hidden /> {phone}
    </a>
  ) : (
    <button type="button" onClick={onClick} disabled={isLoading} className={`${className} gap-1.5 disabled:opacity-60`}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Phone className="h-4 w-4" aria-hidden />} View contact
    </button>
  );
}
