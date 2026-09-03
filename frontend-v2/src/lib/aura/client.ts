import type {
  AuraAnswer,
  AuraConversation,
  AuraErrorKind,
  AuraResult,
  AuraSource,
} from "./types";

/**
 * The only place in the frontend that knows aura-service's HTTP shape. Components talk to this
 * interface, so a component never contains a URL, a status code or a JSON field name — and a test
 * substitutes a fake client rather than mocking `fetch`.
 *
 * <p>Failures come back as values, not exceptions, matching the Contact/Start-a-Project adapters
 * already in this codebase. The UI has to render something for every failure anyway, so making
 * them ordinary return values keeps that path impossible to forget.
 */
export interface AuraApiClient {
  createConversation(): Promise<AuraResult<AuraConversation>>;
  sendMessage(
    conversationId: string,
    message: string,
    currentPath: string | null,
  ): Promise<AuraResult<AuraAnswer>>;
}

/**
 * Same convention as the lead-service adapters: a relative same-origin path by default, which a
 * reverse proxy maps to the backend, and an absolute base URL for local development where there is
 * no proxy in front of `next dev`.
 *
 * In this repo `next dev` does have a proxy — next.config.ts rewrites `/api/aura/*` to
 * aura-service — so the default works locally with no environment variable and no CORS. Setting
 * NEXT_PUBLIC_AURA_API_BASE_URL points the browser straight at the backend instead, which then
 * needs AURA_CORS_ALLOWED_ORIGINS on that service.
 */
const API_BASE_PATH = process.env.NEXT_PUBLIC_AURA_API_BASE_PATH ?? "/api/aura";
const API_BASE_URL = process.env.NEXT_PUBLIC_AURA_API_BASE_URL ?? "";

export function auraConversationsUrl(): string {
  return API_BASE_URL ? `${API_BASE_URL}/api/v1/aura/conversations` : `${API_BASE_PATH}/conversations`;
}

/** The voice channel's routes, resolved the same way and through the same proxy (A5). */
export function auraVoiceUrl(resource: string): string {
  return API_BASE_URL
    ? `${API_BASE_URL}/api/v1/aura/voice/${resource}`
    : `${API_BASE_PATH}/voice/${resource}`;
}

/** A generous ceiling: real answers land around 1–4s, and a slow one is better than a false failure. */
const REQUEST_TIMEOUT_MS = 30_000;

const MESSAGES: Record<AuraErrorKind, string> = {
  NETWORK: "I can't reach AROORAA from here right now. Check your connection and try again?",
  TIMEOUT: "That took longer than I'd like and I lost the thread. Try asking me again?",
  CONVERSATION_NOT_FOUND: "I seem to have lost our thread. Let's start fresh — ask me again?",
  INVALID_INPUT: "That message is a bit long for me to take in one go. Could you shorten it?",
  RATE_LIMITED: "That's a lot at once — give me a moment and try again.",
  SERVER: "Something went wrong on my side. Give it a moment and try again?",
  UNAVAILABLE: "I'm not quite awake yet — my service doesn't seem to be running. Try again shortly?",
};

const RETRYABLE: Record<AuraErrorKind, boolean> = {
  NETWORK: true,
  TIMEOUT: true,
  CONVERSATION_NOT_FOUND: false,
  INVALID_INPUT: false,
  RATE_LIMITED: true,
  SERVER: true,
  UNAVAILABLE: true,
};

export function auraFailure(kind: AuraErrorKind): AuraResult<never> {
  return { ok: false, kind, message: MESSAGES[kind], retryable: RETRYABLE[kind] };
}

interface RawSource {
  title?: unknown;
  section?: unknown;
  sourceUrl?: unknown;
}

/**
 * Keeps only the three fields a citation is allowed to have, and only when they are strings. An
 * unexpected field in the response body is dropped here rather than reaching a component that
 * might render it.
 */
function toSources(raw: unknown): AuraSource[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is RawSource => typeof item === "object" && item !== null)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      section: typeof item.section === "string" ? item.section : null,
      sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl : null,
    }))
    .filter((source) => source.title.length > 0);
}

/** Only http(s) links are ever handed to the UI — no javascript:, data: or relative surprises. */
export function safeSourceUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://") ? trimmed : null;
}

async function requestJson(
  url: string,
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> | null } | { failed: AuraErrorKind }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    // An aborted request is our own timeout; anything else is the network or a service that is
    // simply not running, which is the single most likely local-development failure.
    return { failed: (error as Error)?.name === "AbortError" ? "TIMEOUT" : "NETWORK" };
  } finally {
    clearTimeout(timer);
  }

  const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: response.status, json };
}

function classify(status: number): AuraErrorKind {
  if (status === 404) return "CONVERSATION_NOT_FOUND";
  if (status === 400) return "INVALID_INPUT";
  if (status === 429) return "RATE_LIMITED";
  // The chat surface is conditional on the backend, so a 403 here means it is running with chat
  // switched off rather than that the visitor is forbidden anything.
  if (status === 403 || status === 503) return "UNAVAILABLE";
  return "SERVER";
}

export function createAuraApiClient(): AuraApiClient {
  return {
    async createConversation(): Promise<AuraResult<AuraConversation>> {
      const result = await requestJson(auraConversationsUrl(), {});
      if ("failed" in result) return auraFailure(result.failed);
      if (result.status !== 201 && result.status !== 200) return auraFailure(classify(result.status));

      const conversationId = result.json?.conversationId;
      if (typeof conversationId !== "string") return auraFailure("SERVER");
      return {
        ok: true,
        value: {
          conversationId,
          assistantProfile: String(result.json?.assistantProfile ?? ""),
          channel: String(result.json?.channel ?? ""),
        },
      };
    },

    async sendMessage(
      conversationId: string,
      message: string,
      currentPath: string | null,
    ): Promise<AuraResult<AuraAnswer>> {
      const result = await requestJson(`${auraConversationsUrl()}/${encodeURIComponent(conversationId)}/messages`, {
        message,
        // Context only. The backend treats it as a hint and never as authorization, and only the
        // pathname is ever sent — no query string, no page content, no DOM.
        currentPath: currentPath ?? undefined,
      });
      if ("failed" in result) return auraFailure(result.failed);
      if (result.status !== 200) return auraFailure(classify(result.status));

      const answer = result.json?.answer;
      if (typeof answer !== "string" || answer.trim().length === 0) return auraFailure("SERVER");
      const diagnostics = result.json?.diagnostics;
      const sequence = result.json?.sequence;
      return {
        ok: true,
        value: {
          conversationId,
          sequence: typeof sequence === "number" ? sequence : null,
          answer,
          sources: toSources(result.json?.sources),
          diagnostics:
            typeof diagnostics === "object" && diagnostics !== null
              ? (diagnostics as AuraAnswer["diagnostics"])
              : null,
        },
      };
    },
  };
}
