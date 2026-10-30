"use client";

import React, { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User, UploadCloud } from "lucide-react";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import { toast } from "sonner";

export interface ProfileAvatarUploaderProps {
  currentImageUrl?: string | null;
  userName?: string | null;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ProfileAvatarUploader({
  currentImageUrl,
  userName,
  onImageChange,
  disabled = false,
}: ProfileAvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [getPresignedUploadUrl] = useGetPresignedUploadUrlMutation();

  // Sync external changes
  React.useEffect(() => {
    setPreviewUrl(currentImageUrl ?? null);
  }, [currentImageUrl]);

  const initials = userName
    ? userName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size should be less than 10 MB");
      return;
    }

    // Local instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const presigned = await getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        category: "avatars",
        subFolder: "profiles",
      }).unwrap();

      const uploadRes = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload avatar to cloud storage");
      }

      setPreviewUrl(presigned.publicUrl);
      onImageChange(presigned.publicUrl);
      toast.success("Profile photo uploaded!");
    } catch (err: any) {
      setPreviewUrl(currentImageUrl ?? null);
      toast.error(err?.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onImageChange(null);
    toast.info("Photo removed");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* Avatar Container */}
      <div className="relative group shrink-0">
        <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-1 shadow-inner dark:border-rose-900/50 dark:bg-rose-950/20 overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={userName || "Profile"}
              className="h-full w-full rounded-2xl object-cover transition duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-2xl sm:text-3xl font-extrabold text-white shadow-xs">
              {initials}
            </div>
          )}

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-3xl text-white backdrop-blur-xs">
              <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
              <span className="text-[10px] font-bold mt-1">Uploading...</span>
            </div>
          )}

          {/* Hover Overlay Button */}
          {!isUploading && !disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl backdrop-blur-[2px]"
              title="Change profile photo"
            >
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-0.5">Change</span>
            </button>
          )}
        </div>

        {/* Small floating badge trigger button */}
        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
            title="Upload photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Info & Action Controls */}
      <div className="flex-1 text-center sm:text-left space-y-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Accepts JPEG, PNG or WebP images up to 10 MB. Recommended minimum size: 400x400 px.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || disabled}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            <UploadCloud className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Upload New</span>
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading || disabled}
              className="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}

