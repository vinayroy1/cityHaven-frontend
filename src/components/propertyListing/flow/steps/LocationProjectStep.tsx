import React, { useEffect, useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cityOptions, projectOptions } from "@/features/propertyListing";
import { fetchAutocompleteSuggestions, fetchPlaceDetails, fetchReverseGeocode, type PlaceDetails } from "@/lib/googlePlaces";
import { requestLocationPermissionOnce } from "@/lib/permissions";
import { FieldShell, NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function LocationProjectStep({ form }: StepProps) {
  const cityId = form.watch("location.cityId");
  const cityName = form.watch("location.cityName");
  const derivedCityId =
    cityId ||
    cityOptions.find((city) => city.name.toLowerCase() === (cityName ?? "").toLowerCase())?.id ||
    "";
  const filteredProjects = projectOptions.filter((p) => !derivedCityId || p.cityId === derivedCityId);
  const propertySubType = form.watch("context.propertySubTypeId");
  const showMall = propertySubType === "retail" || propertySubType === "hospitality";
  const [addressQuery, setAddressQuery] = useState(form.watch("location.address") ?? "");
  const [suggestions, setSuggestions] = useState<{ description: string; place_id: string }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedQuery, setLastFetchedQuery] = useState("");
  const [locating, setLocating] = useState(false);

  const handlePlaceDetails = async (placeId: string, description: string) => {
    setError(null);
    const details = await fetchPlaceDetails(placeId);
    if (!details) {
      setError("Could not fetch place details. Please try again.");
      return;
    }

    applyPlaceDetails(details, description);
  };

  const applyPlaceDetails = (details: PlaceDetails, description: string) => {
    const matchedCity = cityOptions.find((city) => city.name.toLowerCase() === details.city.toLowerCase());
    const selectedAddress = details.formattedAddress || description;

    form.setValue("location.address", selectedAddress);
    form.setValue("location.latitude", details.location.lat);
    form.setValue("location.longitude", details.location.lng);
    form.setValue("location.cityName", details.city || "");
    form.setValue("location.cityId", matchedCity?.id || details.placeId || "");
    form.setValue("location.locality", details.locality || details.subLocality || details.city || "");
    form.setValue("location.localityId", details.placeId || "");
    form.setValue("location.subLocality", details.subLocality || details.locality || "");
    form.setValue("location.pincode", details.postalCode || "");
    if (details.nearby?.length) {
      const firstLandmark = details.nearby.find(Boolean);
      if (firstLandmark) {
        form.setValue("location.address", `${firstLandmark}, ${details.city || ""}`.trim());
      }
    }
    form.trigger(["location.cityName", "location.locality"]);
    setAddressQuery(selectedAddress);
    setLastFetchedQuery(selectedAddress); // prevent immediate re-fetch and re-opening suggestions after selection
  };

  const handleUseCurrentLocation = () => {
    setError(null);
    setSuggestions([]);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const details = await fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (!details) {
            setError("Could not fetch current location. Please try again.");
            return;
          }
          applyPlaceDetails(details, details.formattedAddress || "");
        } catch {
          setError("Could not fetch current location. Please try again.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setError("Location permission denied. Please allow access to use current location.");
        } else if (err.code === 2) {
          setError("Could not determine your location. Try again.");
        } else {
          setError("Fetching location timed out. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      const trimmed = addressQuery.trim();
      if (!trimmed || trimmed.length < 3) {
        setSuggestions([]);
        return;
      }
      const smallIncrement = lastFetchedQuery && trimmed.startsWith(lastFetchedQuery) && trimmed.length - lastFetchedQuery.length === 1;
      if (trimmed === lastFetchedQuery || smallIncrement) return;
      setLoadingSuggestions(true);
      const results = await fetchAutocompleteSuggestions(trimmed);
      setSuggestions(results);
      setLastFetchedQuery(trimmed);
      setLoadingSuggestions(false);
    }, 600);

    return () => clearTimeout(handler);
  }, [addressQuery, lastFetchedQuery]);

  useEffect(() => {
    let cancelled = false;
    const maybePrefillFromLocation = async () => {
      setLocating(true);
      const { position, error } = await requestLocationPermissionOnce({ storageKey: "locationPermissionAsked" });
      if (cancelled) return;
      setLocating(false);
      if (error) {
        if (error) setError(error);
      }
      if (!position) return;
      const currentAddress = form.getValues("location.address")?.trim();
      const currentCity = form.getValues("location.cityName")?.trim();
      if (currentAddress || currentCity) return;
      const details = await fetchReverseGeocode(position.coords.latitude, position.coords.longitude);
      if (!cancelled && details) {
        applyPlaceDetails(details, details.formattedAddress || "");
      }
    };
    void maybePrefillFromLocation();
    return () => {
      cancelled = true;
    };
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 p-5 shadow-xl">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <div className="relative">
                    <Input
                      className="pr-28"
                      value={addressQuery}
                      onChange={(e) => {
                        setAddressQuery(e.target.value);
                        field.onChange(e.target.value);
                      }}
                      onBlur={() => {
                        // ensure manual typing (without selecting a suggestion) persists on blur
                        form.setValue("location.address", addressQuery);
                        // close suggestion dropdown when user leaves the field
                        setTimeout(() => setSuggestions([]), 120);
                      }}
                      placeholder="Search street / society / landmark"
                    />
                    {loadingSuggestions && <p className="absolute right-12 top-2 text-xs text-slate-500">Searching…</p>}
                    <button
                      type="button"
                      className="absolute right-2 top-1.5 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                    >
                      <MapPin className="h-4 w-4" />
                      {locating ? "Locating…" : "Use location"}
                    </button>
                  </div>
                  {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
                  {suggestions.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                      {suggestions.map((prediction) => (
                        <button
                          key={prediction.place_id}
                          type="button"
                          className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
                          onClick={() => {
                            setSuggestions([]);
                            handlePlaceDetails(prediction.place_id, prediction.description);
                          }}
                        >
                          {prediction.description}
                        </button>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location.cityName"
                rules={{ required: "City is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="City" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.locality"
                rules={{ required: "Locality is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locality *</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Locality / Area" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="location.subLocality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Locality</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Sector, pocket, block" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="560001" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="location.houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House / Flat no.</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="203" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.plotNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot no.</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Plot 21" />
                </FormItem>
              )}
            />
            {showMall && (
              <FormField
                control={form.control}
                name="location.mall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mall / Retail hub</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Phoenix Mall" />
                  </FormItem>
                )}
              />
            )}
          </div>

        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <FieldShell title="Projects & societies" description="Map to a known project or add your own society label" icon={Building2} />
          <FormField
            control={form.control}
            name="location.projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project (from master)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!cityId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredProjects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Separator className="my-4 border-slate-200" />

          <FormField
            control={form.control}
            name="location.societyOrProjectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society / Project name (free text)</FormLabel>
                <Input
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Green View Residency"
                />
                <FormDescription className="text-xs text-slate-500">
                  Required if no project is selected from master.
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">City / Locality</p>
              <p className="text-lg font-semibold text-slate-900">
                {cityName ? `${cityName}${form.watch("location.locality") ? ` • ${form.watch("location.locality")}` : ""}` : "Set city"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Project match</p>
              <p className="text-lg font-semibold text-slate-900">
                {filteredProjects.length ? `${filteredProjects.length} matches` : "Add society name"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
