"use client";

import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";
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
  const [suggestions, setSuggestions] = useState<AwasioSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const applySuggestion = (suggestion: AwasioSuggestion) => {
    const displayAddress = [
      suggestion.location.locality,
      suggestion.location.city,
      suggestion.location.state,
    ].filter(Boolean).join(", ");
    form.setValue("location.address", displayAddress);
    form.setValue("location.latitude", suggestion.location.lat ?? null);
    form.setValue("location.longitude", suggestion.location.lng ?? null);
    form.setValue("location.cityName", suggestion.location.city || "");
    form.setValue("location.locality", suggestion.location.locality || suggestion.location.city || "");
    form.setValue("location.pincode", suggestion.location.pincode ? String(suggestion.location.pincode) : "");
    form.trigger(["location.cityName", "location.locality"]);
    setAddressQuery(displayAddress);
    setLastQuery(displayAddress);
    setSuggestions([]);
  };

  const pickSuggestion = (s: AwasioSuggestion) => {
    setError(null);
    applySuggestion(s);
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
          const { reverseGeocodeAwasio } = await import("@/lib/awasioSuggestions");
          const result = await reverseGeocodeAwasio(pos.coords.latitude, pos.coords.longitude);
          if (result?.city) {
            form.setValue("location.cityName", result.city);
            form.setValue("location.locality", result.locality || result.city);
            if (result.pincode) form.setValue("location.pincode", result.pincode);
            const address = [result.locality, result.city, result.state].filter(Boolean).join(", ");
            form.setValue("location.address", address);
            form.setValue("location.latitude", pos.coords.latitude);
            form.setValue("location.longitude", pos.coords.longitude);
            form.trigger(["location.cityName", "location.locality"]);
            setAddressQuery(address);
          } else {
            setError("Could not resolve your location. Please type manually.");
          }
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
      try {
        const resp = await fetchAwasioSuggestions(q, { limit: 6, types: ["CITY", "LOCALITY", "PROJECT"] });
        setSuggestions(resp.data);
        setLastQuery(q);
      } catch (err) {
        setSuggestions([]);
        setError(err instanceof Error ? err.message : "Could not load location suggestions.");
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [addressQuery, lastQuery]);

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
                  key={s.id}
                  type="button"
                  className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50"
                  onClick={() => pickSuggestion(s)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-slate-800">{s.title}</span>
                    <span className="block truncate text-xs text-slate-400">{s.subtitle}</span>
                  </span>
                  <span
                    className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white"
                    style={{ backgroundColor: s.badgeColor }}
                  >
                    {s.badge}
                  </span>
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
