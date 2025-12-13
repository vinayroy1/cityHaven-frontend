"use client";

import React, { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/services/api/client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { Toaster } from "@/components/ui/sonner";

export const ContactForm: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [consentToContact, setConsentToContact] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const hasContact = email.trim() !== "" || phone.trim() !== "";
    return fullName.trim() !== "" && message.trim().length >= 5 && hasContact && consentToContact && !submitting;
  }, [consentToContact, email, fullName, message, phone, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.contact.submit, {
        fullName: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        reason,
        message: message.trim(),
        consentToContact,
      });
      toast.success("Thanks! We received your message and will respond soon.");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit your request right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toaster richColors position="top-center" />
      <h2 className="text-lg font-semibold text-slate-900">Send us a note</h2>
      <p className="text-sm text-slate-700">Share your details and we&apos;ll respond within a business day.</p>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold text-slate-800">Full name</label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            placeholder="Priya Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-800">Email</label>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Mobile</label>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">Reason</label>
          <select
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="GENERAL">General</option>
            <option value="PROPERTY_QUERY">Property query</option>
            <option value="OWNER_ONBOARDING">Owner onboarding</option>
            <option value="TENANT_SUPPORT">Tenant support</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="FEEDBACK">Feedback</option>
            <option value="BUG_REPORT">Bug report</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">How can we help?</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            rows={4}
            placeholder="Share booking id, property link, or your question."
            minLength={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={consentToContact}
            onChange={(e) => setConsentToContact(e.target.checked)}
          />
          I agree to be contacted
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 disabled:bg-slate-500 disabled:opacity-80"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
};
