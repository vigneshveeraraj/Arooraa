const TRUNK = /^[6-9]\d{9}$/;

/**
 * Mirrors the backend's PhoneNumberNormalizer (com.arooraa.leads.service) so a number the
 * browser accepts is never rejected on the server: spaces and hyphens are ignored, an optional
 * +91 / 91 / leading 0 is dropped, and what remains must be a 10-digit mobile starting 6–9.
 * Returns the E.164 form, or null when the input is not a valid Indian mobile number.
 */
export function normalizeIndianMobile(raw: string): string | null {
  let digits = raw.trim().replace(/[\s-]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return TRUNK.test(digits) ? `+91${digits}` : null;
}
