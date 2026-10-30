"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Sparkles,
  MapPin,
  IndianRupee,
  Calendar,
  Utensils,
  PawPrint,
  Cigarette,
  Wine,
  Laptop,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUpdateFlatmateListingMutation } from "@/features/flatmates/api";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import type { FlatmateListing, FlatmateListingInput } from "@/types/flatmate.types";
import { isRealUserPhoto } from "./FlatmateCard";
import { SeekerAvatarPlaceholder } from "./SeekerAvatarPlaceholder";

export interface FlatmateEditModalProps {
  listing: FlatmateListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROOM_TYPES = ["Private Room", "Shared Room (Twin)", "Shared Room (3+)", "Whole Flat"];
const FURNISHING_OPTIONS = ["Fully Furnished", "Semi-Furnished", "Unfurnished"];
const DIET_OPTIONS = ["Any Diet", "Pure Vegetarian", "Vegetarian & Eggetarian", "Non-Vegetarian", "Vegan"];
const WORK_MODE_OPTIONS = ["Remote / WFH", "Hybrid", "In-Office"];

export function FlatmateEditModal({ listing, isOpen, onClose, onSuccess }: FlatmateEditModalProps) {
  const [updateListing, { isLoading: isSaving }] = useUpdateFlatmateListingMutation();
  const [getPresignedUploadUrl] = useGetPresignedUploadUrlMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rent, setRent] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [locality, setLocality] = useState("");
  const [cityName, setCityName] = useState("");
  const [roomType, setRoomType] = useState("Private Room");
  const [furnishing, setFurnishing] = useState("Fully Furnished");
  const [availableFrom, setAvailableFrom] = useState("");
  const [preferredDiet, setPreferredDiet] = useState("Any Diet");
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [drinkingAllowed, setDrinkingAllowed] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [workMode, setWorkMode] = useState("Hybrid");
  const [photos, setPhotos] = useState<string[]>([]);
  const [hideProfilePhoto, setHideProfilePhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (listing && isOpen) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setRent(listing.rent ? String(listing.rent) : "");
      setBudgetMin(listing.budgetMin ? String(listing.budgetMin) : "");
      setBudgetMax(listing.budgetMax ? String(listing.budgetMax) : "");
      setLocality(listing.locality || listing.preferredLocalities?.[0] || "");
      setCityName(listing.cityName || "");
      setRoomType(listing.roomType || "Private Room");
      setFurnishing(listing.furnishing || "Fully Furnished");
      setAvailableFrom(
        listing.availableFrom ? new Date(listing.availableFrom).toISOString().split("T")[0] : ""
      );
      setPreferredDiet(listing.preferredDiet || listing.profile?.diet || "Any Diet");
      setSmokingAllowed(listing.smokingAllowed ?? false);
      setDrinkingAllowed(listing.drinkingAllowed ?? true);
      setPetsAllowed(listing.petsAllowed ?? true);
      setWorkMode(listing.profile?.workMode || "Hybrid");

      const existingPhotos = listing.photos || [];
      const hasRealPhoto =
        existingPhotos.some(isRealUserPhoto) || isRealUserPhoto(listing.profile?.profilePhoto);
      setPhotos(existingPhotos);
      setHideProfilePhoto(!hasRealPhoto && listing.mode !== "HAVE_ROOM");
    }
  }, [listing, isOpen]);

  if (!listing) return null;

  const isPlaceListing = listing.mode === "HAVE_ROOM";

  const handleUploadPhoto = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Please choose an image file under 10 MB");
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const presigned = await getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        category: "flatmates",
        subFolder: isPlaceListing ? "photos" : "profiles",
      }).unwrap();
      const res = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      setPhotos([presigned.publicUrl]);
      setHideProfilePhoto(false);
      toast.success("Photo uploaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        toast.error("Title cannot be empty");
        return;
      }

      const updateData: Partial<FlatmateListingInput> = {
        title: title.trim(),
        description: description.trim() || undefined,
        locality: locality.trim() || undefined,
        preferredLocalities: locality.trim() ? [locality.trim()] : undefined,
        cityName: cityName.trim() || undefined,
        roomType,
        furnishing,
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        preferredDiet: preferredDiet !== "Any Diet" ? preferredDiet : undefined,
        smokingAllowed,
        drinkingAllowed,
        petsAllowed,
      };

      if (isPlaceListing) {
        if (rent) updateData.rent = Number(rent);
        updateData.photos = photos;
      } else {
        if (budgetMin) updateData.budgetMin = Number(budgetMin);
        if (budgetMax) updateData.budgetMax = Number(budgetMax);
        updateData.photos = hideProfilePhoto ? [] : photos;
        updateData.profile = {
          displayName: listing.profile?.displayName,
          profilePhoto: hideProfilePhoto ? null : (photos[0] || null),
          diet: preferredDiet,
          workMode,
          hasPets: petsAllowed,
        };
      }

      await updateListing({ id: listing.id, data: updateData }).unwrap();
      toast.success("Listing updated successfully!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update listing");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    listing.mode === "HAVE_ROOM"
                      ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                      : listing.mode === "BUDDY_UP"
                      ? "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300"
                      : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300"
                  }
                >
                  {listing.mode === "HAVE_ROOM"
                    ? "Offering Room"
                    : listing.mode === "BUDDY_UP"
                    ? "Buddy-Up Duo"
                    : "Room Seeker"}
                </Badge>
                <Badge variant="outline">{listing.status}</Badge>
              </div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
                Edit Flatmate Requirement
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Listing Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remote Software Engineer Looking for Room in Marathahalli"
              className="rounded-2xl text-sm"
            />
          </div>

          {/* Pricing / Budget */}
          {isPlaceListing ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly Rent (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="15000"
                  className="rounded-2xl pl-9 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Min Budget (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="10000"
                    className="rounded-2xl pl-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Max Budget (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="20000"
                    className="rounded-2xl pl-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
              <Input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="City name"
                className="rounded-2xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Locality / Area
              </label>
              <Input
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Locality"
                className="rounded-2xl text-sm"
              />
            </div>
          </div>

          {/* Configuration & Move-in */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900"
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Furnishing</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900"
              >
                {FURNISHING_OPTIONS.map((fo) => (
                  <option key={fo} value={fo}>
                    {fo}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Move-in Date
              </label>
              <Input
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="rounded-2xl text-xs"
              />
            </div>
          </div>

          {/* Profile Photo / Avatar Setting (for Seekers & Buddy Up) */}
          {!isPlaceListing && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Listing Visual Avatar & Photo
                </span>
                {!hideProfilePhoto && photos.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/60">
                    Photo Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3.5">
                {hideProfilePhoto ? (
                  <div className="relative w-16 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-rose-300 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                    <SeekerAvatarPlaceholder
                      displayName={listing.profile?.displayName || listing.title}
                      gender={listing.profile?.gender}
                      mode={listing.mode}
                    />
                  </div>
                ) : photos[0] ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-rose-500 shrink-0">
                    <img
                      src={photos[0]}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-16 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                    <SeekerAvatarPlaceholder
                      displayName={listing.profile?.displayName || listing.title}
                      gender={listing.profile?.gender}
                      mode={listing.mode}
                    />
                  </div>
                )}

                <div className="space-y-1 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {hideProfilePhoto
                      ? "Illustrated Character Persona Active"
                      : photos[0]
                      ? "Custom Profile Photo Active"
                      : "Using Illustrated Character Avatar"}
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>Upload new photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => void handleUploadPhoto(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {/* Checkbox: Don't show profile photo in listing */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideProfilePhoto}
                  onChange={(e) => setHideProfilePhoto(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Don&apos;t show profile photo in listing
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Hide personal photo and show an eye-catching illustrated persona avatar.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Lifestyle Preferences */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Lifestyle & Preferences
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSmokingAllowed((v) => !v)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition ${
                  smokingAllowed
                    ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <Cigarette className="w-3.5 h-3.5" />
                <span>{smokingAllowed ? "Smoking OK" : "No Smoking"}</span>
              </button>

              <button
                type="button"
                onClick={() => setDrinkingAllowed((v) => !v)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition ${
                  drinkingAllowed
                    ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <Wine className="w-3.5 h-3.5" />
                <span>{drinkingAllowed ? "Drinking OK" : "No Alcohol"}</span>
              </button>

              <button
                type="button"
                onClick={() => setPetsAllowed((v) => !v)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition ${
                  petsAllowed
                    ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <PawPrint className="w-3.5 h-3.5" />
                <span>{petsAllowed ? "Pet Friendly" : "No Pets"}</span>
              </button>

              <select
                value={preferredDiet}
                onChange={(e) => setPreferredDiet(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {DIET_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description / Roommate Note
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell prospective flatmates about your work hours, routine, preferences..."
              className="rounded-2xl text-xs leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 shadow-md shadow-rose-600/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
