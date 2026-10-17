"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudCheck,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { compressImageWithStats } from "@/lib/utils/imageCompression";
import { useGetProjectMediaUploadUrlMutation } from "@/features/projects/api";

export interface UploadedImageItem {
  id: string;
  url: string;
  name: string;
  size: number;
  originalSize?: number;
  savedPercentage?: number;
  uploading?: boolean;
  uploadedToR2?: boolean;
  uploadError?: boolean;
}

export interface UploadedBrochure {
  name: string;
  size: number;
  url: string;
  type: string;
  uploading?: boolean;
  uploadedToR2?: boolean;
  uploadError?: boolean;
}

interface ProjectMediaUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  brochureUrl?: string;
  onBrochureChange: (brochure: UploadedBrochure | null) => void;
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ProjectMediaUpload({
  images,
  onImagesChange,
  brochureUrl,
  onBrochureChange,
}: ProjectMediaUploadProps) {
  const [getPresignedUploadUrl] = useGetProjectMediaUploadUrlMutation();

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number } | null>(null);

  // Stored raw blobs for retry if upload fails
  const pendingBlobsRef = useRef<Map<string, { blob: Blob; fileName: string }>>(new Map());
  const pendingBrochureRef = useRef<File | null>(null);

  // Detailed items state for tracking Cloudflare R2 upload status per image
  const [imageItems, setImageItems] = useState<UploadedImageItem[]>(() => {
    return images.map((url, idx) => ({
      id: `img-${idx}-${Date.now()}`,
      url,
      name: `Project Image ${idx + 1}`,
      size: 350000,
      uploadedToR2: url.startsWith("http") && !url.startsWith("data:"),
    }));
  });

  const [brochureFile, setBrochureFile] = useState<UploadedBrochure | null>(
    brochureUrl
      ? {
          name: "Project_Master_Brochure.pdf",
          size: 2400000,
          url: brochureUrl,
          type: "application/pdf",
          uploadedToR2: brochureUrl.startsWith("http") && !brochureUrl.startsWith("data:"),
        }
      : null
  );
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const [isDragOverImages, setIsDragOverImages] = useState(false);
  const [isDragOverBrochure, setIsDragOverBrochure] = useState(false);

  // Cloudflare R2 Upload helper for image blobs
  const uploadImageToR2 = useCallback(
    async (fileBlob: Blob, localId: string, fileName: string) => {
      try {
        const presigned = await getPresignedUploadUrl({
          fileName,
          contentType: "image/webp",
          subFolder: "photos",
        }).unwrap();

        const uploadRes = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/webp",
          },
          body: fileBlob,
        });

        if (uploadRes.ok && presigned.publicUrl) {
          pendingBlobsRef.current.delete(localId);
          setImageItems((prev) => {
            const next = prev.map((item) =>
              item.id === localId
                ? {
                    ...item,
                    url: presigned.publicUrl,
                    uploading: false,
                    uploadedToR2: true,
                    uploadError: false,
                  }
                : item
            );
            // Only sync durable Cloudflare CDN URLs to parent form
            const validUrls = next
              .filter((item) => item.uploadedToR2 && item.url.startsWith("http") && !item.url.startsWith("data:"))
              .map((item) => item.url);
            onImagesChange(validUrls);
            return next;
          });
        } else {
          setImageItems((prev) =>
            prev.map((item) =>
              item.id === localId ? { ...item, uploading: false, uploadedToR2: false, uploadError: true } : item
            )
          );
          toast.error(`Upload failed for ${fileName}. Click retry to try again.`);
        }
      } catch (err) {
        setImageItems((prev) =>
          prev.map((item) =>
            item.id === localId ? { ...item, uploading: false, uploadedToR2: false, uploadError: true } : item
          )
        );
        toast.error(`Upload error for ${fileName}. Click retry to try again.`);
      }
    },
    [getPresignedUploadUrl, onImagesChange]
  );

  const retryImageUpload = useCallback(
    (localId: string) => {
      const pending = pendingBlobsRef.current.get(localId);
      if (!pending) {
        toast.error("Original photo data expired. Please re-select the image.");
        return;
      }
      setImageItems((prev) =>
        prev.map((item) => (item.id === localId ? { ...item, uploading: true, uploadError: false } : item))
      );
      uploadImageToR2(pending.blob, localId, pending.fileName);
    },
    [uploadImageToR2]
  );

  // Cloudflare R2 Upload helper for PDF brochure
  const uploadBrochureToR2 = useCallback(
    async (file: File, localDataUrl: string) => {
      setIsUploadingBrochure(true);
      pendingBrochureRef.current = file;
      try {
        const presigned = await getPresignedUploadUrl({
          fileName: file.name,
          contentType: file.type || "application/pdf",
          subFolder: "brochures",
        }).unwrap();

        const uploadRes = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/pdf",
          },
          body: file,
        });

        if (uploadRes.ok && presigned.publicUrl) {
          pendingBrochureRef.current = null;
          const uploaded: UploadedBrochure = {
            name: file.name,
            size: file.size,
            url: presigned.publicUrl,
            type: file.type || "application/pdf",
            uploading: false,
            uploadedToR2: true,
            uploadError: false,
          };
          setBrochureFile(uploaded);
          onBrochureChange(uploaded);
          toast.success("Brochure successfully uploaded to Cloudflare R2 CDN!");
        } else {
          const failed: UploadedBrochure = {
            name: file.name,
            size: file.size,
            url: localDataUrl,
            type: file.type || "application/pdf",
            uploading: false,
            uploadedToR2: false,
            uploadError: true,
          };
          setBrochureFile(failed);
          onBrochureChange(null);
          toast.error("Failed to upload brochure to CDN. Click retry to try again.");
        }
      } catch (err) {
        const failed: UploadedBrochure = {
          name: file.name,
          size: file.size,
          url: localDataUrl,
          type: file.type || "application/pdf",
          uploading: false,
          uploadedToR2: false,
          uploadError: true,
        };
        setBrochureFile(failed);
        onBrochureChange(null);
        toast.error("Failed to upload brochure to CDN. Click retry to try again.");
      } finally {
        setIsUploadingBrochure(false);
      }
    },
    [getPresignedUploadUrl, onBrochureChange]
  );

  const retryBrochureUpload = useCallback(() => {
    const file = pendingBrochureRef.current;
    if (!file) {
      toast.error("Brochure file expired. Please re-select the PDF.");
      return;
    }
    uploadBrochureToR2(file, brochureFile?.url || "");
  }, [brochureFile, uploadBrochureToR2]);

  // Process & compress images, then upload each to Cloudflare R2
  const processImageFiles = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (rawFiles.length === 0) {
      toast.error("Please upload valid image files (JPG, PNG, WEBP)");
      return;
    }

    setIsCompressing(true);
    setCompressProgress({ current: 0, total: rawFiles.length });

    const newItems: UploadedImageItem[] = [];
    const filesToUpload: Array<{ blob: Blob; localId: string; name: string }> = [];

    try {
      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];
        setCompressProgress({ current: i + 1, total: rawFiles.length });

        const localId = `img-${Date.now()}-${i}`;

        try {
          // Hardware-accelerated Lanczos + WebP compression (identical to property listing flow)
          const compression = await compressImageWithStats(file, {
            maxDimension: 1920,
            quality: 0.82,
          });

          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compression.file);
          });

          newItems.push({
            id: localId,
            url: dataUrl,
            name: file.name,
            size: compression.compressedSize,
            originalSize: compression.originalSize,
            savedPercentage: compression.savedPercentage,
            uploading: true,
          });

          filesToUpload.push({
            blob: compression.file,
            localId,
            name: file.name.replace(/\.[^.]+$/, ".webp"),
          });
        } catch {
          // Fallback if compression fails
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newItems.push({
            id: localId,
            url: dataUrl,
            name: file.name,
            size: file.size,
            uploading: true,
          });

          filesToUpload.push({
            blob: file,
            localId,
            name: file.name,
          });
        }
      }

      const updated = [...imageItems, ...newItems];
      setImageItems(updated);
      onImagesChange(updated.map((item) => item.url));
      toast.success(
        `Optimized ${newItems.length} image(s) with Lanczos + WebP. Uploading to Cloudflare R2...`
      );
    } catch {
      toast.error("Could not process images. Please try again.");
    } finally {
      setIsCompressing(false);
      setCompressProgress(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }

    // Trigger Cloudflare R2 presigned uploads concurrently
    filesToUpload.forEach((item) => {
      uploadImageToR2(item.blob, item.localId, item.name);
    });
  };

  const removeImage = (indexToRemove: number) => {
    const updated = imageItems.filter((_, idx) => idx !== indexToRemove);
    setImageItems(updated);
    onImagesChange(updated.map((item) => item.url));
  };

  const makeCoverImage = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    const promoted = imageItems[indexToPromote];
    const remaining = imageItems.filter((_, idx) => idx !== indexToPromote);
    const updated = [promoted, ...remaining];
    setImageItems(updated);
    onImagesChange(updated.map((item) => item.url));
    toast.success("Cover image updated");
  };

  // Handle brochure upload with Cloudflare R2 presigning
  const processBrochureFile = async (file: File) => {
    const isPdfOrDoc =
      file.type.includes("pdf") ||
      file.type.includes("document") ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".docx");

    if (!isPdfOrDoc) {
      toast.error("Please upload a PDF or Word Document (.pdf, .doc, .docx)");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const initialBrochure: UploadedBrochure = {
        name: file.name,
        size: file.size,
        url: dataUrl,
        type: file.type || "application/pdf",
        uploading: true,
        uploadedToR2: false,
      };

      setBrochureFile(initialBrochure);
      onBrochureChange(initialBrochure);

      // Upload directly to Cloudflare R2
      await uploadBrochureToR2(file, dataUrl);
    } catch {
      toast.error("Failed to read brochure file");
    } finally {
      if (brochureInputRef.current) brochureInputRef.current.value = "";
    }
  };

  const removeBrochure = () => {
    setBrochureFile(null);
    onBrochureChange(null);
    if (brochureInputRef.current) brochureInputRef.current.value = "";
    toast.info("Brochure removed");
  };

  return (
    <div className="space-y-6">
      {/* 1. PROJECT PHOTOS & RENDERS UPLOAD */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Project Photos, Renders &amp; Elevation *
              </label>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>Cloudflare R2 + WebP Compression</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              High-resolution elevations, master layouts &amp; clubhouse renders. Photos are compressed client-side and saved to Cloudflare R2 CDN.
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {imageItems.length} Image{imageItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Drag & Drop Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverImages(true);
          }}
          onDragLeave={() => setIsDragOverImages(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverImages(false);
            if (e.dataTransfer.files?.length) {
              processImageFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => imageInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
            isDragOverImages
              ? "border-rose-500 bg-rose-50/60 dark:border-rose-400 dark:bg-rose-950/30"
              : "border-slate-300 bg-slate-50/80 hover:border-rose-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-rose-500"
          }`}
        >
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                processImageFiles(e.target.files);
              }
            }}
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 group-hover:scale-105 transition-transform dark:bg-slate-800 dark:ring-slate-700">
            {isCompressing ? (
              <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            ) : (
              <UploadCloud className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            )}
          </div>

          <div className="mt-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isCompressing
                ? `Optimizing photo ${compressProgress?.current} of ${compressProgress?.total}...`
                : "Click to upload project photos"}
            </span>{" "}
            <span className="text-slate-400">or drag and drop</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Hardware-accelerated Lanczos downsampling + WebP compression uploaded directly to Cloudflare R2
          </p>
        </div>

        {/* Uploaded Images Thumbnails Grid */}
        {imageItems.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageItems.map((item, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={item.id}
                  className="group relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-2xs"
                >
                  <img
                    src={item.url}
                    alt={`Project upload ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Cloudflare Upload Status / Cover Badge */}
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                    {isCover ? (
                      <div className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        <span>Primary Cover</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          makeCoverImage(idx);
                        }}
                        className="hidden group-hover:inline-flex items-center gap-1 rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm hover:bg-rose-600 transition"
                      >
                        <span>Set as Cover</span>
                      </button>
                    )}

                    {item.uploading ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        <span>R2 Uploading</span>
                      </span>
                    ) : item.uploadedToR2 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        <CloudCheck className="h-2.5 w-2.5" />
                        <span>Cloudflare R2</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-90 hover:bg-rose-600 hover:opacity-100 transition shadow-sm"
                    title="Remove Image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  {/* Bottom Stats Badge */}
                  <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[9px] font-semibold text-white/95 drop-shadow-md">
                    <span>
                      {item.savedPercentage ? `Saved ${item.savedPercentage}%` : formatFileSize(item.size)}
                    </span>
                    <span>#{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PROJECT BROCHURE FILE UPLOAD */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Project Digital Brochure (PDF / Document)
              </label>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/60">
                <CloudCheck className="h-3 w-3 text-indigo-600" />
                <span>Cloudflare R2 Stored</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official sales brochure, master layout plans, and configurations. Uploads securely to Cloudflare R2 bucket.
            </p>
          </div>
        </div>

        {brochureFile ? (
          /* Uploaded Brochure File Card */
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                {isUploadingBrochure ? (
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
                ) : (
                  <FileCheck2 className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {brochureFile.name}
                  </h4>
                  {isUploadingBrochure ? (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/70 dark:text-amber-200">
                      Uploading to R2...
                    </span>
                  ) : brochureFile.uploadedToR2 ? (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200 flex items-center gap-1">
                      <CloudCheck className="h-3 w-3" /> Cloudflare R2 Active
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200">
                      PDF Attached
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(brochureFile.size)}</span>
                  {brochureFile.url && (
                    <a
                      href={brochureFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Preview Brochure ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => brochureInputRef.current?.click()}
                disabled={isUploadingBrochure}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={removeBrochure}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                title="Remove brochure"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty Brochure Upload Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverBrochure(true);
            }}
            onDragLeave={() => setIsDragOverBrochure(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverBrochure(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processBrochureFile(file);
            }}
            onClick={() => brochureInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
              isDragOverBrochure
                ? "border-rose-500 bg-rose-50/60 dark:border-rose-400 dark:bg-rose-950/30"
                : "border-slate-300 bg-slate-50/80 hover:border-rose-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-rose-500"
            }`}
          >
            <input
              ref={brochureInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processBrochureFile(file);
              }}
            />

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 group-hover:scale-105 transition-transform dark:bg-slate-800 dark:ring-slate-700">
              <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>

            <div className="mt-2.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Click to upload PDF brochure
              </span>{" "}
              <span className="text-slate-400">or drag and drop</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              PDF or DOC file up to 25MB (Transferred directly to Cloudflare R2)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
