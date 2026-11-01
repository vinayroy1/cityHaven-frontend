"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import { compressImage } from "@/lib/utils/imageCompression";

export type UploadOptions = { category?: string; subFolder?: string; entityId?: number | string };
/** Uploads one file and resolves with its public URL. */
export type Uploader = (file: File, opts?: UploadOptions) => Promise<string>;

const UploadCtx = createContext<Uploader | null>(null);

/** Inject any uploader (tests, storybook, other storage). */
export function UploadProvider({ upload, children }: { upload: Uploader; children: React.ReactNode }) {
  return <UploadCtx.Provider value={upload}>{children}</UploadCtx.Provider>;
}

/** Default uploader: compress images, presign via the API, PUT to storage. */
export function PresignUploadProvider({ children }: { children: React.ReactNode }) {
  const [presign] = useGetPresignedUploadUrlMutation();
  const upload = useCallback<Uploader>(
    async (raw, opts = {}) => {
      const file = raw.type.startsWith("image/") ? await compressImage(raw).catch(() => raw) : raw;
      const res = await presign({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        category: opts.category,
        subFolder: opts.subFolder,
        entityId: opts.entityId,
      }).unwrap();
      const put = await fetch(res.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed. Please try again.");
      return res.publicUrl;
    },
    [presign],
  );
  return <UploadCtx.Provider value={upload}>{children}</UploadCtx.Provider>;
}

export function useUploader(): Uploader {
  const ctx = useContext(UploadCtx);
  return useMemo(
    () =>
      ctx ??
      (async () => {
        throw new Error("Uploads are not available here.");
      }),
    [ctx],
  );
}
