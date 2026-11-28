"use client";

import { Mail, MessageSquare, Phone, PhoneCall } from "lucide-react";
import { agentPath } from "@/features/advisors/paths";
import { useAutoRevealOnReturn } from "@/lib/signupRedirect";
import { toast } from "sonner";
import type { Agent } from "@/data/agents";
import { APP_CONFIG } from "@/constants/app-config";
import { openContactLink, useGatedContact } from "@/lib/hooks/useGatedContact";

type Variant = "card" | "hero" | "widget";

const CLS: Record<Variant, { call: string; mail: string; wa: string; label: boolean }> = {
  card: {
    call: "inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0 disabled:opacity-60",
    mail: "inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0 disabled:opacity-60",
    wa: "",
    label: false,
  },
  hero: {
    call: "inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 text-xs font-bold text-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition disabled:opacity-60",
    mail: "inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 text-xs font-bold text-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition disabled:opacity-60",
    wa: "inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition disabled:opacity-60",
    label: true,
  },
  widget: {
    call: "flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition disabled:opacity-60",
    mail: "flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition disabled:opacity-60",
    wa: "flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition disabled:opacity-60",
    label: true,
  },
};

type AgentWithFlags = Agent & { hasPhone?: boolean; hasEmail?: boolean };

/** Call / Email / WhatsApp for an advisor. The number comes from the login-only reveal endpoint. */
export function AgentContactButtons({ agent, variant, showWhatsapp = variant !== "card" }: { agent: AgentWithFlags; variant: Variant; showWhatsapp?: boolean }) {
  const key = agent.slug || agent.id;
  const { reveal, loading, contact } = useGatedContact(`${APP_CONFIG.API.BASE_URL}/v1/advisors/${encodeURIComponent(String(key))}/reveal-contact`, "the advisor's contact", agentPath(agent));
  const hasPhone = Boolean(agent.hasPhone || agent.phone);
  const hasEmail = Boolean(agent.hasEmail || agent.email);
  const c = CLS[variant];
  // Back from signup / login on the advisor's own page: show the number on the Call button without another tap.
  useAutoRevealOnReturn(
    async () => {
      const r = await reveal();
      if (r?.phone) toast.success(`${agent.name}: ${r.phone}`);
    },
    { onlyOnPath: agentPath(agent), enabled: variant === "hero" },
  );
  const waText = `Hi ${agent.name}, I found your profile on Awasio and would like to inquire about properties in ${agent.area}.`;

  const call = async () => {
    const r = await reveal();
    if (r?.phone) openContactLink(`tel:${r.phone.replace(/\s+/g, "")}`);
    else if (r) toast.info("No phone number on this profile. Try email or book a visit.");
  };
  const mail = async () => {
    const r = await reveal();
    if (r?.email) openContactLink(`mailto:${r.email}`);
    else if (r) toast.info("No email on this profile.");
  };
  const wa = async () => {
    const r = await reveal();
    const n = r?.whatsapp || r?.phone;
    if (n) openContactLink(`https://wa.me/${n.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`, true);
  };

  return (
    <>
      {hasPhone && (
        <button type="button" onClick={call} disabled={loading} aria-label={`Call ${agent.name}`} title="Call (login required)" className={c.call}>
          {c.label ? <PhoneCall className="h-3.5 w-3.5 text-rose-500" /> : <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
          {c.label && <span className={variant === "hero" && !contact?.phone ? "hidden xs:inline" : undefined}>{contact?.phone || "Call"}</span>}
        </button>
      )}
      {hasEmail && (
        <button type="button" onClick={mail} disabled={loading} aria-label={`Email ${agent.name}`} title="Email (login required)" className={c.mail}>
          {c.label ? <Mail className="h-3.5 w-3.5 text-blue-500" /> : <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
          {c.label && <span className={variant === "hero" && !contact?.email ? "hidden xs:inline" : undefined}>{contact?.email || "Email"}</span>}
        </button>
      )}
      {showWhatsapp && hasPhone && (
        <button type="button" onClick={wa} disabled={loading} aria-label={`WhatsApp ${agent.name}`} className={c.wa}>
          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
          <span className={variant === "hero" ? "hidden xs:inline" : undefined}>WhatsApp</span>
        </button>
      )}
    </>
  );
}
