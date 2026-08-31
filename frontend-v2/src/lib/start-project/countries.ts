import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

/**
 * A working country list for the Contact step's country selector (W3.2A
 * §16, §18; hardened in W3.2A.1 §3). Only names + ISO 3166-1 alpha-2 codes
 * are hand-maintained here — dialing prefixes and all phone-number
 * validation/formatting rules come from libphonenumber-js's real metadata
 * (see validation.ts), not a hand-typed table. Deliberately not defaulted
 * to India or any other country (§16: "Do not assume every visitor is in
 * India").
 */
export interface Country {
  name: string;
  iso2: CountryCode;
}

export const COUNTRIES: Country[] = [
  { name: "Afghanistan", iso2: "AF" },
  { name: "Australia", iso2: "AU" },
  { name: "Austria", iso2: "AT" },
  { name: "Bahrain", iso2: "BH" },
  { name: "Bangladesh", iso2: "BD" },
  { name: "Belgium", iso2: "BE" },
  { name: "Brazil", iso2: "BR" },
  { name: "Canada", iso2: "CA" },
  { name: "China", iso2: "CN" },
  { name: "Denmark", iso2: "DK" },
  { name: "Egypt", iso2: "EG" },
  { name: "Finland", iso2: "FI" },
  { name: "France", iso2: "FR" },
  { name: "Germany", iso2: "DE" },
  { name: "Hong Kong", iso2: "HK" },
  { name: "India", iso2: "IN" },
  { name: "Indonesia", iso2: "ID" },
  { name: "Ireland", iso2: "IE" },
  { name: "Israel", iso2: "IL" },
  { name: "Italy", iso2: "IT" },
  { name: "Japan", iso2: "JP" },
  { name: "Kenya", iso2: "KE" },
  { name: "Kuwait", iso2: "KW" },
  { name: "Malaysia", iso2: "MY" },
  { name: "Mexico", iso2: "MX" },
  { name: "Nepal", iso2: "NP" },
  { name: "Netherlands", iso2: "NL" },
  { name: "New Zealand", iso2: "NZ" },
  { name: "Nigeria", iso2: "NG" },
  { name: "Norway", iso2: "NO" },
  { name: "Oman", iso2: "OM" },
  { name: "Pakistan", iso2: "PK" },
  { name: "Philippines", iso2: "PH" },
  { name: "Poland", iso2: "PL" },
  { name: "Portugal", iso2: "PT" },
  { name: "Qatar", iso2: "QA" },
  { name: "Saudi Arabia", iso2: "SA" },
  { name: "Singapore", iso2: "SG" },
  { name: "South Africa", iso2: "ZA" },
  { name: "South Korea", iso2: "KR" },
  { name: "Spain", iso2: "ES" },
  { name: "Sri Lanka", iso2: "LK" },
  { name: "Sweden", iso2: "SE" },
  { name: "Switzerland", iso2: "CH" },
  { name: "Thailand", iso2: "TH" },
  { name: "Turkey", iso2: "TR" },
  { name: "United Arab Emirates", iso2: "AE" },
  { name: "United Kingdom", iso2: "GB" },
  { name: "United States", iso2: "US" },
  { name: "Vietnam", iso2: "VN" },
];

const NAME_BY_ISO2: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.iso2, c.name]));

export function countryNameFor(iso2: string): string | undefined {
  return NAME_BY_ISO2[iso2];
}

/** "+91", "+852", etc. — derived from libphonenumber-js's real metadata, never hand-typed. */
export function dialCodeFor(iso2: string): string {
  if (!iso2) return "";
  try {
    return `+${getCountryCallingCode(iso2 as CountryCode)}`;
  } catch {
    return "";
  }
}
