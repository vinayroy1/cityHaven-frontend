"use client";

import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  createPlacesSessionToken,
  fetchAutocompleteSuggestions,
  fetchPlaceDetails,
  fetchReverseGeocode,
  type PlaceDetails,
} from "@/lib/googlePlaces";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { errorText, fieldLabel } from "./theme";

const Field = ({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label className={fieldLabel}>
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
    {error && <p className={errorText}>{error}</p>}
  </div>
);

export function LocationStep() {
  const form = useFormContext<PropertyListingFormValues>();
  const errors = form.formState.errors.location ?? {};
  const [addressQuery, setAddressQuery] = useState(form.getValues("location.address") ?? "");
  const [suggestions, setSuggestions] = useState<{ description: string; place_id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const applyDetails = (details: PlaceDetails, description: string) => {
    const address = details.formattedAddress || description;
    form.setValue("location.address", address);
    form.setValue("location.latitude", details.location.lat);
    form.setValue("location.longitude", details.location.lng);
    form.setValue("location.cityName", details.city || "");
    form.setValue("location.locality", details.locality || details.subLocality || details.city || "");
    form.setValue("location.subLocality", details.subLocality || "");
    form.setValue("location.pincode", details.postalCode || "");
    form.trigger(["location.cityName", "location.locality"]);
    setAddressQuery(address);
    setLastQuery(address);
    setToken(null);
    setSuggestions([]);
  };

  const pickSuggestion = async (placeId: string, description: string) => {
    setError(null);
    const details = await fetchPlaceDetails(placeId, token ?? undefined);
    if (!details) {
      setError("Could not fetch place details. Try again.");
      return;
    }
    applyDetails(details, description);
  };

  const useCurrentLocation = () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const details = await fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (details) applyDetails(details, details.formattedAddress || "");
          else setError("Could not resolve your location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  useEffect(() => {
    const handle = setTimeout(async () => {
      const q = addressQuery.trim();
      if (q.length < 3 || q === lastQuery) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      const t = token || createPlacesSessionToken();
      if (!token) setToken(t);
      const results = await fetchAutocompleteSuggestions(q, t);
      setSuggestions(results);
      setLastQuery(q);
      setLoading(false);
    }, 500);
    return () => clearTimeout(handle);
  }, [addressQuery, lastQuery, token]);

  return (
    <div className="space-y-5">
      <Field label="Search address">
        <div className="relative">
          <Input
            className="pr-32"
            placeholder="Street, society or landmark"
            value={addressQuery}
            onChange={(e) => {
              setAddressQuery(e.target.value);
              form.setValue("location.address", e.target.value);
            }}
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 disabled:opacity-60"
          >
            <MapPin className="h-3.5 w-3.5" />
            {locating ? "Locating…" : "Use location"}
          </button>
          {loading && <p className="absolute right-32 top-2.5 text-xs text-slate-400">Searching…</p>}
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  type="button"
                  className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-slate-50"
                  onClick={() => pickSuggestion(s.place_id, s.description)}
                >
                  {s.description}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" required error={errors.cityName?.message as string | undefined}>
          <Input
            {...form.register("location.cityName", { required: "City is required" })}
            placeholder="City"
          />
        </Field>
        <Field label="Locality" required error={errors.locality?.message as string | undefined}>
          <Input
            {...form.register("location.locality", { required: "Locality is required" })}
            placeholder="Locality / area"
          />
        </Field>
        <Field label="Sub-locality">
          <Input {...form.register("location.subLocality")} placeholder="Sector, block, pocket" />
        </Field>
        <Field label="Pincode">
          <Input {...form.register("location.pincode")} placeholder="560001" inputMode="numeric" />
        </Field>
        <Field label="House / flat no.">
          <Input {...form.register("location.houseNumber")} placeholder="A-203" />
        </Field>
        <Field label="Plot no.">
          <Input {...form.register("location.plotNumber")} placeholder="Plot 21" />
        </Field>
      </div>
    </div>
  );
}
