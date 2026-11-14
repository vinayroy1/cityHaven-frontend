"use client";

/**
 * "Are you the builder? Claim this project" — shown on project pages no builder manages yet (listed from a
 * public RERA register). The builder signs in, gives their contact details and uploads proof; staff verify it
 * in /admin/project-claims and then the page moves to the builder's account with their phone and email.
 */
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck, FileUp, Loader2, X } from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/services/api/client";
import { getStoredUserContact } from "@/lib/auth/storedUser";

type Props = { projectId: number | string; projectName: string; developerName: string };

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const errMessage = (e: unknown, fallback: string): string => {
  const message = e && typeof e === "object" && "message" in e ? (e as { message: unknown }).message : null;
  return typeof message === "string" && message ? message : fallback;
};

export default function ClaimProjectCard({ projectId, projectName, developerName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ contactName: "", designation: "", phone: "", email: "", message: "" });
  const [file, setFile] = useState<File | null>(null);

  const start = () => {
    const me = getStoredUserContact();
    if (!me) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/new-projects")}`);
      return;
    }
    setForm((f) => ({ ...f, contactName: f.contactName || me.name, phone: f.phone || me.mobileNumber, email: f.email || me.email }));
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Upload your RERA certificate or another proof");
    if (!TYPES.includes(file.type)) return toast.error("Upload a PDF, JPG, PNG or WebP file");
    if (file.size > MAX_BYTES) return toast.error("File is too large (max 10 MB)");
    setBusy(true);
    try {
      const presign = await apiClient.post<{ uploadUrl: string; key: string }>(API_ENDPOINTS.projects.claimPresign(projectId), {
        fileName: file.name,
        contentType: file.type,
      });
      const slot = ((presign as { data?: { uploadUrl: string; key: string } }).data ?? presign) as unknown as { uploadUrl: string; key: string };
      const put = await fetch(slot.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("Upload failed. Please try again.");
      await apiClient.post(API_ENDPOINTS.projects.claim(projectId), { ...form, proofKey: slot.key });
      setDone(true);
      toast.success("Claim sent. We'll verify it and get back to you.");
    } catch (err) {
      toast.error(errMessage(err, "Couldn't send your claim. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Are you the builder of {projectName}?</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Claim this page to get buyer enquiries directly, show your own contact and add photos, prices and floor plans. Free.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
            >
              Claim this project
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={`Claim ${projectName}`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative flex max-h-[calc(100dvh-0.5rem)] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="py-6 text-center">
                <BadgeCheck className="mx-auto h-10 w-10 text-emerald-600" />
                <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Claim sent</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Our team will check your documents, usually within 1–2 working days. Once approved, {projectName} moves to your account and
                  enquiries reach you directly.
                </p>
                <button type="button" onClick={() => setOpen(false)} className="mt-5 w-full rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="pr-10">
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">Claim {projectName}</h3>
                  <p className="text-xs text-slate-500">Listed under {developerName}. We verify every claim before handing over the page.</p>
                </div>

                <input required className={field} placeholder="Your full name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                <input className={field} placeholder="Your role (e.g. Director, Partner, Sales head)" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                <input
                  required
                  inputMode="tel"
                  className={field}
                  placeholder="Mobile number for buyer enquiries"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input required type="email" className={field} placeholder="Email for buyer enquiries" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-600 hover:border-rose-400 dark:border-slate-700 dark:text-slate-300">
                  <FileUp className="h-5 w-5 shrink-0 text-rose-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{file ? file.name : "Upload proof"}</span>
                    <span className="text-slate-400">RERA registration certificate, company letterhead or authorisation letter (PDF or image, max 10 MB)</span>
                  </span>
                  <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>

                <textarea
                  rows={2}
                  className={field}
                  placeholder="Anything else? (other projects of yours, best time to call)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send claim for verification
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
