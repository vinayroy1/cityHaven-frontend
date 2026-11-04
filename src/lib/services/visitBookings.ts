export interface VisitBooking {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  visitorName: string;
  visitorPhone: string;
  tourDay: string;
  tourSlot: string;
  propertyTitle: string;
  locality: string;
  cityName: string;
  status: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "WON";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

const STORAGE_KEY = "awasio.agent_visit_bookings";

/** IDs of demo bookings older builds seeded into every browser; stripped on read. */
const LEGACY_DEMO_IDS = /^tour-00\d$/;

export function getVisitBookings(): VisitBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const real = parsed.filter((b: VisitBooking) => !LEGACY_DEMO_IDS.test(String(b?.id)));
    if (real.length !== parsed.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(real));
    return real;
  } catch {
    return [];
  }
}

import { API_ENDPOINTS } from "@/constants/api-endpoints";

export function saveVisitBooking(booking: Omit<VisitBooking, "id" | "createdAt" | "updatedAt" | "status"> & { status?: VisitBooking["status"]; propertyId?: number }): VisitBooking {
  const current = getVisitBookings();
  const newBooking: VisitBooking = {
    ...booking,
    id: `tour-${Date.now()}`,
    status: booking.status || "NEW",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newBooking, ...current];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("awasio:visit-booked", { detail: newBooking }));

      // Persist directly to backend database (PropertyVisit + CRM Lead)
      const cleanPhone = booking.visitorPhone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10 && booking.propertyId) {
        const slotKey = booking.tourSlot.toLowerCase().includes("morning")
          ? "MORNING"
          : booking.tourSlot.toLowerCase().includes("evening")
          ? "EVENING"
          : "AFTERNOON";

        const targetPropertyId = booking.propertyId;

        fetch(API_ENDPOINTS.propertyListing.scheduleVisit(targetPropertyId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            visitorPhone: cleanPhone,
            visitorName: booking.visitorName,
            timeSlot: slotKey,
            tourType: "IN_PERSON",
            note: `Assigned Advisor: ${booking.agentName} | Tour: ${booking.tourDay} (${booking.tourSlot}) | Locality: ${booking.locality}`,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.data?.leadId) {
              console.log("Real backend lead and visit record created in PostgreSQL:", data.data);
            }
          })
          .catch((err) => {
            console.warn("Backend visit creation non-blocking note:", err);
          });
      }
    } catch (e) {
      console.error("Failed to persist visit booking", e);
    }
  }
  return newBooking;
}

export function updateVisitBookingStatus(id: string, newStatus: VisitBooking["status"]): VisitBooking[] {
  const current = getVisitBookings();
  const updated = current.map((item) =>
    item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
  );

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("awasio:visit-updated", { detail: { id, status: newStatus } }));
    } catch (e) {
      console.error("Failed to update visit status", e);
    }
  }
  return updated;
}
