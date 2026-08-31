const IDEMPOTENCY_KEY_STORAGE_KEY = "arooraa:start-project:idempotency-key:v1";

/**
 * One key per "intended enquiry" (W3.2B §23, §36–37): generated once, reused across
 * retries of a failed submission (so a retry after a network error replays safely
 * instead of risking a second row), and cleared only on real success or an explicit
 * "Start New Enquiry" — see clearIdempotencyKey. Session-scoped like the draft itself
 * (lib/start-project/session-draft.ts), not persisted beyond the browser tab.
 */
export function getOrCreateIdempotencyKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(IDEMPOTENCY_KEY_STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(IDEMPOTENCY_KEY_STORAGE_KEY, created);
    return created;
  } catch {
    // Private-browsing contexts can throw on storage access — fall back to a
    // key that's at least unique for this one submission attempt.
    return crypto.randomUUID();
  }
}

export function clearIdempotencyKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(IDEMPOTENCY_KEY_STORAGE_KEY);
  } catch {
    // Ignored — see getOrCreateIdempotencyKey.
  }
}
