"use client";

import React, { useState, useId, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileSignature,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Building2,
  Zap,
  Search,
  UploadCloud,
  X,
  FileCheck2,
  ShieldCheck,
  Loader2,
  Home,
  FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import {
  useGetMyDocumentsQuery,
  useGetDocumentStatsQuery,
  useGetPresignedDocUploadUrlMutation,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  type PropertyDocument,
  type DocumentType,
} from "@/features/documents/api";
import { useMyPropertiesQuery } from "@/features/propertyListing/api";
import { toast } from "sonner";

// Standard legal templates with formatted text
const STANDARD_TEMPLATES: Record<
  string,
  { title: string; category: string; description: string; content: string }
> = {
  "Society NOC request letter": {
    title: "Society NOC Request Letter",
    category: "Society Compliance",
    description: "Formal application letter to Residential Welfare Association (RWA) / Society for tenant or sale clearance.",
    content: `To,
The Secretary / President,
Resident Welfare Association (RWA) / Co-operative Housing Society,

Subject: Request for Issuance of No Objection Certificate (NOC) for Flat/Unit No. [______]

Dear Sir/Madam,

I, [Owner Name], am the bona fide and lawful owner of Flat / Unit No. [______] in [Society/Apartment Name], located at [Locality, City].

I intend to [Rent Out / Sell / Transfer] the aforementioned property. In accordance with the society bylaws, I hereby request you to kindly issue a No Objection Certificate (NOC) in my favor.

I confirm that:
1. All society maintenance charges, water charges, and statutory dues up to date have been paid in full.
2. The prospective occupant/buyer will adhere strictly to all society rules, parking norms, and security guidelines.

Enclosed herewith:
- Copy of Maintenance clearance receipt
- Identification proof copy

Kindly expedite the issuance of the NOC at your earliest convenience.

Thanking you,
Yours sincerely,

[Owner Name]
Mobile: [Contact Number]
Date: [DD/MM/YYYY]`,
  },
  "Owner possession declaration": {
    title: "Owner Possession Declaration",
    category: "Ownership Proof",
    description: "Self-declaration affidavit confirming clear possession and title ownership without encumbrance.",
    content: `AFFIDAVIT / SELF-DECLARATION OF OWNERSHIP AND CLEAR POSSESSION

I, [Owner Name], son/daughter of [Parent Name], residing at [Owner Full Address], do hereby solemnly affirm and declare as follows:

1. That I am the sole, absolute, and undisputed owner in physical and lawful possession of property bearing Address: [Complete Property Address, City, State, Pincode].
2. That the title of the said property has been acquired legally via registered Sale Deed / Gift Deed registered as Document No. [______] on date [DD/MM/YYYY] at the Office of Sub-Registrar [Location].
3. That the said property is free from all encumbrances, charges, liens, court attachments, disputes, or mortgages (except as disclosed).
4. That the property is free from municipal or local tax arrears, and utility dues are paid to date.

I make this declaration conscientiously believing the same to be true and correct in all material particulars.

Deponent / Declarant:
[Owner Full Name]
Signature: ______________________
Date: [DD/MM/YYYY]`,
  },
  "Co-living house rules": {
    title: "Co-Living & Flatmate House Rules",
    category: "House Rules",
    description: "Standard co-living charter establishing quiet hours, guest policy, chores, and cleanliness.",
    content: `CO-LIVING & FLATMATE CODE OF CONDUCT

Property: [Flat/Unit Address]

1. QUIET HOURS:
- Quiet hours observed between 11:00 PM and 7:00 AM daily.
- Volume on TVs, musical instruments, and group gatherings must be kept courteous.

2. GUEST & VISITOR POLICY:
- Day guests are welcome. Overnight guests require prior notice to co-flatmates.
- Common areas are shared spaces; guests must respect roommates' privacy and security.

3. CLEANLINESS & HYGIENE:
- Kitchen counters and sink must be cleared after cooking. No dirty dishes left overnight.
- Common areas (hall, balcony, washrooms) will follow a weekly cleaning schedule or shared maid service.

4. UTILITY & EXPENSE SHARING:
- Electricity, piped gas, Wi-Fi, and domestic help expenses shall be divided equally every month within 3 days of bill generation.

5. SAFETY & SECURITY:
- Main door must remain locked. Keys or digital access codes must not be shared with unauthorized third parties.
- Smoking/drinking restrictions must adhere to the mutual agreement.

Agreed and Accepted by Flatmates:
Name: ______________________ Signature: ______________________ Date: __________
Name: ______________________ Signature: ______________________ Date: __________`,
  },
  "Property handover checklist": {
    title: "Property Handover & Inventory Checklist",
    category: "Handover Record",
    description: "Comprehensive condition inventory of keys, fixtures, electrical fittings, and meter readings.",
    content: `PROPERTY HANDOVER & INVENTORY CHECKLIST

Property Address: [Complete Address]
Handover Date: [DD/MM/YYYY]
Landlord: [Name] | Tenant/Buyer: [Name]

1. METER READINGS AT HANDOVER:
- Electricity Meter Reading: [_______] kWh
- Piped Gas (IGL/MGL) Reading: [_______]
- Water Meter Reading (if applicable): [_______]

2. KEYS HANDED OVER:
- Main entrance keys (sets): [___]
- Bedroom / Balcony keys (sets): [___]
- Mailbox / Society gate tags: [___]

3. FIXTURES & APPLIANCES INSPECTION (Checked & Working):
[ ] Air Conditioners ([ ] nos) - Remote & cooling checked
[ ] Geysers / Water Heaters ([ ] nos) - Operational
[ ] Ceiling Fans & LED Lights ([ ] nos) - Working
[ ] Modular Kitchen Chimney / Hob - Clean & functional
[ ] Bathroom Fittings, taps, flush tanks - No leakage observed
[ ] Wall paint condition: Fresh / Normal wear

Handed over by: ______________________ (Landlord / Rep)
Received by:    ______________________ (Tenant / Buyer)
Date: [DD/MM/YYYY]`,
  },
  "Utility transfer undertaking": {
    title: "Utility Meter Transfer Undertaking",
    category: "Utility Transfer",
    description: "Undertaking for name change and transfer of electricity, gas, and water connections.",
    content: `UNDERTAKING FOR TRANSFER OF UTILITY CONNECTIONS

To,
The Assistant Engineer / Commercial Officer,
[Electricity Distribution Co. / Piped Gas Utility / Jal Board],
[City / Division Office]

Subject: No Objection and Request for Transfer of Consumer Connection No. [Consumer/CA No.]

Dear Sir/Madam,

I, [Previous Registered Consumer / Transferor Name], have sold / transferred the property located at [Full Property Address] to [Transferee / New Owner Name].

I hereby declare that:
1. I have no objection to the transfer of the said electricity/gas connection (CA No. [__________]) to the name of [New Owner Name].
2. All consumption dues and arrears up to [Date] have been cleared by me.
3. The security deposit on record may be adjusted/transferred in accordance with company norms.

Thanking you,

Transferor Signature: ______________________  Date: __________
Transferee Signature: ______________________  Date: __________`,
  },
};

const DOC_TYPE_LABELS: Record<DocumentType, { label: string; icon: any; color: string; bg: string }> = {
  OWNERSHIP_PROOF: {
    label: "Sale Deed & Title Proof",
    icon: FileSignature,
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800",
  },
  OTHER: {
    label: "Society NOC / Clearance",
    icon: Building2,
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 border-sky-200 dark:bg-sky-950/60 dark:border-sky-800",
  },
  ADDRESS_PROOF: {
    label: "Electricity & Utility Proof",
    icon: Zap,
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-800",
  },
  RENTAL_AGREEMENT: {
    label: "Registered Rental Agreement",
    icon: FileSpreadsheet,
    color: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-800",
  },
  ID_PROOF: {
    label: "Identity / PAN / Aadhaar",
    icon: ShieldCheck,
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:border-purple-800",
  },
};

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </main>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}

function DocumentsContent() {
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get("propertyId") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>("ALL");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("OWNERSHIP_PROOF");
  const [uploadPropertyId, setUploadPropertyId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    if (initialPropertyId) {
      setSelectedPropertyFilter(initialPropertyId);
      setUploadPropertyId(initialPropertyId);
    }
  }, [initialPropertyId]);

  // Template preview modal state
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(null);

  // RTK Query hooks
  const { data: documents = [], isLoading: isDocsLoading, refetch: refetchDocs } = useGetMyDocumentsQuery();
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useGetDocumentStatsQuery();
  const { data: propertiesData } = useMyPropertiesQuery();
  const [getPresignedUrl] = useGetPresignedDocUploadUrlMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const userProperties: any[] = Array.isArray(propertiesData)
    ? propertiesData
    : Array.isArray(propertiesData?.items)
    ? propertiesData.items
    : [];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    // Type filter
    if (selectedTypeFilter !== "ALL" && doc.type !== selectedTypeFilter) {
      return false;
    }
    // Property filter
    if (selectedPropertyFilter !== "ALL") {
      if (selectedPropertyFilter === "UNLINKED") {
        if (doc.propertyId != null) return false;
      } else if (String(doc.propertyId) !== selectedPropertyFilter) {
        return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (doc.meta?.title || "").toLowerCase();
      const propTitle = (doc.property?.title || "").toLowerCase();
      const docTypeLabel = (DOC_TYPE_LABELS[doc.type]?.label || "").toLowerCase();
      return title.includes(q) || propTitle.includes(q) || docTypeLabel.includes(q);
    }
    return true;
  });

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 25 MB.");
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        // Pre-fill clean title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  // Execute upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a document file to upload.");
      return;
    }
    if (!uploadTitle.trim()) {
      toast.error("Please enter a title for the document.");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Getting secure upload ticket…");

    try {
      const propIdNumber = uploadPropertyId ? Number(uploadPropertyId) : null;

      // 1. Get presigned R2 upload URL
      const presigned = await getPresignedUrl({
        fileName: selectedFile.name,
        contentType: selectedFile.type || "application/pdf",
        propertyId: propIdNumber,
      }).unwrap();

      setUploadProgress("Uploading file to encrypted storage…");

      // 2. Upload file directly to R2 via PUT
      const uploadRes = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type || "application/pdf",
        },
        body: selectedFile,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload to storage failed (${uploadRes.status})`);
      }

      setUploadProgress("Saving document record…");

      // 3. Save record in database
      await createDocument({
        title: uploadTitle.trim(),
        type: uploadType,
        fileUrl: presigned.publicUrl,
        propertyId: propIdNumber,
        meta: {
          title: uploadTitle.trim(),
          status: "REVIEWING",
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || "application/pdf",
          storageKey: presigned.key,
        },
      }).unwrap();

      toast.success("Document uploaded securely!");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadTitle("");
      setUploadPropertyId("");
      refetchDocs();
      refetchStats();
    } catch (err: any) {
      console.error("[Upload] Failed:", err);
      toast.error(err?.data?.message || err?.message || "Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  // Handle document delete
  const handleDeleteDoc = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteDocument(id).unwrap();
      toast.success("Document deleted.");
      refetchDocs();
      refetchStats();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete document.");
    }
  };

  // Download template text
  const handleDownloadTemplate = (templateKey: string) => {
    const t = STANDARD_TEMPLATES[templateKey];
    if (!t) return;
    const blob = new Blob([t.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${t.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${t.title}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* Page Header */}
        <PageHeader
          tag="Documents"
          title="Property Documents & Proofs"
          subtitle="Securely organize property title deeds, society NOCs, utility bills, and verification records."
          backHref="/dashboard"
          actions={
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:bg-rose-600 hover:-translate-y-0.5 dark:bg-rose-600 dark:hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" />
              <span>Upload document</span>
            </button>
          }
        />

        {/* Live Metrics / Summary Bar */}
        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Total documents"
              value={isStatsLoading ? "…" : String(stats?.totalDocuments ?? documents.length)}
              hint={`${stats?.linkedPropertiesCount ?? 0} properties linked`}
              tone="rose"
            />
            <StatPill
              label="Ownership Proofs"
              value={isStatsLoading ? "…" : String(stats?.ownershipProofs ?? 0)}
              hint="Title & Sale Deeds"
              tone="emerald"
            />
            <StatPill
              label="Verified Proofs"
              value={isStatsLoading ? "…" : String(stats?.verifiedProofs ?? 0)}
              hint="Checked & Verified"
              tone="slate"
            />
            <StatPill
              label="In Review"
              value={isStatsLoading ? "…" : String(stats?.inReview ?? 0)}
              hint="Pending Verification"
              tone="amber"
            />
          </div>
        </SectionCard>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by title, property, or type…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Property Dropdown */}
            {userProperties.length > 0 && (
              <select
                value={selectedPropertyFilter}
                onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Properties</option>
                {userProperties.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.title?.slice(0, 28) || `Property #${p.id}`}
                  </option>
                ))}
                <option value="UNLINKED">General / Unlinked</option>
              </select>
            )}

            {/* Filter by Document Type Dropdown */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Document Types</option>
              <option value="OWNERSHIP_PROOF">Ownership & Sale Deed</option>
              <option value="OTHER">Society NOC / Clearance</option>
              <option value="ADDRESS_PROOF">Electricity & Utility Proof</option>
              <option value="RENTAL_AGREEMENT">Rental Agreement</option>
              <option value="ID_PROOF">Identity / Aadhaar / PAN</option>
            </select>
          </div>
        </div>

        {/* Recent Documents Section */}
        <SectionCard
          title="Uploaded Documents & Records"
          subtitle="Your encrypted property title records, deeds, and statutory verification status."
        >
          {isDocsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-rose-500 mb-2" />
              <p className="text-xs font-semibold">Loading documents…</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-3">
                <FileSignature className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {searchQuery || selectedTypeFilter !== "ALL" || selectedPropertyFilter !== "ALL"
                  ? "No matching documents found"
                  : "No documents uploaded yet"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {searchQuery || selectedTypeFilter !== "ALL"
                  ? "Try resetting your search or filter options to see all records."
                  : "Upload property title deeds, electricity bills, or society NOCs to boost listing verification and credibility."}
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              >
                <Plus className="h-3.5 w-3.5" /> Upload First Document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((item) => {
                const typeCfg = DOC_TYPE_LABELS[item.type] || DOC_TYPE_LABELS.OTHER;
                const IconComponent = typeCfg.icon;
                const title = item.meta?.title || "Untitled Document";
                const isVerified = (item.meta?.status || "").toUpperCase() === "VERIFIED";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${typeCfg.bg} ${typeCfg.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {title}
                          </p>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="h-2.5 w-2.5" /> Reviewing
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                          <span className={`rounded-full border px-2.5 py-0.5 ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.label}
                          </span>

                          {item.property && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <Home className="h-3 w-3 text-slate-500" />
                              {item.property.title}
                              {item.property.cityName ? ` • ${item.property.cityName}` : ""}
                            </span>
                          )}

                          <span className="text-slate-400">
                            Added {formatDate(item.createdAt)}
                          </span>

                          {item.meta?.fileSize ? (
                            <span className="text-slate-400">
                              ({formatFileSize(item.meta.fileSize)})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                        <span>View / Download</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(item.id, title)}
                        disabled={isDeleting}
                        title="Delete document"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Checklists & Standard Templates */}
        <SectionCard
          title="Checklists & Standard Templates"
          subtitle="Legal property formats ready to preview, pre-fill, and download."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(STANDARD_TEMPLATES).map(([key, t]) => (
              <div
                key={key}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <FileText className="h-3.5 w-3.5" />
                      {t.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">2 min</span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {t.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {t.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTemplateKey(key)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    Preview Template
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate(key)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Security & Encrypted Storage Info */}
        <SectionCard
          title="Security & Encrypted Storage"
          subtitle="Enterprise-grade Cloudflare R2 object storage with tamper-resistant verification."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                <span>Encrypted & Safe</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                All uploaded title documents, society NOCs, and electricity receipts are encrypted using AES-256 with secure private presigned URLs.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                <span>Renewal & Audit Reminders</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Keep documentation audit-ready for prospective buyers, bank loan approvals, and tenant police verifications with timestamps.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => {
                if (!isUploading) setIsUploadOpen(false);
              }}
              disabled={isUploading}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <UploadCloud className="h-4 w-4" />
                <span>Document Vault</span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                Upload Property Proof or Document
              </h3>
              <p className="text-xs text-slate-500">
                Attach sale deeds, utility bills, or society NOCs to your account and properties.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sale Deed - Green View 3BHK"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Document Category / Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="OWNERSHIP_PROOF">Ownership & Sale Deed</option>
                    <option value="OTHER">Society NOC / Clearance</option>
                    <option value="ADDRESS_PROOF">Electricity & Utility Proof</option>
                    <option value="RENTAL_AGREEMENT">Rental Agreement</option>
                    <option value="ID_PROOF">Identity / Aadhaar / PAN</option>
                  </select>
                </div>

                {/* Property Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link to Property
                  </label>
                  <select
                    value={uploadPropertyId}
                    onChange={(e) => setUploadPropertyId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">General (Not linked)</option>
                    {userProperties.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.title?.slice(0, 24) || `Property #${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload File <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                    selectedFile
                      ? "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-slate-200 hover:border-rose-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileCheck2 className="h-8 w-8 text-emerald-600 mb-1.5" />
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatFileSize(selectedFile.size)} • Click to change file
                      </p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-slate-400 mb-1.5" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Click to select or drag document here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports PDF, PNG, JPG up to 25 MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Progress State */}
              {isUploading && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>{uploadProgress || "Uploading document…"}</span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" /> Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE PREVIEW MODAL */}
      {activeTemplateKey && STANDARD_TEMPLATES[activeTemplateKey] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveTemplateKey(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {STANDARD_TEMPLATES[activeTemplateKey].category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {STANDARD_TEMPLATES[activeTemplateKey].title}
              </h3>
              <p className="text-xs text-slate-500">
                {STANDARD_TEMPLATES[activeTemplateKey].description}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 selection:bg-rose-200">
              {STANDARD_TEMPLATES[activeTemplateKey].content}
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(STANDARD_TEMPLATES[activeTemplateKey].content);
                  toast.success("Template text copied to clipboard!");
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Copy Text
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTemplateKey(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(activeTemplateKey)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  <Download className="h-3.5 w-3.5" /> Download (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
