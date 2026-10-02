"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Video,
  UserCheck,
  CalendarPlus,
  Loader2,
  Sparkles,
  ShieldCheck,
  Share2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useScheduleVisitMutation } from "@/features/propertyListing/api";
import { APP_CONFIG } from "@/constants/app-config";

export interface ScheduleVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: number | string;
    title?: string | null;
    address?: string | null;
    locality?: string | null;
    cityName?: string | null;
    price?: string | null;
    ownerName?: string | null;
  };
  initialTourType?: "IN_PERSON" | "VIDEO_CALL";
}

type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";
type MoveInTimeline = "IMMEDIATE" | "WITHIN_15_DAYS" | "WITHIN_30_DAYS" | "EXPLORING";

const TIME_SLOTS: { id: TimeSlot; label: string; time: string; badge?: string }[] = [
  { id: "MORNING", label: "Morning", time: "10:00 AM - 12:00 PM" },
  { id: "AFTERNOON", label: "Afternoon", time: "12:00 PM - 03:00 PM" },
  { id: "EVENING", label: "Evening", time: "04:00 PM - 07:00 PM", badge: "Most Popular" },
];

const MOVE_IN_OPTIONS: { id: MoveInTimeline; label: string }[] = [
  { id: "IMMEDIATE", label: "Immediate" },
  { id: "WITHIN_15_DAYS", label: "Within 15 days" },
  { id: "WITHIN_30_DAYS", label: "Within 30 days" },
  { id: "EXPLORING", label: "Just exploring" },
];

export function ScheduleVisitDialog({
  open,
  onOpenChange,
  property,
  initialTourType = "IN_PERSON",
}: ScheduleVisitDialogProps) {
  // Generate next 7 days for the date selector
  const availableDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      let label = "";
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
      else label = d.toLocaleDateString("en-US", { weekday: "short" });

      dates.push({
        date: d,
        isoDate: d.toISOString().split("T")[0],
        dayLabel: label,
        dayNum: d.getDate(),
        monthLabel: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return dates;
  }, []);

  const [tourType, setTourType] = useState<"IN_PERSON" | "VIDEO_CALL">(initialTourType);
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[1]?.isoDate || availableDates[0]?.isoDate);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>("EVENING");
  const [moveIn, setMoveIn] = useState<MoveInTimeline>("WITHIN_15_DAYS");
  const [note, setNote] = useState("");
  
  // Guest fields (if not logged in)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any>(null);

  const [scheduleVisit, { isLoading }] = useScheduleVisitMutation();

  const activeDateObj = availableDates.find((d) => d.isoDate === selectedDate) || availableDates[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Compute estimated ISO time for scheduledAt based on slot
    const slotHour = selectedSlot === "MORNING" ? 11 : selectedSlot === "AFTERNOON" ? 14 : 17;
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(slotHour, 0, 0, 0);

    const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token && phone.replace(/\D/g, "").length < 10) {
      setError("Please provide a valid 10-digit mobile number");
      return;
    }

    try {
      const res = await scheduleVisit({
        propertyId: property.id,
        scheduledAt: scheduledDateTime.toISOString(),
        timeSlot: selectedSlot,
        tourType,
        moveInTimeline: moveIn,
        visitorName: name.trim() || undefined,
        visitorPhone: phone.replace(/\D/g, "").slice(0, 10) || undefined,
        note: note.trim() || undefined,
      }).unwrap();

      setConfirmedData(res.data);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to schedule visit. Please try again.");
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError(null);
    onOpenChange(false);
  };

  const createGoogleCalendarLink = () => {
    if (!activeDateObj) return "#";
    const slotStartHour = selectedSlot === "MORNING" ? 10 : selectedSlot === "AFTERNOON" ? 12 : 16;
    const slotEndHour = selectedSlot === "MORNING" ? 12 : selectedSlot === "AFTERNOON" ? 15 : 19;

    const start = new Date(selectedDate);
    start.setHours(slotStartHour, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(slotEndHour, 0, 0, 0);

    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(`Property Site Visit: ${property.title || "Awasio Listing"}`);
    const details = encodeURIComponent(
      `Property Site Visit scheduled via Awasio.\nProperty ID: ${property.id}\nMode: ${
        tourType === "VIDEO_CALL" ? "Live Video Call Tour" : "In-Person Physical Visit"
      }\nSlot: ${selectedSlot}\nOwner: ${property.ownerName || "Property Owner"}`
    );
    const loc = encodeURIComponent(
      [property.locality, property.cityName, property.address].filter(Boolean).join(", ") || "Awasio Property"
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${loc}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleResetAndClose}>
      <DialogContent
        className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden border-0 bg-white p-0 shadow-2xl sm:max-w-lg dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSuccess ? (
          <div className="flex max-h-[92vh] min-w-0 flex-col">
            {/* Header with Rose Theme */}
            <div className="shrink-0 bg-gradient-to-r from-rose-600 to-rose-700 p-4 text-white dark:from-rose-700 dark:to-rose-800 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  100% Free • Direct Owner Connection
                </span>
                {property.price && (
                  <span className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white/95 sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm">{property.price}</span>
                )}
              </div>
              <DialogHeader className="mt-2 text-left">
                <DialogTitle className="text-xl font-extrabold text-white">
                  Schedule a Site Visit
                </DialogTitle>
                <DialogDescription className="text-xs text-rose-100 line-clamp-1">
                  {property.title || "Explore this verified property at your preferred time"}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-4 sm:space-y-5 sm:p-5">
                {/* Tour Mode Toggle: In-Person vs Video Tour */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                    Select Tour Type
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTourType("IN_PERSON")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                        tourType === "IN_PERSON"
                          ? "border-rose-600 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>In-Person Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTourType("VIDEO_CALL")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                        tourType === "VIDEO_CALL"
                          ? "border-rose-600 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      <Video className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>Live Video Tour</span>
                    </button>
                  </div>
                </div>

                {/* Date Selection: 7-day pill carousel */}
                <div className="min-w-0 max-w-full overflow-hidden">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                      Choose Date
                    </label>
                    <span className="shrink-0 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {activeDateObj.dayLabel}, {activeDateObj.dayNum} {activeDateObj.monthLabel}
                    </span>
                  </div>
                  <div className="mt-2 flex w-full max-w-full min-w-0 touch-pan-x snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2 no-scrollbar">
                    {availableDates.map((item) => {
                      const isSelected = item.isoDate === selectedDate;
                      return (
                        <button
                          key={item.isoDate}
                          type="button"
                          onClick={() => setSelectedDate(item.isoDate)}
                          className={`flex min-w-[64px] shrink-0 snap-start flex-col items-center justify-center rounded-xl border py-2 text-xs font-medium transition sm:min-w-[70px] ${
                            isSelected
                              ? "border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-rose-950"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                          }`}
                        >
                          <span className={`text-[10px] ${isSelected ? "text-rose-100 font-semibold" : "text-zinc-500"}`}>
                            {item.dayLabel}
                          </span>
                          <span className="text-base font-bold leading-tight">{item.dayNum}</span>
                          <span className={`text-[10px] ${isSelected ? "text-rose-100" : "text-zinc-400"}`}>
                            {item.monthLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              {/* Time Slot Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  Select Time Window
                </label>
                <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const active = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`relative flex min-h-[54px] flex-col items-center justify-center rounded-xl border p-2 text-center transition sm:items-start sm:p-2.5 sm:text-left ${
                          active
                            ? "border-rose-600 bg-rose-50 text-rose-900 shadow-sm dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {slot.badge && (
                          <span className="absolute -top-2 right-2 rounded-full bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                            {slot.badge}
                          </span>
                        )}
                        <span className="text-xs font-bold">{slot.label}</span>
                        <span className="mt-0.5 hidden text-[11px] text-zinc-500 dark:text-slate-400 sm:inline">{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Move-in Timeline */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  When do you plan to move?
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {MOVE_IN_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMoveIn(opt.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        moveIn === opt.id
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Details (Name & Phone) */}
              <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-slate-200">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Visitor Contact Information</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-zinc-400">+91</span>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Optional note for the owner (e.g. Bringing family, parking needed)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-rose-200">
                  {error}
                </div>
              )}
              </div>

              {/* Submit CTA */}
              <div className="shrink-0 space-y-2 border-t border-zinc-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-50 dark:shadow-rose-950"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scheduling Visit...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      <span>Confirm Free Site Visit</span>
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-500 dark:text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Free booking • No charges • Saved to your visit history</span>
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div className="space-y-5 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                Site Visit Confirmed!
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                Your request has been saved. Awasio can notify the owner once notification channels are enabled.
              </p>
            </div>

            {/* Visit Details Card */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-left dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5 dark:border-slate-700">
                <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">Date & Slot</span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {activeDateObj.dayLabel}, {activeDateObj.dayNum} {activeDateObj.monthLabel} • {selectedSlot}
                </span>
              </div>
              <div className="mt-2.5 space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                  {property.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span className="truncate">
                    {[property.locality, property.cityName].filter(Boolean).join(", ")}
                  </span>
                </p>
              </div>
            </div>

            {/* Calendar & Share Actions */}
            <div className="space-y-2">
              <a
                href={createGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <CalendarPlus className="h-4 w-4 text-rose-600" />
                <span>Add to Google Calendar</span>
              </a>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
