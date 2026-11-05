"use client";

import { MapPin, X } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { useState } from "react";
import { getCountry, COUNTRY_LIST } from "@/config/countries";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { Chip, Field, Toggle, getAt, inputCls, propPath, setPath } from "./ui";

export default function PrimaryLocationEditor({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const p = {
    city: propPath(props, "cityField", "location.primaryCity"),
    state: propPath(props, "stateField", "location.primaryState"),
    locality: propPath(props, "localityField", "location.primaryLocality"),
    address: propPath(props, "addressField", "location.primaryAddress"),
    pincode: propPath(props, "pincodeField", "location.primaryPincode"),
    lat: propPath(props, "latField", "location.primaryLat"),
    lng: propPath(props, "lngField", "location.primaryLng"),
    serviceCities: propPath(props, "serviceCitiesField", "location.serviceCities"),
    serviceLocalities: propPath(props, "serviceLocalitiesField", "location.serviceLocalities"),
  };
  const country = getCountry(getAt<string>(values, "location.countryCode"));
  const changeCountry = (code: string) => {
    if (!code || code === country.code) return;
    setPath(form, "location.countryCode", code);
    for (const path of [p.city, p.state, p.locality, p.pincode]) setPath(form, path, "");
    setPath(form, p.lat, null);
    setPath(form, p.lng, null);
    setPath(form, p.serviceCities, []);
    setPath(form, p.serviceLocalities, []);
  };
  const city = getAt<string>(values, p.city) ?? "";
  const state = getAt<string>(values, p.state) ?? "";
  const locality = getAt<string>(values, p.locality) ?? "";
  const serviceCities = getAt<string[]>(values, p.serviceCities) ?? [];
  const serviceLocalities = getAt<string[]>(values, p.serviceLocalities) ?? [];
  const lat = getAt<number | null>(values, p.lat);
  const lng = getAt<number | null>(values, p.lng);
  const errs = form.formState.errors as Record<string, unknown>;
  const errAt = (path: string) => (getAt<{ message?: string }>(errs, path)?.message as string | undefined) ?? undefined;
  const isCompany = values.identity?.providerType === "COMPANY";
  const wholeState = state ? `${state} (entire state)` : "";

  const [serveEntireCity, setServeEntireCity] = useState(() => serviceLocalities.length === 0);

  const toggleCity = (c: string) =>
    setPath(form, p.serviceCities, serviceCities.includes(c) ? serviceCities.filter((x) => x !== c) : [...serviceCities, c]);

  return (
    <div className="space-y-5">
      <Field label="Country" required hint={country.code !== "IN" ? `Prices on your profile will be in ${country.currency} (${country.currencySymbol}).` : undefined}>
        {() => (
          <SearchableSelect
            value={country.code}
            onChange={changeCountry}
            options={COUNTRY_LIST.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
            placeholder="Select Country"
            searchPlaceholder="Search Country..."
            emptyMessage="No matching country found"
          />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isCompany ? "Head office city" : "City you work from"} required error={errAt(p.city)}>
          {() => (
            <PropertyListingCitySelector
              countryCode={country.code}
              value={city}
              selectedState={state}
              hasError={!!errAt(p.city)}
              placeholder="Search city"
              onChange={(c) => {
                setPath(form, p.city, c.name);
                if (c.name && !serviceCities.includes(c.name)) setPath(form, p.serviceCities, [c.name, ...serviceCities.filter((x) => x !== city)]);
                setPath(form, p.state, c.state ?? "");
                setPath(form, p.locality, "");
                setPath(form, p.lat, c.lat ?? null);
                setPath(form, p.lng, c.lng ?? null);
              }}
            />
          )}
        </Field>
        <Field label="Locality" required error={errAt(p.locality)} hint={!city ? "Pick a city first" : undefined}>
          {() => (
            <PropertyListingLocalitySelector
              countryCode={country.code}
              value={locality}
              cityName={city}
              selectedState={state}
              hasError={!!errAt(p.locality)}
              placeholder={city ? "Search locality" : "Select city first"}
              onChange={(l) => {
                setPath(form, p.locality, l.name);
                if (l.pincode && !getAt(values, p.pincode)) setPath(form, p.pincode, l.pincode);
                if (l.lat != null && l.lng != null) {
                  setPath(form, p.lat, l.lat);
                  setPath(form, p.lng, l.lng);
                }
              }}
            />
          )}
        </Field>
        <Field label="Street address" hint="Shown only as area on your public profile." className="sm:col-span-2">
          {(id) => (
            <input
              id={id}
              className={inputCls}
              placeholder="Building, street"
              value={getAt<string>(values, p.address) ?? ""}
              onChange={(e) => setPath(form, p.address, e.target.value)}
            />
          )}
        </Field>
        <Field label="Pincode">
          {(id) => (
            <input
              id={id}
              inputMode="numeric"
              maxLength={6}
              className={inputCls}
              placeholder="6 digits"
              value={getAt<string>(values, p.pincode) ?? ""}
              onChange={(e) => setPath(form, p.pincode, e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          )}
        </Field>
        {lat != null && lng != null && (
          <div className="flex items-end">
            <a
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 underline underline-offset-4"
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="size-4" /> Map pin set — check it
            </a>
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Where do you take projects?</p>
          <p className="text-xs text-slate-500">Clients searching these cities will see you. Add as many as you serve.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {city && (
            <Chip active={serviceCities.includes(city)} onClick={() => toggleCity(city)}>
              {city}
            </Chip>
          )}
          {wholeState && (
            <Chip active={serviceCities.includes(wholeState)} onClick={() => toggleCity(wholeState)}>
              Serve all of {state}
            </Chip>
          )}
          {serviceCities
            .filter((c) => c !== city && c !== wholeState)
            .map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-slate-900 py-1.5 pl-3.5 pr-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
                {c}
                <button type="button" aria-label={`Remove ${c}`} onClick={() => toggleCity(c)} className="rounded-full p-0.5 hover:bg-white/20">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
        </div>
        <div className="max-w-sm">
          <PropertyListingCitySelector
              countryCode={country.code}
            value=""
            placeholder="+ Add another city"
            onChange={(c) => c.name && !serviceCities.includes(c.name) && setPath(form, p.serviceCities, [...serviceCities, c.name])}
          />
        </div>
        {city && (
          <div className="space-y-3">
            <Toggle
              checked={serveEntireCity}
              onChange={(on) => {
                setServeEntireCity(on);
                if (on) setPath(form, p.serviceLocalities, []);
              }}
              label={`Serve all of ${city}`}
              hint="Turn off to list the localities you focus on."
            />
            {!serveEntireCity && (
              <Field label={`Localities you focus on in ${city}`} hint="Tap × on a chip to remove it.">
                {() => (
                  <div className="space-y-2">
                    {serviceLocalities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {serviceLocalities.map((l) => (
                          <span key={l} className="inline-flex items-center gap-1 rounded-full bg-slate-900 py-1 pl-3 pr-1 text-sm text-white dark:bg-white dark:text-slate-900">
                            {l}
                            <button type="button" aria-label={`Remove ${l}`} className="rounded-full p-0.5 hover:bg-white/20" onClick={() => setPath(form, p.serviceLocalities, serviceLocalities.filter((x) => x !== l))}>
                              <X className="size-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <PropertyListingLocalitySelector
              countryCode={country.code}
                      cityName={city}
                      selectedState={state}
                      multiple
                      values={serviceLocalities}
                      onValuesChange={(v) => setPath(form, p.serviceLocalities, v)}
                      placeholder="+ Add locality"
                    />
                  </div>
                )}
              </Field>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
