"use client";

import type { ClipboardEvent } from "react";
import { COUNTRIES, dialCodeFor } from "@/lib/start-project/countries";
import { formatNationalForDisplay, processPhoneInput } from "@/lib/start-project/phone-input";
import { describedBy, FormField } from "./shared/FormField";
import styles from "./PhoneCountryField.module.css";

interface PhoneCountryFieldProps {
  /** ISO 3166-1 alpha-2 code (e.g. "IN"), or "" if unselected. */
  country: string;
  /** The national number only — never includes the calling code. */
  phone: string;
  countryError?: string;
  phoneError?: string;
  onCountryChange: (iso2: string) => void;
  onPhoneChange: (nationalNumber: string) => void;
}

/**
 * Country + phone (W3.2A.1 §1–7) — the selected country owns the dialing
 * prefix (shown as a fixed, non-editable chip) so the visitor only ever
 * types their national number. All parsing/formatting/validation defers to
 * libphonenumber-js's real metadata (see lib/start-project/phone-input.ts
 * and validation.ts) rather than a hand-maintained country-rules table.
 */
export function PhoneCountryField({ country, phone, countryError, phoneError, onCountryChange, onPhoneChange }: PhoneCountryFieldProps) {
  const dialCode = dialCodeFor(country);

  const applyPhoneInput = (raw: string) => {
    const result = processPhoneInput(raw, country);
    if (result.detectedCountry && result.detectedCountry !== country) {
      onCountryChange(result.detectedCountry);
      onPhoneChange(formatNationalForDisplay(result.nationalDigits, result.detectedCountry));
      return;
    }
    onPhoneChange(formatNationalForDisplay(result.nationalDigits, country));
  };

  const handleCountryChange = (iso2: string) => {
    onCountryChange(iso2);
    // Re-evaluate (reformat) the digits already entered against the new
    // country rather than clearing them — the visitor's input stays
    // understandable, and the normal validation-on-continue flow will flag
    // it if it's no longer valid for the newly selected country (W3.2A.1 §6).
    if (phone.trim() !== "") {
      const digitsOnly = phone.replace(/\D/g, "");
      onPhoneChange(formatNationalForDisplay(digitsOnly, iso2));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    event.preventDefault();
    applyPhoneInput(pasted);
  };

  return (
    <div className={styles.row}>
      <FormField label="Country" htmlFor="country" required error={countryError}>
        <select
          id="country"
          name="country"
          autoComplete="country"
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          aria-invalid={!!countryError}
          aria-describedby={describedBy("country", { error: !!countryError })}
        >
          <option value="">Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Phone number" htmlFor="phone" required error={phoneError} helper="National number — the country prefix is added automatically.">
        <div className={styles.phoneInputRow}>
          <span className={styles.prefix} aria-hidden="true">
            {dialCode || "+—"}
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="88888 88888"
            value={phone}
            onChange={(e) => applyPhoneInput(e.target.value)}
            onPaste={handlePaste}
            aria-invalid={!!phoneError}
            aria-describedby={describedBy("phone", { helper: true, error: !!phoneError })}
          />
        </div>
      </FormField>
    </div>
  );
}
