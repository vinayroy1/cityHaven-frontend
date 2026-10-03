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

const DEFAULT_BOOKINGS: VisitBooking[] = [
  {
    id: "tour-001",
    agentId: "aarav-kapoor",
    agentName: "Aarav Kapoor",
    agentRole: "Senior Property Advisor",
    agentAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
    visitorName: "Sameer Khanna",
    visitorPhone: "+91 98102 33441",
    tourDay: "Tomorrow",
    tourSlot: "Morning (10 AM - 1 PM)",
    propertyTitle: "4 BHK Ultra-Luxury Builder Floor",
    locality: "Greater Kailash 1",
    cityName: "Delhi",
    status: "NEW",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    notes: "Client looking for park-facing floor with lift and 2 car parkings.",
  },
  {
    id: "tour-002",
    agentId: "meera-singhania",
    agentName: "Meera Singhania",
    agentRole: "Luxury Residential Specialist",
    agentAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    visitorName: "Priyanka Tandon",
    visitorPhone: "+91 98114 99012",
    tourDay: "This Weekend",
    tourSlot: "Afternoon (1 PM - 4 PM)",
    propertyTitle: "DLF The Camellias Sky Villa",
    locality: "Golf Course Road",
    cityName: "Gurugram",
    status: "CONTACTED",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    notes: "Spoke with client, confirmed gate clearance for Saturday 2:30 PM.",
  },
  {
    id: "tour-003",
    agentId: "rohan-varma",
    agentName: "Rohan Varma",
    agentRole: "Ready-to-Move Consultant",
    agentAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    visitorName: "Vivek Joshi",
    visitorPhone: "+91 98129 11200",
    tourDay: "Today",
    tourSlot: "Evening (4 PM - 7 PM)",
    propertyTitle: "3 BHK Golf-Facing Apartment",
    locality: "Sector 128",
    cityName: "Noida",
    status: "VISIT_SCHEDULED",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notes: "Visit scheduled with keys arranged from society manager.",
  },
];

export function getVisitBookings(): VisitBooking[] {
  if (typeof window === "undefined") return DEFAULT_BOOKINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKINGS));
      return DEFAULT_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BOOKINGS;
  } catch {
    return DEFAULT_BOOKINGS;
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
      if (cleanPhone.length === 10) {
        const slotKey = booking.tourSlot.toLowerCase().includes("morning")
          ? "MORNING"
          : booking.tourSlot.toLowerCase().includes("evening")
          ? "EVENING"
          : "AFTERNOON";

        const targetPropertyId = booking.propertyId || 1;

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
