/**
 * W3.2D.1 — the admin fetch boundary: cookie/session-authenticated and
 * CSRF-protected, deliberately independent of lib/start-project's anonymous
 * public adapter (Phase 10: "Do not share public anonymous request
 * configuration with admin requests"). Same-origin relative base path — in
 * `next dev` this is proxied to the backend by next.config.ts's dev-only
 * rewrite; in production Nginx maps /api/admin/** -> the backend the same
 * way it always has (see ops/nginx/arooraa.com.conf). Admin routes are
 * never CORS-enabled (see backend SecurityConfig), so this must never be a
 * cross-origin fetch.
 */
const ADMIN_API_BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_API_BASE_PATH ?? "/api/admin";

export type AdminApiErrorKind =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NETWORK"
  | "SERVER";

export interface AdminApiError {
  kind: AdminApiErrorKind;
  message: string;
}

export type AdminApiResult<T> = { ok: true; data: T } | { ok: false; error: AdminApiError };

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  const value = match?.[1];
  return value !== undefined ? decodeURIComponent(value) : null;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Every admin request goes through here: same-origin credentials, the
 * CSRF double-submit header read straight from the cookie Spring Security
 * issues, and a single place that turns every non-2xx status into a plain,
 * typed error the UI can render without ever seeing a stack trace or a
 * backend-internal message.
 */
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<AdminApiResult<T>> {
  let response: Response;
  try {
    const csrfToken = readCookie("XSRF-TOKEN");
    response = await fetch(`${ADMIN_API_BASE_PATH}${path}`, {
      ...init,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
        ...init?.headers,
      },
    });
  } catch {
    return {
      ok: false,
      error: { kind: "NETWORK", message: "We couldn't reach the server. Check your connection and try again." },
    };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  if (response.ok) {
    return { ok: true, data: (await safeJson(response)) as T };
  }

  const body = (await safeJson(response)) as { message?: string } | null;

  switch (response.status) {
    case 401:
      return { ok: false, error: { kind: "UNAUTHENTICATED", message: body?.message ?? "Please log in again." } };
    case 403:
      return { ok: false, error: { kind: "FORBIDDEN", message: body?.message ?? "You do not have access to this." } };
    case 400:
      return { ok: false, error: { kind: "VALIDATION", message: body?.message ?? "Please correct the highlighted fields." } };
    case 404:
      return { ok: false, error: { kind: "NOT_FOUND", message: body?.message ?? "Not found." } };
    case 409:
      return {
        ok: false,
        error: { kind: "CONFLICT", message: "This lead was changed by someone else. Reload and try again." },
      };
    case 429:
      return {
        ok: false,
        error: { kind: "RATE_LIMITED", message: "Too many attempts. Please wait a few minutes and try again." },
      };
    default:
      return { ok: false, error: { kind: "SERVER", message: "Something went wrong on our end. Please try again shortly." } };
  }
}
