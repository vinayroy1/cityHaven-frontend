"use client";

import { useCallback } from "react";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import { compressImage } from "@/lib/utils/imageCompression";
import { useGetMyInteriorProfileQuery, usePresignInteriorDocumentMutation } from "./api";

/** `profile | cover | projects/<id>` — public media only. ID documents use `usePrivateInteriorDocUpload`. */
export type InteriorUploadSubFolder = "profile" | "cover" | `projects/${string}`;

export const MAX_INTERIOR_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Phone / camera photos are often 10-25 MB; shrink them in the browser (2560 px, WebP) before the size check. */
async function shrinkPhoto(file: File): Promise<File> {
  if (!/^image\/(jpe?g|png|webp|heic|heif|avif)$/i.test(file.type)) return file;
  try {
    return await compressImage(file, { maxDimension: 2560, quality: 0.85 });
  } catch {
    return file; // browser can't decode it (e.g. HEIC on Chrome): fall back to the original
  }
}

/**
 * Presign + PUT upload for interiors media. Returns the public URL.
 * Throws a user-readable Error on failure (size / network / storage).
 */
export function useInteriorUpload(): (file: File, subFolder: InteriorUploadSubFolder) => Promise<string> {
  const [getPresignedUploadUrl] = useGetPresignedUploadUrlMutation();
  const { data: profile } = useGetMyInteriorProfileQuery();
  const profileId = profile?.id;

  return useCallback(
    async (original: File, subFolder: InteriorUploadSubFolder) => {
      const file = await shrinkPhoto(original);
      if (file.size > MAX_INTERIOR_UPLOAD_BYTES) {
        throw new Error(`${original.name} is larger than 10 MB and couldn't be shrunk. Please choose a JPG or PNG photo.`);
      }
      const presigned = await getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        category: "interiors",
        entityId: profileId ?? "draft",
        subFolder,
      })
        .unwrap()
        .catch(() => {
          throw new Error("Couldn't start the upload. Check your connection and try again.");
        });
      const res = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      }).catch(() => null);
      if (!res || !res.ok) throw new Error("Upload failed. Please try again.");
      return presigned.publicUrl;
    },
    [getPresignedUploadUrl, profileId],
  );
}

/**
 * Private upload for ID / verification documents. Goes to the private bucket via the interiors
 * documents presign endpoint and returns the object KEY (never a public URL).
 */
export function usePrivateInteriorDocUpload(): (file: File) => Promise<string> {
  const [presign] = usePresignInteriorDocumentMutation();
  return useCallback(
    async (file: File) => {
      if (file.size > MAX_INTERIOR_UPLOAD_BYTES) {
        throw new Error("File is larger than 10 MB. Please choose a smaller file.");
      }
      const contentType = file.type || "application/octet-stream";
      const presigned = await presign({ fileName: file.name, contentType })
        .unwrap()
        .catch(() => {
          throw new Error("Couldn't start the upload. Use a PDF or photo and try again.");
        });
      const res = await fetch(presigned.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: file }).catch(() => null);
      if (!res || !res.ok) throw new Error("Upload failed. Please try again.");
      return presigned.key;
    },
    [presign],
  );
}
