/**
 * The wire and view types for Aura. Deliberately a narrow subset of what aura-service could
 * return: the backend already refuses to put retrieval internals on the wire, and this layer
 * declares no field for them either, so there is nowhere for a score, a chunk id or a knowledge
 * space to arrive even if a future backend change tried to send one.
 */

/** A public reference shown under a grounded answer. Never carries an internal identifier. */
export interface AuraSource {
  title: string;
  section?: string | null;
  sourceUrl?: string | null;
}

/**
 * Routing metadata the backend attaches only when its own diagnostics switch is on. Displayed
 * only behind a separate frontend flag, and never in a visitor-facing build.
 */
export interface AuraDiagnostics {
  mode?: string;
  evidenceLevel?: string;
  language?: string;
  tone?: string;
  latencyMs?: number;
  guardrail?: string | null;
  /**
   * Which approved AROORAA public names the backend understood the question to be about (A5.2).
   * Names only — the confidence behind them never leaves the service, and this whole object is
   * absent from any deployed build.
   */
  recognisedEntities?: string[];
}

export interface AuraAnswer {
  conversationId: string;
  /** Which turn this is, from the backend. What feedback names when it is given. */
  sequence: number | null;
  answer: string;
  sources: AuraSource[];
  diagnostics?: AuraDiagnostics | null;
}

export interface AuraConversation {
  conversationId: string;
  assistantProfile: string;
  channel: string;
}

/**
 * Why a call failed, in terms the UI can act on. Each kind maps to a different thing Aura says and
 * a different recovery: a lost conversation is re-created silently, a network blip offers a retry,
 * an oversized message tells the visitor to shorten it.
 */
export type AuraErrorKind =
  | "NETWORK"
  | "TIMEOUT"
  | "CONVERSATION_NOT_FOUND"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "SERVER"
  | "UNAVAILABLE";

export interface AuraFailure {
  ok: false;
  kind: AuraErrorKind;
  /** Already visitor-safe: written here, never taken from a backend error body. */
  message: string;
  /** Whether offering "Try again" makes sense for this failure. */
  retryable: boolean;
}

export interface AuraSuccess<T> {
  ok: true;
  value: T;
}

export type AuraResult<T> = AuraSuccess<T> | AuraFailure;

/** One turn as the panel renders it. `pending` marks a user message not yet acknowledged. */
export interface AuraTranscriptMessage {
  id: string;
  role: "user" | "aura";
  text: string;
  /** The backend turn this message is, when it has one. Null for anything rendered locally. */
  sequence?: number | null;
  sources?: AuraSource[];
  diagnostics?: AuraDiagnostics | null;
  failed?: boolean;
}
