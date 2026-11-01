"use client";

import { useRef, useState } from "react";
import { BadgeCheck, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { CredentialDocType, CredentialDocument, InteriorWizardValues } from "@/types/interior.types";
import { useDeleteInteriorDocumentMutation, useUploadInteriorDocumentMutation } from "@/features/interiors/api";
import { CREDENTIAL_DOC_TYPES } from "@/features/interiors/wizard/options";
import { cn } from "@/lib/utils";
import { StatusBadge, apiErrorMessage, getAt, ghostIconBtn, inputCls, propPath, setPath, useUploader } from "./ui";

const STATUS = {
  PENDING: { label: "Under review", tone: "amber" },
  VERIFIED: { label: "Verified", tone: "green" },
  REJECTED: { label: "Rejected", tone: "rose" },
} as const;

/** Credential docs filtered by provider type. "Verified" is a status shown after review, never a blocker. */
export default function DocumentUploader({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "team.credentials");
  const docs = getAt<CredentialDocument[]>(values, path) ?? [];
  const providerType = values.identity?.providerType || "INDIVIDUAL";
  const types = CREDENTIAL_DOC_TYPES.filter((t) => t.for.includes(providerType as "INDIVIDUAL" | "COMPANY"));
  const [type, setType] = useState<CredentialDocType>(types[0]?.value ?? "OTHER");
  const [number, setNumber] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUploader("docs");
  const [saveDoc, { isLoading: saving }] = useUploadInteriorDocumentMutation();
  const [deleteDoc] = useDeleteInteriorDocumentMutation();
  const busy = uploading || saving;

  const onFile = async (f: File) => {
    const url = await upload(f);
    if (!url) return;
    try {
      const doc = await saveDoc({ type, fileUrl: url, number: number.trim() || undefined }).unwrap();
      setPath(form, path, [...docs.filter((d) => d.id !== String(doc.id)), { ...doc, id: String(doc.id) }]);
      setNumber("");
      toast.success("Document uploaded — we'll verify it within 48 hours");
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not save the document"));
    }
  };

  const remove = async (d: CredentialDocument) => {
    try {
      await deleteDoc(d.id).unwrap();
      setPath(form, path, docs.filter((x) => x.id !== d.id));
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not remove document"));
    }
  };

  const label = (t: CredentialDocType) => CREDENTIAL_DOC_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="space-y-4">
      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((d) => {
            const st = STATUS[d.status] ?? STATUS.PENDING;
            return (
              <li key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <FileText className="size-5 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium underline-offset-4 hover:underline">{label(d.type)}</a>
                  {d.number && <p className="text-xs text-slate-500">{d.number}</p>}
                  {d.status === "REJECTED" && d.rejectionReason && <p className="text-xs text-rose-600">{d.rejectionReason}</p>}
                </div>
                <StatusBadge tone={st.tone}>{d.status === "VERIFIED" && <BadgeCheck className="size-3" />} {st.label}</StatusBadge>
                {d.status !== "VERIFIED" && (
                  <button type="button" aria-label={`Remove ${label(d.type)}`} className={ghostIconBtn} onClick={() => remove(d)}><Trash2 className="size-4" /></button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-3 rounded-2xl border-2 border-dashed border-slate-300 p-4 dark:border-slate-700">
        <div role="radiogroup" aria-label="Document type" className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={type === t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition",
                type === t.value ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 hover:border-slate-400 dark:border-slate-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input aria-label="Document number (optional)" className={inputCls} placeholder="Document number (optional)" value={number} onChange={(e) => setNumber(e.target.value.toUpperCase())} />
          <input ref={ref} type="file" accept="image/*,application/pdf" className="sr-only" aria-label="Choose document" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onFile(f); }} />
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload PDF or photo
          </button>
        </div>
        <p className="text-xs text-slate-500">Private — only our review team sees these. You can publish before verification; a “Verified” badge appears once checked.</p>
      </div>
    </div>
  );
}
