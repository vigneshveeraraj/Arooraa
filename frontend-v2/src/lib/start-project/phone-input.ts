import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/** Hard ceiling against absurd input ("888888888888888888888888") — the real,
 * country-specific length check still happens in validation.ts; this just
 * stops the raw digit count from growing unboundedly while typing/pasting. */
const MAX_RAW_DIGITS = 15;

export interface PhoneInputResult {
  /** The national number only — never includes the country calling code. */
  nationalDigits: string;
  /** Set only when a pasted/typed value included a country calling code
   * (typically via a leading "+") that resolves to a different country than
   * the one currently selected — e.g. pasting "+14155550132" while India is
   * selected. */
  detectedCountry?: CountryCode;
}

/**
 * Turns whatever the visitor typed or pasted into a clean national number
 * (W3.2A.1 §4–5). Delegates the hard part — telling a country calling code
 * apart from the start of a national number — to libphonenumber-js's real
 * metadata rather than a hand-written heuristic:
 *
 * - Plain digits with no country selected yet: kept as-is (nothing to
 *   validate against).
 * - Plain digits with a country selected ("9876543210"): parsed against
 *   that country; the library only strips a leading calling-code-shaped
 *   prefix once the sequence is actually long enough to resolve
 *   unambiguously (confirmed against partial-typing sequences — it never
 *   eats digits mid-type).
 * - A "+"-prefixed value ("+919876543210"): parsed on its own merits; if it
 *   belongs to a different country than the one selected, that country is
 *   reported back via `detectedCountry` so the caller can switch the
 *   dropdown instead of silently mismatching prefix and number.
 *
 * Never accepts letters — everything but digits and a single leading "+" is
 * discarded before parsing even starts.
 */
export function processPhoneInput(raw: string, selectedCountry: string): PhoneInputResult {
  const hasPlus = raw.trim().startsWith("+");
  const digitsOnly = raw.replace(/\D/g, "").slice(0, MAX_RAW_DIGITS);
  if (!digitsOnly) return { nationalDigits: "" };

  const candidate = hasPlus ? `+${digitsOnly}` : digitsOnly;
  const defaultCountry = selectedCountry ? (selectedCountry as CountryCode) : undefined;

  try {
    const parsed = parsePhoneNumberFromString(candidate, defaultCountry);
    if (parsed?.nationalNumber) {
      if (hasPlus && parsed.country && selectedCountry && parsed.country !== selectedCountry) {
        return { nationalDigits: parsed.nationalNumber, detectedCountry: parsed.country };
      }
      if (hasPlus && parsed.country && !selectedCountry) {
        return { nationalDigits: parsed.nationalNumber, detectedCountry: parsed.country };
      }
      return { nationalDigits: parsed.nationalNumber };
    }
  } catch {
    // Unparsable — fall through to the raw digits so validation (not this
    // function) is the single place that reports an error.
  }

  return { nationalDigits: digitsOnly };
}

/** Live "as you type" formatting for display only — the stored/validated
 * value is always the plain digit string from processPhoneInput. */
export function formatNationalForDisplay(nationalDigits: string, iso2: string): string {
  if (!iso2 || !nationalDigits) return nationalDigits;
  try {
    return new AsYouType(iso2 as CountryCode).input(nationalDigits);
  } catch {
    return nationalDigits;
  }
}
