"use client";

import React, { useState } from "react";
import { BadgeCheck, Calendar, CheckCircle2, Clock, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Agent } from "@/data/agents";
import { saveVisitBooking } from "@/lib/services/visitBookings";

interface BookVisitModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
}

export function BookVisitModal({ agent, isOpen, onClose, propertyTitle }: BookVisitModalProps) {
  const [tourDay, setTourDay] = useState("This Weekend");
  const [tourSlot, setTourSlot] = useState("Afternoon (1 PM - 4 PM)");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!agent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim()) return;

    saveVisitBooking({
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.role,
      agentAvatar: agent.avatar,
      visitorName: clientName.trim() || "Prospective Buyer",
      visitorPhone: clientPhone.trim(),
      tourDay,
      tourSlot,
      propertyTitle: propertyTitle || agent.focus,
      locality: agent.area,
      cityName: agent.city,
      notes: notes.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setClientName("");
      setClientPhone("");
      setNotes("");
      onClose();
    }, 2800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-rose-500/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <DialogTitle className="text-base font-bold text-slate-950 dark:text-white">
                  {agent.name}
                </DialogTitle>
                <BadgeCheck className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {agent.role} • {agent.agency}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-in fade-in duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-950 dark:text-white">
              Site Visit Request Sent!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              {agent.name} has been notified and will call you on <strong className="text-slate-900 dark:text-white">{clientPhone}</strong> to confirm your walkthrough for <span className="font-semibold text-rose-600">{tourDay}</span>.
            </p>
            <p className="text-[11px] text-slate-400">
              This request has also been logged into your Agent CRM / Leads portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                Guided Walkthrough in: <span className="text-rose-600 dark:text-rose-400">{agent.area}</span>
              </p>
              <p className="text-slate-500 text-[11px] flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> Zero consultation fees. Direct verified access.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-rose-500" />
                Select Preferred Day
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Today", "Tomorrow", "This Weekend"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTourDay(day)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      tourDay === day
                        ? "border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-300 ring-1 ring-rose-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                Preferred Time Slot
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[
                  { label: "Morning", time: "10 AM - 1 PM" },
                  { label: "Afternoon", time: "1 PM - 4 PM" },
                  { label: "Evening", time: "4 PM - 7 PM" },
                ].map((slot) => {
                  const val = `${slot.label} (${slot.time})`;
                  const selected = tourSlot === val;
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => setTourSlot(val)}
                      className={`rounded-xl border p-2 text-left transition ${
                        selected
                          ? "border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-300 ring-1 ring-rose-500"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <p className="text-[11px] font-bold">{slot.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{slot.time}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <User className="h-3 w-3 text-slate-400" />
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]"
            >
              Confirm Site Visit Request
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
